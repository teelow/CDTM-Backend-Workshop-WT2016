import sqlite3

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

# TODO: Insert a new user
def db_add_user(name):
    # Save your SQL query as a string into the variable query
    query = ''

    db = get_db()
    cur = db.cursor()
    cur.execute(query, [name])
    db.commit()

# TODO: Insert a new cookie
def db_add_cookie(user_id, cookie_type):
    # Save your SQL query as a string into the variable query
    query = ''

    db = get_db()
    cur = db.cursor()
    cur.execute(query, [user_id, cookie_type])
    db.commit()


if __name__ == '__main__':
    init_db() # make sure we have a database

    db_add_user('Michael') # id should be 1
    # TODO: Add another user
    db_add_cookie(1, 'Chocolate Cookie')
    # TODO: Add some more cookies
