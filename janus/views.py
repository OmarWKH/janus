from flask import render_template, redirect, url_for, request, flash, session
from flask_login import login_required, login_user, logout_user, current_user
from janus import app, login_manager
from janus.models import db, Story, User, Save
import json

## Tests
@app.route('/playtest')
def playtest():
	return render_template('playtest.html')

@app.route('/savetest')
def savetest():
	return \
		'''
		<form method="post" action="save_checkpoints">
		<input type="text" name="saves" value="{&quot;1&quot;:&quot;1&quot;, &quot;2&quot;:&quot;2&quot;}">
		<input type="submit" name="submit">
		</form>
		'''

## Main
@app.route('/list')
def list_stories():
	stories = Story.query.all()
	return render_template('list.html', stories=stories)

@app.route('/create', methods=['GET', 'POST'])
@login_required
def create_story():
	if request.method == 'POST':
		new_story = Story(json=request.form['story_json'])
		db.session.add(new_story)
		db.session.commit()
		flash("Created story")
		return redirect(url_for('list_stories'))
	return render_template('create.html')

@app.route('/play/<story_id>')
def play_story(story_id):
	story = Story.query.filter_by(_id=story_id).first_or_404()

	story_id = int(story_id)
	save = None
	if current_user.is_authenticated and story_id in current_user.saves:
		save = current_user.saves[story_id]

	return render_template('play.html', story=story, save=save)

@app.route('/save_checkpoints', methods=['POST'])
# @login_required, but don't want a redirect to /login
def save_checkpoints():
	user = current_user;

	if not user.is_authenticated:
		body = 'Login required'
		forbidden_status = 403 # https://httpstatuses.com/401
		return (body, forbidden_status)

	feedback = dict();
	saves = json.loads(request.values['saves'])
	for _id in saves:
		data = json.dumps(saves[_id]) 
		story = Story.query.filter_by(_id=_id).first()
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

## Users
@app.route('/register', methods=['GET', 'POST'])
def register():
	if request.method == 'POST':
		username = request.form['username']
		password = request.form['password']

		user = User(username=username, password=password)
		db.session.add(user)

		db.session.commit()
		flash("Registered")
		return redirect(url_for('login'))
	return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
	if current_user.is_authenticated:
		return redirect(url_for('list_stories'))

	if request.method == 'POST':
		username = request.form['username']
		password = request.form['password'] # should not be passed so plainly
		
		user = User.query.filter_by(username=username).first()
		if user:
			valid = user.check_password(password)
			if valid:
				login_user(user, remember=False)
				flash('Logged in')
				return redirect(url_for('list_stories'))

		flash('Wrong username or password')
	return render_template('login.html')

@app.route('/logout')
def logout():
	logout_user()
	flash("Logged out")
	return redirect(url_for('list_stories'))
