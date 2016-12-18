from utils import *

from server import app
from server.models import List


def db_list_exists(list_id):
    ''' Returns whether a certain list exists'''
    query = '''
        SELECT DISTINCT lists.id AS id
        FROM lists
        WHERE lists.id = ?
    '''
    with app.app_context():
        cur = get_db().cursor()
        cur.execute(query, [list_id])
        result = dict_from_row(cur.fetchone())
        return result.get('id') != None
    return False


def db_get_lists():
    ''' Queries the db for all lists'''
    query = '''

    '''

    with app.app_context():
        cur = get_db().cursor()
        cur.execute(query, [])
        lists = []
        for row in cur:
            l = List.fromDict(dict_from_row(row))
            if isinstance(l, List):
                lists.append(l)
        return lists
