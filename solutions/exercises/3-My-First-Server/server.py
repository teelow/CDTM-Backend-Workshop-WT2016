from flask import Flask

# create a new server app
app = Flask(__name__)

# define all accessible routes
@app.route('/')
def hello_world():
    return 'Hello World!'

if __name__ == '__main__':
    addr = "localhost"         # the same as 127.0.0.1
    port = 1337                
    debug = True               # activates the [1] debugger, [2] automatic reloader
    app.run(host=addr, port=port, debug=debug)
