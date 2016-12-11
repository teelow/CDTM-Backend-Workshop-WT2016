from flask import g
import sqlite3

from server import app

# make sure to use this gets only called within app.app_context()
def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect('task.db')
        db.execute("PRAGMA foreign_keys = 1")
        db.row_factory = sqlite3.Row
    return db

def init_db():
    ''' Inititalizes the database '''
    with app.app_context():
        db = get_db()
        with app.open_resource('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()

def dict_from_row(row):
    ''' Converts a query result into a dict '''
    return {} if row == None else dict(zip(row.keys(), row))
