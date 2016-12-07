#!/usr/bin/env python
# coding: utf8

from flask import Flask, send_file, request, jsonify
import sys

from utils import json_abort

from task import Task
from list import List

# allow special characters (e.g. üäö ...)
reload(sys)
sys.setdefaultencoding('utf-8')

VERSION = 4.0

myLists = [
    List('Inbox', id='0'),
    List('Groceries', id='1')
]
myTasks = [
    Task('Think about lunch', '1', id='0', status = Task.COMPLETED),
    Task('Become a pro in backend development', '0', id='1', status= Task.NORMAL),
    Task('CONQUER THE WORLD!', '0', id='2', status = Task.NORMAL)
]

# Note: Setting static_url_path to '' has the following effect:
#   - Whenever a file is requested and there is no matching route defined
#     the flask server will look whether the file is in the 'static/' folder
#   - As a consequence, everyone can remotely access files within 'static/'
#   - We need this, so that the front-end works properly.
app = Flask(__name__, static_url_path='')

# MARK: Static routes
@app.route('/', methods=['GET'])
def frontEnd():
    return send_file('static/index.html')

# MARK: General routes
@app.route('/api/version', methods=['GET'])
def get_version():
    return jsonify({'version': VERSION})

# MARK: List routes
@app.route('/api/lists', methods=['GET'])
def get_lists():
    response = {}
    response['lists'] = [l.__dict__ for l in myLists]
    return jsonify(response)

# MARK: Task routes
@app.route('/api/lists/<string:list_id>/tasks', methods=['GET'])
def get_tasks(list_id):
    response = {}
    response['tasks'] = [t.__dict__ for t in myTasks if t.list==list_id]
    return jsonify(response)

# CREATE ROUTE
@app.route('/api/lists/<string:list_id>/tasks', methods=['POST'])
def create_task(list_id):
    ''' creates a new task for a list '''

    # 1. Check whether the specified list exists
    if (len([l for l in myLists if l.id == list_id]) < 1):
        json_abort(404, 'List not found')

    # 2. Check whether the required parameters have been sent
    try:
         data = request.get_json()
    except:
        json_abort(400, 'No JSON provided')

    if data == None:
        json_abort(400, 'Invalid Content-Type')

    title = data.get('title', None)
    if title == None:
        json_abort(400, 'Invalid request parameters')

    # 3. calculate the next id
    id = max([int(t.id) for t in myTasks]+[-1]) + 1
    newTask = Task(title, list_id, id=str(id), status = Task.NORMAL)

    # 4. append task to array
    myTasks.append(newTask)

    # 5. return new task
    return jsonify(newTask.__dict__)

if __name__ == '__main__':
    app.run(host='localhost', port=20004, debug=True)
