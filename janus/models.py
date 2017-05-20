from flask_sqlalchemy import SQLAlchemy
from janus import app

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite://' # in-memoty sqlite db
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False # costly feature that is not used
db = SQLAlchemy(app)
db.create_all()

class Story(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	json = db.Column(db.Text)

	def __repr__(self):
		return '<Story %r>'.format(self.id)
