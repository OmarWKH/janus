from flask import Flask, render_template

app = Flask(__name__)


@app.route('/playtest')
def playtest():
	return render_template('playtest.html')
