from flask import render_template, redirect, url_for, request, flash, session, send_from_directory, abort
from flask_login import login_required, login_user, logout_user, current_user
from janus import app, login_manager
from janus.models import db, Story, User, Save
import json
from werkzeug.utils import secure_filename
from datetime import datetime
import os
from sqlalchemy.exc import IntegrityError

## Main
@app.route('/list')
def list_stories():
	stories = Story.query.filter_by(published=True)
	return render_template('list.html', stories=stories)

@app.route('/create', methods=['GET', 'POST'])
@login_required
def create_story():
	image_folder = app.config['IMAGE_FOLDER']
	image_extensions = set(['png', 'jpg', 'jpeg', 'gif'])
	# catch RequestEntityTooLarge, size is declared in models.py

	if request.method == 'POST':
		author = current_user
		title = request.form['title']
		published = 'published' in request.form
		json = request.form['story_json'] # to be removed, json creation is not done here

		image_name = 'default.jpeg'
		if 'image' in request.files:
			image = request.files['image']
			if image.filename != '' and allowed_image(image.filename):
				image_extension = extension(image.filename).lower()
				image_name = author.username + '.' + str(datetime.utcnow()) + '.' + image_extension
				image_name = secure_filename(image_name)
				image.save(os.path.join(image_folder, image_name))
				image.close()
		
		new_story = Story(author=author, title=title, published=published, image_name=image_name, json=json)
		db.session.add(new_story)
		db.session.commit()
		flash("Created story")
		return redirect(url_for('list_stories'))
	
	return render_template('create.html')

@app.route('/edit_story/<_id>')
@login_required
def edit_story(_id):
	story = Story.query.get_or_404(_id)
	if story.author == current_user:
		return render_template('edit_story.html', story=story)
	abort(404)

@login_required
@app.route('/save_story', methods=['POST'])
def save_story():
	story_id = request.values['id']
	story_json = request.values['json']
	
	story = Story.query.get_or_404(_id)
	if story.author == current_user:
		story.json = story_json
		db.session.add(story)
		db.session.commit()

		created_status = 201
		body = ''
		return (body, created_status)
	
	abort(404)

@app.route('/play/<story_id>')
def play_story(story_id):
	story = Story.query.get_or_404(story_id)

	if public_or_author(story):
		story_id = int(story_id)
		save = None
		if current_user.is_authenticated and story_id in current_user.saves:
			save = current_user.saves[story_id]

		return render_template('play.html', story=story, save=save)
	
	return abort(404)

@app.route('/save_checkpoints', methods=['POST'])
# @login_required, but don't want a redirect to /login
def save_checkpoints():
	user = current_user;

	if not user.is_authenticated:
		body = 'Login required'
		forbidden_status = 403 # https://httpstatuses.com/403
		return (body, forbidden_status)

	feedback = dict();
	saves = json.loads(request.values['saves'])
	for _id in saves:
		data = json.dumps(saves[_id]) 
		story = Story.query.get(_id)
		if story:
			save = Save.query.filter_by(user=user, story=story).first()
			if save:
				save.data = data # update existing
				feedback[_id] = 'updated'
			else:
				user.saves[_id] = data # add new
				feedback[_id] = 'created'
		else:
			feedback[_id] = 'ignored'
	db.session.add(user)
	db.session.commit()
	
	created_status = 201 # https://httpstatuses.com/201
	header = {'Content-Type': 'application/json'}
	return (json.dumps(feedback), created_status, header)

@app.route('/images/<name>')
def send_image(name):
	return send_from_directory(app.config['IMAGE_FOLDER'], name)

## Users
@app.route('/register', methods=['GET', 'POST'])
def register():
	if request.method == 'POST':
		success = True

		username = request.form['username']
		password = request.form['password']
		email = request.form['email']
		first_name = request.form['first_name']
		last_name = request.form['last_name']

		if username == '':
			flash('Username can not be empty')
			success = False;

		if email == '':
			flash('Email can no be empty')
			success = False

		user = User(username=username, password=password, email=email, first_name=first_name, last_name=last_name)
		db.session.add(user)

		if success:
			try:
				db.session.commit()
				flash("Registered")
			except IntegrityError as ie:
				arg = ie.args[0]
				offending_table = arg.rsplit(' ')[-1]
				offending_attribute = offending_table.rsplit('.')[1]
				# offending_value = ie.params[0]
				message = "{0} already exists".format(offending_attribute)
				flash(message)
				success = False

		if success:
			return redirect(url_for('login', username=username))
		else:
			return render_template('register.html', username=username, email=email, first_name=first_name, last_name=last_name)
	return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
	if current_user.is_authenticated:
		return redirect(url_for('list_stories'))

	if 'username' in request.values:
		username = request.values['username']
	else:
		username = ''

	if request.method == 'POST':
		password = request.form['password'] # should not be passed so plainly
		
		user = User.query.filter_by(username=username).first()
		if user:
			valid = user.check_password(password)
			if valid:
				login_user(user, remember=False)
				flash('Logged in')
				return redirect(url_for('list_stories'))

		flash('Wrong username or password')
	return render_template('login.html', username=username)

@app.route('/logout')
def logout():
	logout_user()
	flash("Logged out")
	return redirect(url_for('list_stories'))

@app.route('/profile/<username>')
def profile(username):
	user = User.query.filter_by(username=username).first()
	creations = user.creations
	filtered_creations = {_id: story for _id, story in creations.items() if public_or_author(story)}
	return render_template('profile.html', user=user, creations=filtered_creations)

## Helpers

# http://flask.pocoo.org/docs/0.12/patterns/fileuploads/
def allowed_image(image_name):
	image_extensions = set(['png', 'jpg', 'jpeg', 'gif'])
	return extension(image_name).lower() in image_extensions

def extension(filename):
	if '.' in filename:
		return filename.rsplit('.', 1)[1]
	return ''

def public_or_author(story):
	return story.published or (story.author == current_user)
