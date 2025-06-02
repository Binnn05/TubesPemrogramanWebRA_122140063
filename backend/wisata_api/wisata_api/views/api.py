from pyramid.response import Response
from pyramid.httpexceptions import HTTPFound, HTTPNotFound, HTTPBadRequest, HTTPForbidden, HTTPInternalServerError
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
    print("--- LOGIN_USER FUNCTION CALLED ---", flush=True)
    try:
        data = request.json_body
        username = data.get('username')
        password = data.get('password')
    except Exception:
        print("ERROR: login_user - Invalid JSON payload", flush=True)
        raise HTTPBadRequest(detail="Format JSON payload tidak valid.")

    if not username or not password:
        print("ERROR: login_user - Missing username or password", flush=True)
        raise HTTPBadRequest(detail="Username dan password harus diisi.")

    user = DBSession.query(User).filter_by(username=username).first()
    if user and user.check_password(password):
        print(f"INFO: login_user - Login berhasil untuk user: {username}", flush=True)
        return Response(json_body={'message': 'Login successful', 'token': 'dummy_admin_token'}, status=200)

    print(f"ERROR: login_user - Login gagal untuk user: {username}", flush=True)
    raise HTTPBadRequest(detail="Username atau password salah.")


places_service = Service(name='places', path='/api/places')
place_detail_service = Service(name='place_detail', path='/api/places/{id}')


@places_service.get()
def get_places(request):
    print("--- GET_PLACES FUNCTION CALLED ---", flush=True)
    try:
        places = DBSession.query(Place).order_by(Place.id).all()
        print(f"INFO: get_places - Ditemukan {len(places)} tempat.", flush=True)
        return [place.to_dict() for place in places]
    except Exception as e:
        print(f"ERROR di get_places: {e}", flush=True)
        traceback.print_exc()
        raise HTTPInternalServerError(detail="Terjadi kesalahan saat mengambil daftar tempat.")


@place_detail_service.get()
def get_place(request):
    print("--- GET_PLACE (BY ID) FUNCTION CALLED ---", flush=True)
    place_id_str = request.matchdict.get('id')
    print(f"--- Path: {request.path}, Method: {request.method}, Matchdict ID: '{place_id_str}' ---", flush=True)
    try:
        place_id = int(place_id_str)
    except (ValueError, TypeError):
        print(f"ERROR: get_place - Invalid ID '{place_id_str}'", flush=True)
        raise HTTPBadRequest(detail=f"ID tempat tidak valid: '{place_id_str}' bukan angka atau tidak ada.")

    place = DBSession.query(Place).filter_by(id=place_id).first()
    if place is None:
        print(f"ERROR: get_place - Tempat ID {place_id} tidak ditemukan", flush=True)
        raise HTTPNotFound(detail=f"Tempat dengan ID {place_id} tidak ditemukan atau sudah dihapus sebelumnya.")

    print(f"INFO: get_place - Ditemukan tempat: {place.name}", flush=True)
    return place.to_dict()


def _save_image(image_file_storage):
    print("--- _SAVE_IMAGE FUNCTION CALLED ---", flush=True)
    if not isinstance(image_file_storage, cgi.FieldStorage) or \
       not image_file_storage.filename or \
       not hasattr(image_file_storage, 'file') or \
       image_file_storage.file is None:
        print("DEBUG: _save_image - Kondisi awal tidak terpenuhi. Mengembalikan None.", flush=True)
        return None

    filename = image_file_storage.filename
    print(f"DEBUG: _save_image - Memproses file: {filename}", flush=True)
    file_extension = os.path.splitext(filename)[1].lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPBadRequest(detail=f"Tipe file gambar tidak valid ({file_extension}). Hanya izinkan: {', '.join(ALLOWED_EXTENSIONS)}")

    unique_filename = str(uuid.uuid4()) + file_extension
    image_save_path = os.path.join(UPLOAD_DIR, unique_filename)

    try:
        if not hasattr(image_file_storage.file, 'read'):
            raise HTTPBadRequest(detail="Objek file gambar tidak valid atau rusak.")
        image_file_storage.file.seek(0)
        with open(image_save_path, 'wb') as output_file:
            shutil.copyfileobj(image_file_storage.file, output_file)
        print(f"INFO: _save_image - File berhasil disimpan sebagai: {unique_filename}", flush=True)
        return unique_filename
    except Exception as e:
        print(f"ERROR di _save_image saat menyimpan: {e}", flush=True)
        traceback.print_exc()
        raise HTTPInternalServerError(detail="Terjadi kesalahan internal saat menyimpan gambar.")

