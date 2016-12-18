from flask import jsonify, send_file

from server import app

# MARK: Static routes
@app.route('/', methods=['GET'])
def frontEnd():
    return send_file('static/index.html')

# MARK: General routes
@app.route('/api/version', methods=['GET'])
def get_version():
    return jsonify({'version': app.config['VERSION']})
