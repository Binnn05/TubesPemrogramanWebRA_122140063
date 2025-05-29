from pyramid.view import view_config
from pyramid.response import Response
# Hapus import SQLAlchemyError dan models jika tidak digunakan lagi di file ini
# from sqlalchemy.exc import SQLAlchemyError
# from .. import models # Hapus atau sesuaikan jika MyModel tidak ada

@view_config(route_name='home', renderer='wisata_api:templates/mytemplate.jinja2')
def my_view(request):
    # Daripada melakukan query yang error, kita bisa kembalikan dictionary sederhana
    # atau data yang relevan untuk template mytemplate.jinja2 Anda.
    # Jika mytemplate.jinja2 tidak memerlukan data dinamis dari MyModel,
    # Anda bisa mengosongkan ini atau mengisinya dengan data statis.
    # Untuk sekarang, kita buat sederhana:
    # return {'project': 'wisata_api'}
    
    # Atau jika halaman utama hanya untuk API, Anda bisa tampilkan pesan sederhana:
    # return Response("API Server Wisata Sungailiat. Akses endpoint API yang sesuai.", content_type='text/plain')

    # Jika Anda masih memiliki mytemplate.jinja2 dan ingin tetap merendernya
    # tanpa MyModel:
    try:
        # Contoh jika Anda ingin menampilkan sesuatu yang lain atau tidak sama sekali
        # one = None # Atau data lain yang valid
        # Jika 'one' dan 'project' diharapkan oleh template:
        return {'one': None, 'project': 'wisata_api API'}
    except Exception as e:
        # Log error jika ada masalah lain saat render template
        print(f"Error di my_view default: {e}")
        return Response("Terjadi kesalahan pada server.", content_type='text/plain', status=500)


# Hapus db_err_msg jika tidak digunakan lagi
# db_err_msg = """..."""