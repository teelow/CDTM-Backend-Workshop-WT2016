import os

from server import *
from server.database import *
import config

def init_app():
    if config.DB_SEED:
        init_db()
    elif not os.path.isfile('task.db'):
        init_db()

    app.config['VERSION'] = config.VERSION

if __name__ == '__main__':
    init_app()
    app.run(host=config.HOST, port=config.PORT, debug=True)
