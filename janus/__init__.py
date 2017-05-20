from flask import Flask
app = Flask(__name__)
app.secret_key = 'some_key' # do not commit an actual key to git

from janus import views, models, login_manager
