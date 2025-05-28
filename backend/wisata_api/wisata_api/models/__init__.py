# C:\PEMWEB\tubes\backend\wisata_api\wisata_api\models\__init__.py
from sqlalchemy import Column, Integer, Text, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import scoped_session, sessionmaker
from zope.sqlalchemy import register # BARIS INI BERUBAH: HANYA IMPORT 'register'
from passlib.context import CryptContext
import transaction

DBSession = scoped_session(sessionmaker()) # BARIS INI BERUBAH: Hapus 'extension=...'
register(DBSession) # BARIS BARU: Daftarkan DBSession

Base = declarative_base()

pwd_context = CryptContext(schemes=["pbkdf2_sha512"], deprecated="auto")

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    def set_password(self, password):
        self.password_hash = pwd_context.hash(password)

    def check_password(self, password):
        return pwd_context.verify(password, self.password_hash)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
        }

class Place(Base):
    __tablename__ = 'places'
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(100))
    location = Column(String(255))
    image = Column(String(255))
    mapsEmbed = Column(Text)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'location': self.location,
            'image': self.image,
            'mapsEmbed': self.mapsEmbed,
        }

def initialize_sql(engine):
    DBSession.configure(bind=engine)
    Base.metadata.bind = engine
    Base.metadata.create_all(engine)
    
    session = DBSession()
    if session.query(User).filter_by(username='admin').first() is None:
        admin_user = User(username='admin')
        admin_user.set_password('admin')
        session.add(admin_user)
        transaction.commit()
        print("Admin user 'admin' created with password 'admin'")
    else:
        print("Admin user 'admin' already exists.")
    session.close()