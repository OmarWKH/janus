from janus import app, views, models, login_manager

## Run ##
if __name__ == '__main__':
	port = int(os.environ.get('PORT', 8080))
	host = os.environ.get('IP', '0.0.0.0')
	app.run(host=host, port=port, debug=True)