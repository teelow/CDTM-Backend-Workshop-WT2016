import sqlite3
from challenge2 import db_add_user, db_add_cookie

DB = None

# make sure we connect only once to th database
def get_db():
    global DB
    db = DB
    if db == None:
        db = DB = sqlite3.connect('cookies.db')
        db.execute("PRAGMA foreign_keys = 1")
        db.row_factory = sqlite3.Row
    return db

def init_db():
    ''' Inititalizes the database '''
    db = get_db()
    with open('schema.sql', 'r') as f:
        db.cursor().executescript(f.read())
    db.commit()

def dict_from_row(row):
    ''' Converts a query result into a dict '''
    return {} if row == None else dict(zip(row.keys(), row))

# TODO: Update all cookies which are of type old with type new
def db_replace_cookie_type(old, new):
    # Save your SQL query as a string into the variable query
    query = ''

    db = get_db()
    cur = db.cursor()
    cur.execute(query, [old, new])
    db.commit()

if __name__ == '__main__':
    init_db() # make sure we have a clean database

    # Add some cookies to the databse
    db_add_user('Michael') # id should be 1
    db_add_cookie(1, 'Chocolate Cookie')
    db_add_cookie(1, 'Almond Cookie')
    db_add_cookie(1, 'Almond Cookie')
    db_add_cookie(1, 'Vanillekipferl')

    db_replace_cookie_type('Chocolate Cookie', 'Almond Cookie')
