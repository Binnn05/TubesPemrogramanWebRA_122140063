from pyramid.response import Response
from pyramid.httpexceptions import HTTPFound, HTTPNotFound, HTTPBadRequest, HTTPForbidden
from sqlalchemy.exc import DBAPIError, InvalidRequestError
import transaction
from cornice import Service
from ..models import DBSession, Place, User, pwd_context

import os
import shutil
import uuid
import traceback
import cgi

PACKAGE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(PACKAGE_ROOT, 'static', 'uploads')

if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

ALLOWED_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.webp'}


def validate_admin_auth(request):
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        if token == 'dummy_admin_token':
            return True
    return False


login_service = Service(name='login', path='/api/login')


@login_service.post()
def login_user(request):
    print("--- LOGIN_USER FUNCTION CALLED ---")
    try:
        data = request.json_body
        username = data.get('username')
        password = data.get('password')
    except Exception:
        print("ERROR: login_user - Invalid JSON payload")
        raise HTTPBadRequest(detail="Format JSON payload tidak valid.")

    if not username or not password:
        print("ERROR: login_user - Missing username or password")
        raise HTTPBadRequest(detail="Username dan password harus diisi.")

    user = DBSession.query(User).filter_by(username=username).first()
    if user and user.check_password(password):
        print(f"INFO: login_user - Login berhasil untuk user: {username}")
        return Response(json_body={'message': 'Login successful', 'token': 'dummy_admin_token'}, status=200)

    print(f"ERROR: login_user - Login gagal untuk user: {username}")
    raise HTTPBadRequest(detail="Username atau password salah.")


places_service = Service(name='places', path='/api/places')


@places_service.get()
def get_places(request):
    print("--- GET_PLACES FUNCTION CALLED ---")
    try:
        places = DBSession.query(Place).order_by(Place.id).all()
        print(f"INFO: get_places - Ditemukan {len(places)} tempat.")
        return [place.to_dict() for place in places]
    except Exception as e:
        print(f"ERROR di get_places: {e}")
        traceback.print_exc()
        return Response(json_body={"detail": "Terjadi kesalahan saat mengambil daftar tempat."}, status=500)


@places_service.get(name='{id}')
def get_place(request):
    print("--- GET_PLACE (BY ID) FUNCTION CALLED ---")
    place_id_str = request.matchdict.get('id')
    try:
        place_id = int(place_id_str)
    except (ValueError, TypeError):
        print(f"ERROR: get_place - Invalid ID '{place_id_str}'")
        raise HTTPBadRequest(detail=f"ID tempat tidak valid: '{place_id_str}' bukan angka.")

    place = DBSession.query(Place).filter_by(id=place_id).first()
    if place is None:
        print(f"ERROR: get_place - Tempat ID {place_id} tidak ditemukan")
        raise HTTPNotFound(detail="Tempat tidak ditemukan di database.")

    print(f"INFO: get_place - Ditemukan tempat: {place.name}")
    return place.to_dict()


def _save_image(image_file_storage):
    print("--- _SAVE_IMAGE FUNCTION CALLED ---")
    if not hasattr(image_file_storage, 'file') or not image_file_storage.filename:
        print("DEBUG: _save_image - No valid file uploaded")
        return None

    filename = image_file_storage.filename
    file_extension = os.path.splitext(filename)[1].lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPBadRequest(detail=f"Tipe file gambar tidak valid. Hanya izinkan: {', '.join(ALLOWED_EXTENSIONS)}")

    unique_filename = str(uuid.uuid4()) + file_extension
    image_save_path = os.path.join(UPLOAD_DIR, unique_filename)

    try:
        with open(image_save_path, 'wb') as output_file:
            shutil.copyfileobj(image_file_storage.file, output_file)
        print(f"INFO: _save_image - File berhasil disimpan sebagai: {unique_filename}")
        return unique_filename
    except Exception as e:
        print(f"ERROR di _save_image: {e}")
        traceback.print_exc()
        raise HTTPBadRequest(detail="Terjadi kesalahan saat menyimpan gambar.")


