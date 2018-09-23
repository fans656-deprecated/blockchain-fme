import json
import functools
import traceback
import datetime
import hashlib

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


def calc_tx_md5(tx):
    return hashlib.md5('  '.join(tx.strip().split('  ')[:2])).hexdigest()
