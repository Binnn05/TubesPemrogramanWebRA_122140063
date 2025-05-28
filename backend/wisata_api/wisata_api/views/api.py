# C:\PEMWEB\tubes\backend\wisata_api\wisata_api\views\api.py
from pyramid.response import Response
from pyramid.httpexceptions import HTTPFound, HTTPNotFound, HTTPBadRequest, HTTPForbidden
from sqlalchemy.exc import DBAPIError
import transaction
from cornice import Service
from ..models import DBSession, Place, User, pwd_context # Perhatikan ".." untuk import dari parent package (wisata_api.models)


# Fungsi Autentikasi Dasar
def validate_admin_auth(request):
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header == 'Bearer dummy_admin_token':
        return True
    return False

# API Login
login_service = Service(name='login', path='/api/login')

@login_service.post()
def login_user(request):
    username = request.json_body.get('username')
    password = request.json_body.get('password')

    user = DBSession.query(User).filter_by(username=username).first()

    if user and user.check_password(password):
        return Response(json_body={'message': 'Login successful', 'token': 'dummy_admin_token'}, status=200)

    raise HTTPBadRequest(detail="Invalid credentials")


# API untuk Places (CRUD)
places_service = Service(name='places', path='/api/places')

@places_service.get()
def get_places(request):
    try:
        places = DBSession.query(Place).order_by(Place.id).all()
        return [place.to_dict() for place in places]
    except DBAPIError:
        return Response(DBAPIError.__doc__, content_type='text/plain', status=500)

@places_service.get(renderer='json', name='{id}')
def get_place(request):
    place_id = request.matchdict['id']
    try:
        place = DBSession.query(Place).filter_by(id=place_id).first()
        if place is None:
            raise HTTPNotFound(detail="Place not found")
        return place.to_dict()
    except DBAPIError:
        return Response(DBAPIError.__doc__, content_type='text/plain', status=500)

@places_service.post()
def create_place(request):
    if not validate_admin_auth(request):
        raise HTTPForbidden("Authentication required for this operation")

    try:
        data = request.json_body
        new_place = Place(
            name=data['name'],
            description=data.get('description'),
            category=data.get('category'),
            location=data.get('location'),
            image=data.get('image'),
            mapsEmbed=data.get('mapsEmbed')
        )
        DBSession.add(new_place)
        transaction.commit()
        return new_place.to_dict()
    except KeyError:
        raise HTTPBadRequest(detail="Missing required fields: name is mandatory")
    except DBAPIError:
        transaction.abort()
        return Response(DBAPIError.__doc__, content_type='text/plain', status=500)

@places_service.put(name='{id}')
def update_place(request):
    if not validate_admin_auth(request):
        raise HTTPForbidden("Authentication required for this operation")

    place_id = request.matchdict['id']
    try:
        place = DBSession.query(Place).filter_by(id=place_id).first()
        if place is None:
            raise HTTPNotFound(detail="Place not found")

        data = request.json_body
        place.name = data.get('name', place.name)
        place.description = data.get('description', place.description)
        place.category = data.get('category', place.category)
        place.location = data.get('location', place.location)
        place.image = data.get('image', place.image)
        place.mapsEmbed = data.get('mapsEmbed', place.mapsEmbed)

        transaction.commit()
        return place.to_dict()
    except DBAPIError:
        transaction.abort()
        return Response(DBAPIError.__doc__, content_type='text/plain', status=500)

@places_service.delete(name='{id}')
def delete_place(request):
    if not validate_admin_auth(request):
        raise HTTPForbidden("Authentication required for this operation")

    place_id = request.matchdict['id']
    try:
        place = DBSession.query(Place).filter_by(id=place_id).first()
        if place is None:
            raise HTTPNotFound(detail="Place not found")

        DBSession.delete(place)
        transaction.commit()
        return Response(json_body={"message": "Place deleted successfully"}, status=200)
    except DBAPIError:
        transaction.abort()
        return Response(DBAPIError.__doc__, content_type='text/plain', status=500)