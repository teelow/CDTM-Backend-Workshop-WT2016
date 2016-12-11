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

# TODO: Get all the different cookie types
def db_get_cookie_types():
    # Save your SQL query as a string into the variable query
    query = ''

    db = get_db()
    cur = db.cursor()
    cur.execute(query)
    cookieTypes = []
    for row in cur:
        cookieTypes.append(dict_from_row(row).get('type'))
    return cookieTypes


if __name__ == '__main__':
    init_db() # make sure we have a clean database

    # Add some cookies to the databse
    db_add_user('Michael') # id should be 1
    db_add_cookie(1, 'Chocolate Cookie')
    db_add_cookie(1, 'Almond Cookie')
    db_add_cookie(1, 'Almond Cookie')
    db_add_cookie(1, 'Vanillekipferl')

    # Output should list cookie in alphabetical ordered w/o duplicates
    # e.g. [u'Almond Cookie', u'Chocolate Cookie', u'Vanillekipferl']
    print db_get_cookie_types()
