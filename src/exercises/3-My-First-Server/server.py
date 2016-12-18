from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello World from Python'

@app.route('/cdtm')
def cdtm():
    return 'Mostly Awesome'

if __name__ == '__main__':
    addr = 'localhost' # the same as 127.0.0.1
    port = 1337
    debug = True
    app.run(host=addr, port=port, debug=debug)

