from flask_login import LoginManager
from janus import app
from janus.models import User

login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
	return User.query.filter_by(_id=user_id).first()

login_manager.login_view = 'login'
