import os
import pytest
import transaction
import json
from unittest.mock import patch

from pyramid.httpexceptions import HTTPForbidden, HTTPNotFound, HTTPBadRequest, HTTPInternalServerError

from backend.wisata_api.wisata_api import views
from wisata_api.models import Place, User #
from wisata_api.views.api import ( #
    login_user,
    get_places,
    get_place,
    create_place,
    update_place,
    delete_place,
    validate_admin_auth
)

@pytest.fixture
def dummy_admin_token():
    return "dummy_admin_token"

@pytest.fixture
def auth_headers(dummy_admin_token):
    return {'Authorization': f'Bearer {dummy_admin_token}'}

@pytest.fixture
def create_sample_place(dbsession):
    """Fixture untuk membuat data tempat contoh di database."""
    def _create_sample_place(name="Pantai Test", category="Wisata Pantai", location="Test Island"):
        place = Place(name=name, category=category, location=location, description="Deskripsi tes.", image="test.jpg")
        dbsession.add(place)
        dbsession.flush() 
        return place
    return _create_sample_place

@pytest.fixture
def create_admin_user(dbsession):
    user = dbsession.query(User).filter_by(username='admin').first()
    if not user:
        user = User(username='admin')
        user.set_password('admin') 
        dbsession.add(user)
        dbsession.flush()
    return user

class TestLoginAPI:
    def test_login_success(self, testapp, create_admin_user):
        """Test login berhasil."""
        payload = {'username': 'admin', 'password': 'admin'}
        res = testapp.post_json('/api/login', payload, status=200) #
        assert 'token' in res.json_body
        assert res.json_body['token'] == 'dummy_admin_token' #

    def test_login_failure_wrong_password(self, testapp, create_admin_user):
        """Test login gagal karena password salah."""
        payload = {'username': 'admin', 'password': 'wrongpassword'}
        testapp.post_json('/api/login', payload, status=400) #

    def test_login_failure_wrong_username(self, testapp):
        """Test login gagal karena username salah."""
        payload = {'username': 'wrongadmin', 'password': 'admin'}
        testapp.post_json('/api/login', payload, status=400) #

    def test_login_missing_fields(self, testapp):
        """Test login dengan field yang kurang."""
        testapp.post_json('/api/login', {'username': 'admin'}, status=400) #
        testapp.post_json('/api/login', {'password': 'admin'}, status=400) #
        testapp.post_json('/api/login', {}, status=400) #

    def test_login_invalid_json(self, testapp):
        """Test login dengan payload JSON tidak valid."""
        testapp.post('/api/login', 'not a json', headers={'Content-Type': 'application/json'}, status=400)