@places_service.post(content_type='multipart/form-data')
def create_place(request):
    print("--- CREATE_PLACE FUNCTION CALLED ---", flush=True)
    if not validate_admin_auth(request):
        raise HTTPForbidden(detail="Autentikasi diperlukan untuk operasi ini.")
    try:
        name = request.params.get('name')
        description = request.params.get('description', '')
        category = request.params.get('category')
        location = request.params.get('location')
        mapsEmbed = request.params.get('mapsEmbed', '')

        image_file_storage = None
        if 'imageFile' in request.POST and isinstance(request.POST['imageFile'], cgi.FieldStorage):
            image_file_storage = request.POST['imageFile']

        if not name or not category or not location:
            raise HTTPBadRequest(detail="Nama, kategori, dan lokasi tempat harus diisi.")

        image_filename = None
        if image_file_storage is not None and hasattr(image_file_storage, 'filename') and image_file_storage.filename:
            image_filename = _save_image(image_file_storage)

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
        
        place_id_for_log = new_place.id if hasattr(new_place, 'id') else 'N/A (belum ada ID setelah flush?)'

        transaction.commit()

        print(f"INFO: Tempat '{name}' berhasil dibuat dengan ID {place_id_for_log}", flush=True)
        
        request.response.status_int = 201
        return response_data

    except HTTPBadRequest as e:
        if transaction.isDoomed(): transaction.abort()
        raise e
    except Exception as e:
        if transaction.isDoomed(): transaction.abort()
        print(f"ERROR di create_place: {e}", flush=True)
        traceback.print_exc()
        detail_error = getattr(e, 'detail', "Terjadi kesalahan internal server saat membuat tempat.")
        if isinstance(e, (HTTPInternalServerError, HTTPForbidden, HTTPNotFound, HTTPBadRequest)):
            raise e
        raise HTTPInternalServerError(detail=detail_error)


@place_detail_service.put(content_type='multipart/form-data')
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
        raise HTTPNotFound(detail=f"Tempat dengan ID {place_id} tidak ditemukan untuk diupdate.")

    try:
        place.name = request.params.get('name', place.name)
        place.description = request.params.get('description', place.description if place.description else '')
        place.category = request.params.get('category', place.category)
        place.location = request.params.get('location', place.location)
        place.mapsEmbed = request.params.get('mapsEmbed', place.mapsEmbed if place.mapsEmbed else '')

        image_file_storage = None
        if 'imageFile' in request.POST and isinstance(request.POST['imageFile'], cgi.FieldStorage):
            image_file_storage = request.POST['imageFile']

        if image_file_storage and image_file_storage.filename:
            new_image_filename = _save_image(image_file_storage)
            if place.image and place.image != new_image_filename:
                old_image_path = os.path.join(UPLOAD_DIR, place.image)
                if os.path.exists(old_image_path):
                    try:
                        os.remove(old_image_path)
                        print(f"INFO: Gambar lama {place.image} berhasil dihapus.")
                    except OSError as e_remove:
                        print(f"WARNING: Gagal menghapus gambar lama {place.image}. Error: {e_remove}")
            place.image = new_image_filename

        DBSession.flush()
        response_data = place.to_dict()

        try:
            transaction.commit()
        except Exception as e:
            print(f"ERROR saat commit: {e}")
            transaction.abort()
            raise HTTPInternalServerError(detail="Gagal menyimpan perubahan.")

        print(f"INFO: Tempat ID {place_id} ('{place.name}') berhasil diupdate.")
        return response_data
    except HTTPBadRequest as e:
        if transaction.isDoomed(): transaction.abort()
        raise e
    


@place_detail_service.delete()
def delete_place(request):
    print("--- DELETE_PLACE FUNCTION CALLED ---", flush=True)
    if not validate_admin_auth(request):
        raise HTTPForbidden(detail="Autentikasi diperlukan untuk operasi ini.")

    place_id_str = request.matchdict.get('id')
    try:
        place_id = int(place_id_str)
    except (ValueError, TypeError):
        raise HTTPBadRequest(detail=f"Format ID tempat tidak valid: '{place_id_str}'. Harap gunakan angka.")

    place = DBSession.query(Place).filter_by(id=place_id).first()
    if place is None:
        print(f"INFO: delete_place - Tempat dengan ID {place_id} tidak ditemukan untuk dihapus.", flush=True)
        raise HTTPNotFound(detail=f"Tempat dengan ID {place_id} tidak ditemukan.")

    try:
        image_path_to_delete = os.path.join(UPLOAD_DIR, place.image) if place.image else None
        deleted_place_name = place.name
        DBSession.delete(place)
        
        transaction.commit()
        
        if image_path_to_delete and os.path.exists(image_path_to_delete):
            try:
                os.remove(image_path_to_delete)
                print(f"INFO: Gambar {image_path_to_delete} berhasil dihapus.", flush=True)
            except OSError as e:
                print(f"WARNING: Gagal menghapus file gambar {image_path_to_delete} setelah menghapus dari DB. Error: {e}", flush=True)
        
        print(f"INFO: Tempat '{deleted_place_name}' (ID: {place_id}) berhasil dihapus dari database.", flush=True)
        return Response(json_body={"message": f"Tempat '{deleted_place_name}' berhasil dihapus."}, status=200)
    
    except InvalidRequestError as e:
        if transaction.isDoomed(): transaction.abort()
        print(f"ERROR di delete_place (InvalidRequestError): {e}.", flush=True)
        raise HTTPNotFound(detail=f"Tempat dengan ID {place_id} tidak dapat diproses atau sudah dihapus.")
    except DBAPIError as e:
        if transaction.isDoomed(): transaction.abort()
        print(f"ERROR di delete_place (DBAPIError): {e}", flush=True)
        traceback.print_exc()
        raise HTTPInternalServerError(detail="Terjadi kesalahan pada database saat mencoba menghapus tempat.")
    except Exception as e:
        if transaction.isDoomed(): transaction.abort()
        print(f"ERROR di delete_place (Exception): {e}", flush=True)
        traceback.print_exc()
        detail_error = getattr(e, 'detail', "Terjadi kesalahan internal server saat menghapus tempat.")
        if isinstance(e, (HTTPInternalServerError, HTTPForbidden, HTTPNotFound, HTTPBadRequest)):
            raise e
        raise HTTPInternalServerError(detail=detail_error)