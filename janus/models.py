from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.orm.collections import attribute_mapped_collection
from janus import app
import tempfile, os
from werkzeug import generate_password_hash, check_password_hash
from datetime import datetime
from sqlalchemy.exc import OperationalError

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False # costly feature that is not used
db = SQLAlchemy(app)

app.config['IMAGE_FOLDER'] = os.path.join(app.static_folder, 'images')
app.config['MAX_CONTENT_LENGTH'] = 2 * 1024 * 1024 # 2 megabytes

class Story(db.Model):
	_id = db.Column(db.Integer, primary_key=True)
	author_id = db.Column(db.Integer, db.ForeignKey('user._id'), nullable=False)
	title = db.Column(db.String())
	published = db.Column(db.Boolean(), default=False, nullable=False)
	image_name = db.Column(db.String(), default='default.jpeg')
	create_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
	json = db.Column(db.Text, default='{ \"Events\" : [] }')

	author = db.relationship('User', backref=db.backref(
		'creations',
		collection_class=attribute_mapped_collection('_id'),
		cascade='all, delete-orphan'
		)
	)

	def __repr__(self):
		return '<Story {!r}>'.format(self._id)

# https://gist.github.com/joshfinnie/5cfbe51a80914da1aebe
class User(db.Model):
	_id = db.Column(db.Integer, primary_key=True)
	username = db.Column(db.String(), unique=True, nullable=False)
	email = db.Column(db.String(), unique=True, nullable=False)
	password_hash = db.Column(db.String())
	first_name = db.Column(db.String())
	last_name = db.Column(db.String())
	join_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
	
	saves = association_proxy(
		'saves_relationship', 'data', creator=lambda k, v: Save(story_id=k, data=v)
	)
	# creations (from Story.author relatinoship)

	def __init__(self, password, **kwargs):
		super(User, self).__init__(**kwargs)
		self.password_hash = generate_password_hash(password)

	def check_password(self, password):
		return check_password_hash(self.password_hash, password)

	@property
	def is_authenticated(self):
		return True

	@property
	def is_active(self):
		return True

	@property
	def is_anonymous(self):
		return False

	def get_id(self):
		return self._id

class Save(db.Model):
	user_id = db.Column(db.Integer, db.ForeignKey('user._id'), primary_key=True)
	story_id = db.Column(db.Integer, db.ForeignKey('story._id'), primary_key=True)
	data = db.Column(db.Text, nullable=False)
	
	user = db.relationship('User', backref=db.backref(
		'saves_relationship',
		collection_class=attribute_mapped_collection('story_id'),
		cascade='all, delete-orphan'
		)
	)
	story = db.relationship('Story')

	def __init__(self, story_id, data, **kwargs):
		super(Save, self).__init__(**kwargs)
		self.story_id = story_id
		self.data = data