class TestPlacesAPI:

    def test_get_places_empty(self, testapp, dbsession):
        """Test mendapatkan daftar tempat ketika kosong."""
        res = testapp.get('/api/places', status=200) #
        assert res.json_body == []

    def test_get_places_with_data(self, testapp, dbsession, create_sample_place):
        """Test mendapatkan daftar tempat dengan data."""
        place1 = create_sample_place(name="Tempat A")
        place2 = create_sample_place(name="Tempat B")
        transaction.commit() 

        res = testapp.get('/api/places', status=200) #
        assert len(res.json_body) == 2
        assert res.json_body[0]['name'] == place1.name
        assert res.json_body[1]['name'] == place2.name

    def test_get_place_detail_success(self, testapp, dbsession, create_sample_place):
        """Test mendapatkan detail satu tempat."""
        place = create_sample_place(name="Detail Test")
        transaction.commit()

        res = testapp.get(f'/api/places/{place.id}', status=200) #
        assert res.json_body['name'] == "Detail Test"
        assert res.json_body['id'] == place.id

    def test_get_place_detail_not_found(self, testapp):
        """Test mendapatkan detail tempat yang tidak ada."""
        testapp.get('/api/places/9999', status=404) #

    def test_get_place_detail_invalid_id(self, testapp):
        """Test mendapatkan detail tempat dengan ID tidak valid."""
        testapp.get('/api/places/abc', status=400) #

    @patch('wisata_api.views.api._save_image', return_value='mocked_image.jpg')
    def test_create_place_success(self, mock_save_image, testapp, auth_headers, dbsession):
        """Test membuat tempat baru berhasil."""
        place_data = {
            'name': 'Tempat Baru',
            'category': 'Kuliner Test',
            'location': 'Lokasi Baru',
            'description': 'Deskripsi tempat baru.'
        }

        res = testapp.post('/api/places', place_data, headers=auth_headers, status=201) #

        assert res.json_body['name'] == 'Tempat Baru'
        assert 'id' in res.json_body
        mock_save_image.assert_not_called()

        created_place = dbsession.query(Place).filter_by(id=res.json_body['id']).first()
        assert created_place is not None
        assert created_place.name == 'Tempat Baru'

    @patch('wisata_api.views.api._save_image', return_value='mocked_image.jpg')
    def test_create_place_with_image_success(self, mock_save_image, testapp, auth_headers, dbsession):
        """Test membuat tempat baru dengan gambar berhasil."""

        place_data = {
            'name': 'Tempat Dengan Gambar',
            'category': 'Kategori Gambar',
            'location': 'Lokasi Gambar',
        }
       
        res = testapp.post('/api/places', place_data, headers=auth_headers, status=201) #
        assert res.json_body['name'] == 'Tempat Dengan Gambar'
        assert res.json_body['image'] is None 

    def test_create_place_unauthorized(self, testapp):
        """Test membuat tempat baru tanpa autentikasi."""
        place_data = {'name': 'Tempat Rahasia', 'category': 'Test', 'location': 'Test'}
        testapp.post('/api/places', place_data, status=403) #

    def test_create_place_missing_fields(self, testapp, auth_headers):
        """Test membuat tempat baru dengan field wajib yang kurang."""
        testapp.post('/api/places', {'name': 'Kurang Kategori'}, headers=auth_headers, status=400) #

    @patch('wisata_api.views.api._save_image', return_value='updated_mock_image.jpg')
    def test_update_place_success(self, mock_save_image, testapp, auth_headers, dbsession, create_sample_place):
        """Test update tempat berhasil."""
        place = create_sample_place(name="Awal")
        transaction.commit()

        update_data = {'name': 'Nama Diupdate', 'description': 'Deskripsi Diupdate'}
        res = testapp.put(f'/api/places/{place.id}', update_data, headers=auth_headers, status=200) #

        assert res.json_body['name'] == 'Nama Diupdate'
        assert res.json_body['description'] == 'Deskripsi Diupdate'
        mock_save_image.assert_not_called() 

        dbsession.expire(place) 
        updated_place = dbsession.query(Place).filter_by(id=place.id).first()
        assert updated_place.name == 'Nama Diupdate'

    @patch('wisata_api.views.api._save_image', return_value='new_image.jpg')
    @patch('os.remove') 
    @patch('os.path.exists', return_value=True) 
    def test_update_place_with_new_image(self, mock_exists, mock_os_remove, mock_save_image, testapp, auth_headers, dbsession, create_sample_place):
        """Test update tempat dengan gambar baru."""
        place = create_sample_place(name="Gambar Lama", image="old_image.jpg")
        transaction.commit()
        original_image_path = os.path.join(views.api.UPLOAD_DIR, "old_image.jpg") #

        update_data_form = {'name': 'Gambar Baru Update'}
        res = testapp.put(
            f'/api/places/{place.id}',
            params=update_data_form,
            headers=auth_headers,
            upload_files=[('imageFile', 'new_dummy.jpg', b'new_dummy_content')],
            status=200
        )

        assert res.json_body['name'] == 'Gambar Baru Update'
        assert res.json_body['image'] == 'new_image.jpg'
        mock_save_image.assert_called_once()
        mock_exists.assert_called_with(original_image_path) 
        mock_os_remove.assert_called_once_with(original_image_path) 

    def test_update_place_not_found(self, testapp, auth_headers):
        """Test update tempat yang tidak ada."""
        testapp.put('/api/places/9999', {'name': 'Tidak Ada'}, headers=auth_headers, status=404) #

    def test_update_place_unauthorized(self, testapp, dbsession, create_sample_place):
        """Test update tempat tanpa autentikasi."""
        place = create_sample_place()
        transaction.commit()
        testapp.put(f'/api/places/{place.id}', {'name': 'Update Rahasia'}, status=403) #

    @patch('os.remove') 
    @patch('os.path.exists', return_value=True) 
    def test_delete_place_success(self, mock_exists, mock_os_remove, testapp, auth_headers, dbsession, create_sample_place):
        """Test hapus tempat berhasil."""
        place = create_sample_place(image="image_to_delete.jpg")
        place_id = place.id
        image_file_name = place.image
        transaction.commit()
        
        image_path_to_delete = os.path.join(views.api.UPLOAD_DIR, image_file_name) #

        res = testapp.delete(f'/api/places/{place_id}', headers=auth_headers, status=200) #
        assert "berhasil dihapus" in res.json_body['message']

        deleted_place = dbsession.query(Place).filter_by(id=place_id).first()
        assert deleted_place is None
        
        mock_exists.assert_called_once_with(image_path_to_delete)
        mock_os_remove.assert_called_once_with(image_path_to_delete)


    def test_delete_place_not_found(self, testapp, auth_headers):
        """Test hapus tempat yang tidak ada."""
        testapp.delete('/api/places/9999', headers=auth_headers, status=404) #

    def test_delete_place_unauthorized(self, testapp, dbsession, create_sample_place):
        """Test hapus tempat tanpa autentikasi."""
        place = create_sample_place()
        transaction.commit()
        testapp.delete(f'/api/places/{place.id}', status=403) #