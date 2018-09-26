import pymongo
from flask import g
from bson.objectid import ObjectId


def getclient():
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


if __name__ == '__main__':
    from constants import TXS

    txs = get_txs('tyn')
    for tx in txs:
        print tx

    #r = getdb().txs.find({})
    #for tx in r:
    #    print tx

    getdb().txs.remove({})
    for owner, lines in TXS.items():
        for tx in lines:
            insert_tx(owner, tx)
