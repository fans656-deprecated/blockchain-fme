import json
import functools
import traceback
import datetime
import hashlib

import jwt
from flask import request

import conf
from errors import Error, InternalError


def guarded(viewfunc):
    @functools.wraps(viewfunc)
    def wrapped(*args, **kwargs):
        try:
            resp = viewfunc(*args, **kwargs)
            if not resp:
                return ''
            elif isinstance(resp, dict):
                return json.dumps(resp)
            else:
                return resp
        except Error as e:
            return e.resp
        except Exception:
            traceback.print_exc()
            return InternalError().resp
    return wrapped


def get_visitor():
    try:
        token = request.cookies.get('token')
        user = jwt.decode(token, conf.auth_pubkey, algorithm='RS512')
        return user['username']
    except Exception:
        traceback.print_exc()
        return None
