from pyramid.view import view_config
from pyramid.response import Response


@view_config(route_name='home', renderer='wisata_api:templates/mytemplate.jinja2')
def my_view(request):
    try:
        return {'one': None, 'project': 'wisata_api API'}
    except Exception as e:
        # Log error jika ada masalah lain saat render template
        print(f"Error di my_view default: {e}")
        return Response("Terjadi kesalahan pada server.", content_type='text/plain', status=500)