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


if __name__ == '__main__':
    init_db()
