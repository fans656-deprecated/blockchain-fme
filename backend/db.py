import pymongo
from flask import g
from bson.objectid import ObjectId

import conf
from constants import TXS_TEXT


def getclient():
    if conf.debugging:
        return pymongo.MongoClient()
    if 'db' not in g:
        g.db = pymongo.MongoClient()
    return g.db


def getdb():
    return getclient().blockchain


def closedb(e=None):
    db = g.pop('db', None)
    if db:
        db.close()


def get_txs(owner):
    txs = list(getdb().txs.find({'owner': owner}))
    for tx in txs:
        tx['id'] = str(tx['_id'])
        del tx['_id']
    return txs


def insert_tx(owner, tx):
    tx_id = getdb().txs.insert({
        'owner': owner,
        'tx': tx,
    })
    return str(tx_id)


def update_tx(owner, tx_id, tx):
    getdb().txs.update({
        'owner': owner,
        '_id': ObjectId(tx_id),
    }, {
        'owner': owner,
        'tx': tx,
    });
    return tx_id


def remove_tx(owner, tx_id):
    getdb().txs.remove({
        'owner': owner,
        '_id': ObjectId(tx_id),
    })


def populate_db():
    getdb().txs.remove({})
    lines = TXS_TEXT.split('\n')
    for line in lines:
        parts = filter(bool, line.split('  '))
        parts = [part.strip() for part in parts]
        owner = parts[0]
        tx = '  '.join(parts[1:])
        insert_tx(owner, tx)


if __name__ == '__main__':
    #populate_db()
    r = getdb().txs.find({})
    for tx in r:
        print tx
