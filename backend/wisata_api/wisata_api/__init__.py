# C:\PEMWEB\tubes\backend\wisata_api\wisata_api\__init__.py
from pyramid.config import Configurator
from sqlalchemy import engine_from_config
from .models import initialize_sql
from pyramid.response import Response
import logging

log = logging.getLogger(__name__)

def add_cors_preflight_handler(config):
    """
    Menambahkan route dan view untuk menangani CORS preflight (OPTIONS) request
    """
    config.add_route(
        'cors-preflight',
        '/{catch_all:.*}',
        request_method='OPTIONS'
    )
    config.add_view(
        cors_preflight_view,
        route_name='cors-preflight',
    )

def cors_preflight_view(request):
    """
    Menangani OPTIONS request untuk CORS preflight.
    Men-set header CORS yang sesuai berdasarkan konfigurasi settings.
    """
    print(f"--- CORS PREFLIGHT (OPTIONS) REQUEST RECEIVED FOR PATH: {request.path} ---", flush=True)
    print(f"--- Request Origin Header: {request.headers.get('Origin')} ---", flush=True)

    response = Response()
    request_origin = request.headers.get('Origin')
    allowed_origins_str = request.registry.settings.get('pyramid.origins', '')
    allowed_origins_list = [o.strip() for o in allowed_origins_str.split(',') if o.strip()]

    final_allowed_origin = None
    if '*' in allowed_origins_list:
        final_allowed_origin = '*'
    if request_origin in allowed_origins_list:
        final_allowed_origin = request_origin

    if final_allowed_origin:
        response.headers['Access-Control-Allow-Origin'] = final_allowed_origin

    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'

    response.headers['Access-Control-Allow-Headers'] = request.registry.settings.get(
        'pyramid.cors.headers', 'Content-Type,Authorization,X-Requested-With'
    )
    allow_credentials = request.registry.settings.get('pyramid.cors.credentials', 'false')
    response.headers['Access-Control-Allow-Credentials'] = allow_credentials

    # Jika credentials true, Access-Control-Allow-Origin TIDAK BOLEH '*'
    if allow_credentials == 'true' and response.headers.get('Access-Control-Allow-Origin') == '*':
        # Jika origin spesifik ada di daftar, gunakan itu
        if request_origin in allowed_origins_list:
            response.headers['Access-Control-Allow-Origin'] = request_origin
        else:
            # Jika origin tidak cocok, gunakan origin request jika ada
            if request_origin:
                response.headers['Access-Control-Allow-Origin'] = request_origin
            else:
                # Tidak set header sama sekali jika tidak aman
                del response.headers['Access-Control-Allow-Origin']

    response.headers['Access-Control-Max-Age'] = '86400'

    print(f"--- CORS PREFLIGHT RESPONSE HEADERS: {dict(response.headers)} ---", flush=True)
    response.status_int = 200
    return response

def add_cors_headers_response_callback(event):
    """
    Subscriber untuk menambahkan header CORS ke semua response yang bukan preflight
    """
    request = event.request
    response = event.response
    request_origin = request.headers.get('Origin')
    allowed_origins_str = request.registry.settings.get('pyramid.origins', '')
    allowed_origins_list = [o.strip() for o in allowed_origins_str.split(',') if o.strip()]

    final_allowed_origin = None
    if '*' in allowed_origins_list:
        final_allowed_origin = '*'
    if request_origin in allowed_origins_list:
        final_allowed_origin = request_origin

    if final_allowed_origin:
        allow_credentials = request.registry.settings.get('pyramid.cors.credentials', 'false')
        if allow_credentials == 'true':
            # Jika credentials true, origin tidak boleh '*'
            if final_allowed_origin != '*':
                response.headers['Access-Control-Allow-Origin'] = final_allowed_origin
            elif request_origin and request_origin in allowed_origins_list:
                response.headers['Access-Control-Allow-Origin'] = request_origin
            # else: tidak set header jika tidak aman
        else:
            # Jika credentials false, boleh '*'
            response.headers['Access-Control-Allow-Origin'] = final_allowed_origin

        # Hanya set Allow-Credentials jika header Allow-Origin diset
        if 'Access-Control-Allow-Origin' in response.headers:
            response.headers['Access-Control-Allow-Credentials'] = allow_credentials

def main(global_config, **settings):
    """
    Fungsi utama untuk menginisialisasi aplikasi Pyramid
    """
    # Setup engine database dan inisialisasi model
    engine = engine_from_config(settings, 'sqlalchemy.')
    initialize_sql(engine)

    config = Configurator(settings=settings)

    # Include jinja2 templating engine
    config.include('pyramid_jinja2')

    # Konfigurasi CORS
    config.add_directive('add_cors_preflight_handler', add_cors_preflight_handler)
    config.add_cors_preflight_handler()
    config.add_subscriber(add_cors_headers_response_callback, 'pyramid.events.NewResponse')

    # Include Cornice untuk REST API services
    config.include('cornice')
    
    # Static views
    # Untuk file statis aplikasi (CSS, JS, dll)
    config.add_static_view(name='static', path='wisata_api:static')

    # Untuk file upload user, misal gambar
    config.add_static_view(name='uploads', path='wisata_api:static/uploads')

    # Routes dasar dan scan views
    config.add_route('home', '/')

    config.scan('wisata_api.views')
    
    return config.make_wsgi_app()