@places_service.post(content_type='multipart/form-data')
def create_place(request):
    print("--- CREATE_PLACE FUNCTION CALLED ---")
    if not validate_admin_auth(request):
        raise HTTPForbidden(detail="Autentikasi diperlukan untuk operasi ini.")

    try:
        name = request.params.get('name')
        description = request.params.get('description', '')
        category = request.params.get('category')
        location = request.params.get('location')
        mapsEmbed = request.params.get('mapsEmbed', '')

        # Perbaikan deteksi file upload
        image_file_storage = request.POST.get('imageFile') or request.params.get('imageFile')

        if not name or not category or not location:
            raise HTTPBadRequest(detail="Nama, kategori, dan lokasi tempat harus diisi.")

        image_filename = _save_image(image_file_storage) if image_file_storage else None

        new_place = Place(
            name=name,
            description=description,
            category=category,
            location=location,
            image=image_filename,
            mapsEmbed=mapsEmbed
        )

        DBSession.add(new_place)
        DBSession.flush()
        response_data = new_place.to_dict()
        transaction.commit()

        print(f"INFO: Tempat '{name}' berhasil dibuat dengan ID {new_place.id}")
        return response_data
    except Exception as e:
        if transaction.isDoomed():
            transaction.abort()
        print(f"ERROR di create_place: {e}")
        traceback.print_exc()
        return Response(json_body={"detail": "Terjadi kesalahan saat membuat tempat."}, status=500)


@places_service.put(name='{id}', content_type='multipart/form-data')
def update_place(request):
    print("--- UPDATE_PLACE FUNCTION CALLED ---")
    if not validate_admin_auth(request):
        raise HTTPForbidden(detail="Autentikasi diperlukan untuk operasi ini.")

    place_id_str = request.matchdict.get('id')
    try:
        place_id = int(place_id_str)
    except (ValueError, TypeError):
        raise HTTPBadRequest(detail="ID tempat tidak valid untuk update.")

    place = DBSession.query(Place).filter_by(id=place_id).first()
    if place is None:
        raise HTTPNotFound(detail="Tempat tidak ditemukan untuk diupdate.")

    try:
        place.name = request.params.get('name', place.name)
        place.description = request.params.get('description', place.description)
        place.category = request.params.get('category', place.category)
        place.location = request.params.get('location', place.location)
        place.mapsEmbed = request.params.get('mapsEmbed', place.mapsEmbed)

        image_file_storage = request.POST.get('imageFile') or request.params.get('imageFile')
        if image_file_storage:
            new_image_filename = _save_image(image_file_storage)
            old_image_path = os.path.join(UPLOAD_DIR, place.image) if place.image else None
            place.image = new_image_filename
            if old_image_path and os.path.exists(old_image_path):
                os.remove(old_image_path)

        DBSession.flush()
        response_data = place.to_dict()
        transaction.commit()

        print(f"INFO: Tempat ID {place_id} berhasil diupdate.")
        return response_data
    except Exception as e:
        if transaction.isDoomed():
            transaction.abort()
        print(f"ERROR di update_place: {e}")
        traceback.print_exc()
        return Response(json_body={"detail": "Terjadi kesalahan saat mengupdate tempat."}, status=500)


@places_service.delete(name='{id}')
def delete_place(request):
    print("--- DELETE_PLACE FUNCTION CALLED ---")
    if not validate_admin_auth(request):
        raise HTTPForbidden(detail="Autentikasi diperlukan untuk operasi ini.")

    place_id_str = request.matchdict.get('id')
    try:
        place_id = int(place_id_str)
    except (ValueError, TypeError):
        raise HTTPBadRequest(detail="ID tempat tidak valid untuk dihapus.")

    place = DBSession.query(Place).filter_by(id=place_id).first()
    if place is None:
        raise HTTPNotFound(detail="Tempat tidak ditemukan untuk dihapus.")

    try:
        image_path = os.path.join(UPLOAD_DIR, place.image) if place.image else None
        DBSession.delete(place)

        if image_path and os.path.exists(image_path):
            os.remove(image_path)

        transaction.commit()
        print(f"INFO: Tempat ID {place_id} berhasil dihapus.")
        return Response(json_body={"message": "Tempat berhasil dihapus."}, status=200)
    except Exception as e:
        if transaction.isDoomed():
            transaction.abort()
        print(f"ERROR di delete_place: {e}")
        traceback.print_exc()
        return Response(json_body={"detail": "Terjadi kesalahan saat menghapus tempat."}, status=500)
