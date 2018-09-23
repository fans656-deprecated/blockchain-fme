import grequests
from flask import request

import db
from assets import Transaction
from constants import NAME_TO_ID
from utils import calc_tx_md5


def get_assets():
    owner = request.args.get('owner', 'fans656')


def get_transactions(owner):
    r = db.getdb().txs.find({'owner': owner}, {'_id': False})
    return {
        'transactions': [Transaction.parse(t['tx']).as_dict() for t in r]
    }
    txs = TXS.get(owner, [])
    return {'transactions': txs}


def add_tx(owner, tx):
    db.update_tx(owner, tx)


def delete_tx(owner, tx):
    db.getdb().txs.remove({
        'owner': owner,
        '_id': calc_tx_md5(tx),
    })


def get_prices():
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
