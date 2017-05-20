from flask import Flask
app = Flask(__name__)

from janus import views, models
