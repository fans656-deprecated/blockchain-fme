import grequests
from flask import request

import db
import conf
from assets import Transaction
from constants import NAME_TO_ID, MOCKED_PRICES
from utils import get_visitor


def get_raw_txs():
    txs = db.getdb().txs.find({}).sort([('owner', 1), ('tx', 1)])
    txs = [u'{:8}  {}'.format(tx['owner'], tx['tx']) for tx in txs]
    return u'<pre>{}</pre>'.format('\n'.join(txs))


def get_transactions(owner):
    txs = []
    for tx in db.get_txs(owner):
        try:
            tx.update(Transaction.parse(tx['tx']).as_dict())
            del tx['tx']
            txs.append(tx)
        except Exception:
            pass
    return {'transactions': txs}


def post_tx(owner):
    if get_visitor() != owner:
        return 'unauthorized', 401
    tx = request.data
    if not Transaction.is_valid(tx):
        return 'bad tx', 400
    tx_id = db.insert_tx(owner, tx)
    return tx_id


def put_tx(owner, tx_id):
    if get_visitor() != owner:
        return 'unauthorized', 401
    tx = request.data
    return db.update_tx(owner, tx_id, tx)


def delete_tx(owner, tx_id):
    if get_visitor() != owner:
        return 'unauthorized', 401
    db.remove_tx(owner, tx_id)


def get_prices():
    if conf.debugging:
        return MOCKED_PRICES
    coin_names = request.args.get('coins', '').split(',')
    coin_names = [name.lower() for name in coin_names]
    currencies = request.args.get('currencies', 'cny').split(',')
    prices = fetch_current_prices(coin_names, currencies)
    return {'prices': prices}


def fetch_current_prices(coin_names, currencies=('cny',)):
    url_base = 'https://api.coingecko.com/api/v3/coins/{}'
    coin_ids = [NAME_TO_ID.get(coin_name) for coin_name in coin_names]
    coin_ids = filter(bool, coin_ids)
    urls = [url_base.format(coin_id) for coin_id in coin_ids]
    ress = grequests.map(
        (grequests.get(url) for url in urls),
    )
    prices = []
    for res in ress:
        if not res or res.status_code != 200:
            continue
        data = res.json()
        coin_name = data['symbol']
        currency_to_price = data['market_data']['current_price']
        price = {
            'coin': coin_name,
            'prices': {
                currency: currency_to_price[currency]
                for currency in currencies
            }
        }
        prices.append(price)
    return {
        price['coin']: price for price in prices
    }
