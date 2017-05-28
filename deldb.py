import os, tempfile

tempdb = os.path.join(tempfile.gettempdir(), 'test.db')
os.remove(tempdb)
