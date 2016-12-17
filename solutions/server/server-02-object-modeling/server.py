#!/usr/bin/env python
# coding: utf8

from flask import Flask, send_file
import sys

from task import Task
from list import List

# allow special characters (e.g. üäö ...)
reload(sys)
sys.setdefaultencoding('utf-8')

myList = List('Inbox', id='0')
myTasks = [
    Task('Think about lunch', '0', id='0', status = Task.COMPLETED),
    Task('Become a pro in backend development', '0', status= Task.NORMAL),
    Task('CONQUER THE WORLD!', '0', status = Task.NORMAL)
]

# Note: Setting static_url_path to '' has the following effect:
#   - Whenever a file is requested and there is no matching route defined
#     the flask server will look whether the file is in the 'static/' folder
#   - As a consequence, everyone can remotely access files within 'static/'
#   - We need this, so that the front-end works properly.
app = Flask(__name__, static_url_path='')

@app.route('/', methods=['GET'])
def frontEnd():
    return send_file('static/index.html')

if __name__ == '__main__':
    app.run(host='localhost', port=20002, debug=True)
