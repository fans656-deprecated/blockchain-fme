from flask import *

import db
import conf
import utils
from endpoints import endpoints


app = Flask(__name__, static_folder='../frontend/build')


@app.after_request
def after_request(r):
    if conf.debugging:
        r.headers['Cache-Control'] = 'no-cache'
    return r


app.teardown_appcontext(db.closedb)


for method, path, viewfunc in endpoints:
    viewfunc = utils.guarded(viewfunc)
    app.route(path, methods=[method])(viewfunc)


@app.route('/')
@app.route('/<path:path>')
def index(path='index.html'):
    if '..' in path:
        return 'not found', 404
    return send_from_directory('../frontend/build', path)


if __name__ == '__main__':
    app.run(
        host=conf.host,
        port=conf.port,
        threaded=True,
        debug=conf.debugging,
    )
