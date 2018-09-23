# coding: utf-8
import json
#from assets import Transaction


with open('coin-list.json') as f:
    coin_list = json.load(f)


NAME_TO_ID = {c['symbol']: c['id'] for c in coin_list}


def make_lines(text):
    return filter(bool, text.strip().split('\n'))


#def parse_transactions(text):
#    lines = filter(bool, text.strip().split('\n'))
#    txs = filter(bool, (Transaction.parse(line) for line in lines))
#    return [tx.as_dict() for tx in txs]


txs_fans656 = '''
2018-04-11 00:00:00  0 CNY => 0.00002895 BTC  OTCBTC送的
2018-04-11 08:25:00  104.13 CNY => 100 ADA
2018-04-12 22:31:00  135.32 CNY => 100 ADA
2018-04-12 22:37:00  135.31 CNY => 100 ADA
2018-08-01 21:48:00  686.49 CNY => 700 ADA
2018-08-31 00:46:00  1000 CNY => 0.02118973 BTC
2018-09-02 20:44:00  1174.45 CNY => 500.02 XRP
2018-09-02 22:58:00  1013.82 CNY => 0.503 ETH
2018-09-04 00:33:00  898.91 CNY => 2.01 LTC
2018-09-05 00:09:15  4020.04 CNY => 0.07978132 BTC
2018-09-12 13:12:53  436.61 CNY => 1000 ADA
2018-09-20 15:37:36  732.34 CNY => 20.1 EOS
2018-09-22 00:32:53  430 CNY <= 100 XRP
'''

txs_tyn = '''
2018-08-13 22:13:13  786 CNY => 1000 ADA
2018-09-12 21:13:28  430 CNY => 1000 ADA
'''


TXS = {
    'fans656': make_lines(txs_fans656),
    'tyn': make_lines(txs_tyn),
}
