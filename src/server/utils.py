from flask import abort, jsonify, make_response

def json_abort(code, text):
    json = {
        'result': False,
        'error': {
            'status': code,
            'text': text
        }
    }
    abort(make_response(jsonify(json), code))
