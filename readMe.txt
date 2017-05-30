# Structure
- janus: Application code
-- static: CSS, JS, and images
-- templates: HTML templates

- setup_db.py: Set up the database
- run.bat: Runs the application (on Windows)
- app.py: Also runs the application (added to deploy on Heroku)

- Procfile, runtime.txt: For deployment on Heroku
- requirements.txt: Required python packages


# Requirements
- Python
- Python packages:
-- Flask
-- Flask-Login
-- Flask-SQLAlchemy
-- gunicorn (for running on Heroku)

## Installation
- Install python
- Install required packages with `pip install -r requirements.txt`


# Run
## Setup Database
`python setup_db.py`

## Run development server
- `run.bat` (on Windows)
-- or `python app.py`
- Open the URL printed in the command line
