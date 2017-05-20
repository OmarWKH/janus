from flask import render_template, redirect, url_for, request, flash
from flask_login import login_required, login_user, logout_user
from janus import app, login_manager
from janus.models import db, Story, User

## Tests
@app.route('/playtest')
def playtest():
	return render_template('playtest.html')

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
	return render_template('play.html', story_id=story_id)

## API
@app.route('/story_json/<story_id>')
def story_json(story_id):
	story = Story.query.filter_by(_id=story_id).first_or_404()
	json = story.json
	return json

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
	if request.method == 'POST':
		username = request.form['username']
		password = request.form['password'] # should not be passed so plainly
		user = User.query.filter_by(username=username).first_or_404()
		valid = user.check_password(password)
		if valid:
			login_user(user, remember=False)
			flash('Logged in')
			return redirect(url_for('list_stories'))
	return render_template('login.html')

@app.route('/logout')
def logout():
	logout_user()
	flash("Logged out")
	return redirect(url_for('list_stories'))
