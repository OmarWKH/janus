@echo off
REM runs flask's development server, reference: http://flask.pocoo.org/docs/0.12/server/

where flask
if %ERRORLEVEL% neq 0 (
	echo  Either flask was not installed or you forgot to turn on your python virtual environment.
	echo  To install flask: 'pip install -r requirements.txt'
	echo   Make sure you are using the desired pytohn venv before installing.
	echo  To create a virtual environment, if desired: "https://docs.python.org/3/tutorial/venv.html"
) else (
	set FLASK_APP=app.py
	set FLASK_DEBUG=1
	flask run
)
