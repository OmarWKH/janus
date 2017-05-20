from flask_sqlalchemy import SQLAlchemy
from janus import app
import tempfile, os

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(tempfile.gettempdir(), 'test.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False # costly feature that is not used
db = SQLAlchemy(app)

class Story(db.Model):
	_id = db.Column(db.Integer, primary_key=True)
	json = db.Column(db.Text)

	def __repr__(self):
		return '<Story {!r}>'.format(self.id)

db.create_all()
