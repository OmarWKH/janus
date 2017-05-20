from flask import render_template
from janus import app

@app.route('/playtest')
def playtest():
	return render_template('playtest.html')
