#!/usr/bin/env python
# coding: utf8

import sys

from flask import Flask, jsonify, request

from utils import json_abort
from models import *
from routes import *

# allow special characters (e.g. üäö ...)
reload(sys)
sys.setdefaultencoding('utf-8')

myLists = [
    List("Inbox", id = '0', revision='1'),
    List("University", id = '1', revision ='1')
]
tasklist = [
    Task('Think about lunch', myLists[0].id, id='0', status = Task.COMPLETED),
    Task('Backend developer', myLists[0].id, id='1', status = Task.NORMAL),
    Task('This is from ID 1', myLists[1].id, id='2', status = Task.COMPLETED)
]

# Note: Setting static_url_path to '' has the following effect:
#   - Whenever a file is requested and there is no matching route defined
#     the flask server will look whether the file is in the 'static/' folder
#   - As a consequence, everyone can remotely access files within 'static/'
#   - We need this, so that the front-end works properly.
app = Flask(__name__, static_url_path='')

from database import *

@app.route('/')
def root():
    return app.send_static_file('index.html')

#GET API Version
class Version():
    def __init__(self):
       self.version = 7.0

@app.route('/api/version', methods=['GET'])
def versionapi():
    v = Version()
    return jsonify(v.__dict__)

#GET all lists
@app.route('/api/lists', methods=['GET'])
def alllists():
    return jsonify(Inbox.__dict__)

#GET all tasks for a list
@app.route('/api/lists/<string:list_id>/tasks', methods=['GET'])
def alltasks(list_id):
    tasks = {}
    tasks['tasks'] = [l.__dict__ for l in tasklist if l.list == list_id]
    return jsonify(tasks)

#POST task to an existing list
@app.route('/api/lists/<string:list_id>/tasks', methods=['POST'])
def createtask(list_id):
    #list does not exist
    match = [l for l in myLists if l.id == list_id]
    if len(match) == 0:
        json_abort(404, 'List not found')

    #title does not exist
    data = request.get_json()
    title = data.get('title')
    if title == None:
        json_abort(400, 'No title')

    #increment task id
    task_id = max([int(i.id) for i in tasklist]+[-1])
    task_id += 1

    #define new task
    newTask = Task(title, list_id, task_id, status = Task.NORMAL)

    #append new task to tasklist
    tasklist.append(newTask)

    return jsonify(newTask.__dict__)

    # DELETE task in a list
@app.route('/api/lists/<string:list_id>/tasks/<string:task_id>', methods=['DELETE'])
def delete_task(list_id, task_id):
    # 1. list does not exist
    match = [l for l in myLists if l.id == list_id]
    if len(match) == 0:
        json_abort(404, 'List not found')

    # 2. Check whether the specified task exists
    tasks = [t for t in tasklist if t.list == list_id and t.list == task_id]
    if len(tasks) == 0:
        json_abort(404, 'Task not found')

    # 3. Delete the task
    #tasklist.remove(tasklist[tasks])
    tasklist.remove(tasks[0])

    return jsonify({'result': True})
    #return jsonify({tasklist[1].list + tasklist[2].id: True})

# UPDATE ROUTE
@app.route('/api/lists/<string:list_id>/tasks/<string:task_id>', methods=['PUT'])
def update_task(list_id, task_id):
    # 1. Check whether the specified list exists
    if (len([l for l in myLists if l.id == list_id]) < 1):
        json_abort(404, 'List not found')

    # 2. Check whether the specified task exists
    tasks = [t for t in tasklist if t.id == task_id and t.list == list_id]
    if (len(tasks) < 1):
        json_abort(404, 'Task not found')

    # 3. Check whether the required parameters have been sent
    try:
         data = request.get_json()
    except:
        json_abort(400, 'No JSON provided')

    if data == None:
        json_abort(400, 'Invalid Content-Type')

    title = data.get('title', None)
    status = data.get('status', None)
    description = data.get('description', None)
    due = data.get('due', None)
    revision = data.get('revision', None)

    if title == None or status == None or description == None or \
    due == None or revision == None:
        json_abort(400, 'Invalid request parameters')

    if revision < tasks[0].revision:
        json_abort(409, 'Newer version of task available')

    # TODO: ignoring 'list' for now. Implement moving tasks from one list to another
    tasks[0].title = title
    tasks[0].status = status
    tasks[0].description = description
    tasks[0].due = due
    tasks[0].revision = tasks[0].revision + 1

    return jsonify(tasks[0].__dict__)

