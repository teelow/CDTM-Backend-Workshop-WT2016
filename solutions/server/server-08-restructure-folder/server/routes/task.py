from flask import request, jsonify

from server import app
from server.utils import json_abort
from server.models import *

myLists = [
    List('Inbox', id='0'),
    List('Groceries', id='1')
]
myTasks = [
    Task('Think about lunch', '1', id='0', status = Task.COMPLETED),
    Task('Become a pro in backend development', '0', id='1', status= Task.NORMAL),
    Task('CONQUER THE WORLD!', '0', id='2', status = Task.NORMAL)
]

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

# DESTROY ROUTE
@app.route('/api/lists/<string:list_id>/tasks/<string:task_id>', methods=['DELETE'])
def remove_task(list_id, task_id):
    # 1. Check whether the specified list exists
    if (len([l for l in myLists if l.id == list_id]) < 1):
        json_abort(404, 'List not found')

    # 2. Check whether the specified task exists
    tasks = [t for t in myTasks if t.id == task_id and t.list == list_id]
    if (len(tasks) < 1):
        json_abort(404, 'Task not found')

    # 3. finally remove the task
    myTasks.remove(tasks[0])

    return jsonify({'result': True})

# UPDATE ROUTE
@app.route('/api/lists/<string:list_id>/tasks/<string:task_id>', methods=['PUT'])
def update_task(list_id, task_id):
    # 1. Check whether the specified list exists
    if (len([l for l in myLists if l.id == list_id]) < 1):
        json_abort(404, 'List not found')

    # 2. Check whether the specified task exists
    tasks = [t for t in myTasks if t.id == task_id and t.list == list_id]
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
