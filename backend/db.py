import pymongo


def getdb(g={}):
    if 'db' not in g:
        g['db'] = pymongo.MongoClient().blockchain
    return g['db']


def update_tx(owner, tx):
    md5 = calc_tx_md5(tx)
    getdb().txs.update({
        'owner': owner,
        '_id': md5,
    }, {
        'owner': owner,
        '_id': md5,
        'tx': tx,
    }, upsert=True)


if __name__ == '__main__':
    from constants import TXS
    from utils import calc_tx_md5

    #r = getdb().txs.find({})
    #for tx in r:
    #    print tx

    #getdb().txs.remove({})
    #for owner, lines in TXS.items():
    #    for tx in lines:
    #        update_tx(owner, tx)
