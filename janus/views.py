from flask import render_template, redirect, url_for, request
from janus import app
from janus.models import db, Story

@app.route('/playtest')
def playtest():
	return render_template('playtest.html')

@app.route('/list')
def list_stories():
	stories = Story.query.all()
	return render_template('list.html', stories=stories)

@app.route('/create', methods=['GET', 'POST'])
def create_story():
	if request.method == 'POST':
		new_story = Story(json=request.form['story_json'])
		db.session.add(new_story)
		db.session.commit()
		return redirect(url_for('list_stories'))
	return render_template('create.html')

@app.route('/play/<story_id>')
def play_story(story_id):
	return render_template('play.html', story_id=story_id)

@app.route('/story_json/<story_id>')
def story_json(story_id):
	story = Story.query.filter_by(id=story_id).first_or_404()
	json = story.json
	return json
