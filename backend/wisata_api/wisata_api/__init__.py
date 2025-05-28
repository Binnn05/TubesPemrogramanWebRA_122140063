# C:\PEMWEB\tubes\backend\wisata_api\wisata_api\__init__.py
from pyramid.config import Configurator
from sqlalchemy import engine_from_config
from .models import initialize_sql # Import initialize_sql dari package models
from cornice import Service
from pyramid.response import Response
from pyramid.view import view_config
import os


def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    engine = engine_from_config(settings, 'sqlalchemy.')
    initialize_sql(engine)

    config = Configurator(settings=settings)

    # Konfigurasi CORS
    config.add_directive('add_cors_preflight_handler', add_cors_preflight_handler)
    config.add_subscriber(add_cors_headers_response_callback, 'pyramid.events.NewResponse')

    config.include('cornice')

    config.add_route('home', '/')

    config.scan('.views') # Ini akan memindai semua views di dalam package 'views', termasuk 'api.py'

    return config.make_wsgi_app()

# --- Fungsi Pembantu CORS (Tambahkan di bawah main function di __init__.py) ---
def add_cors_preflight_handler(config):
    config.add_route('cors-preflight', '/{catch_all:.*}',
                     request_method='OPTIONS')
    config.add_view(cors_preflight_handler, route_name='cors-preflight')

def cors_preflight_handler(request):
    response = Response()
    response.headers['Access-Control-Allow-Origin'] = request.registry.settings.get('pyramid.origins', '*')
    response.headers['Access-Control-Allow-Methods'] = request.registry.settings.get('pyramid.cors.methods', 'GET,POST,PUT,DELETE,OPTIONS')
    response.headers['Access-Control-Allow-Headers'] = request.registry.settings.get('pyramid.cors.headers', 'Content-Type, Authorization, X-Requested-With')
    response.headers['Access-Control-Allow-Credentials'] = request.settings.get('pyramid.cors.credentials', 'false')
    return response

def add_cors_headers_response_callback(event):
    request = event.request
    response = event.response

    allowed_origins_str = request.registry.settings.get('pyramid.origins', '*')
    allowed_origins = [o.strip() for o in allowed_origins_str.split(',')]

    if '*' in allowed_origins or request.headers.get('Origin') in allowed_origins:
        response.headers['Access-Control-Allow-Origin'] = request.headers.get('Origin') or '*'
        response.headers['Access-Control-Allow-Methods'] = request.registry.settings.get('pyramid.cors.methods', 'GET,POST,PUT,DELETE,OPTIONS')
        response.headers['Access-Control-Allow-Headers'] = request.registry.settings.get('pyramid.cors.headers', 'Content-Type, Authorization, X-Requested-With')
        response.headers['Access-Control-Allow-Credentials'] = request.registry.settings.get('pyramid.cors.credentials', 'false')