from janus import models
import os, tempfile

def delete_db(db_path):
	if os.path.isfile(db_path):
		os.remove(db_path)

if __name__ == '__main__':
	db_path = os.path.join('janus', 'test.db')
	# db_path = os.path.join(tempfile.gettempdir(), 'test.db')

	delete_db(db_path)

	try:
		models.db.create_all()
	except OperationalError as oe:
		print(oe)
