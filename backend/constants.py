# coding: utf-8
import json
#from assets import Transaction


with open('coin-list.json') as f:
    coin_list = json.load(f)


NAME_TO_ID = {c['symbol']: c['id'] for c in coin_list}


MOCKED_PRICES = {
  "prices": {
    "ltc": {
      "prices": {
        "cny": 423.53405258599213
      },
      "coin": "ltc"
    },
    "eos": {
      "prices": {
        "cny": 39.425006092357684
      },
      "coin": "eos"
    },
    "xlm": {
      "prices": {
        "cny": 1.7756662593445622
      },
      "coin": "xlm"
    },
    "bch": {
      "prices": {
        "cny": 3685.6250159172064
      },
      "coin": "bch"
    },
    "btc": {
      "prices": {
        "cny": 45156.992384539466
      },
      "coin": "btc"
    },
    "trx": {
      "prices": {
        "cny": 0.15145433201860836
      },
      "coin": "trx"
    },
    "eth": {
      "prices": {
        "cny": 1596.2354210951748
      },
      "coin": "eth"
    },
    "ada": {
      "prices": {
        "cny": 0.5863881964978159
      },
      "coin": "ada"
    },
    "xrp": {
      "prices": {
        "cny": 3.9699270437446748
      },
      "coin": "xrp"
    }
  }
}


TXS_TEXT = '''
fans656   2018-04-11 00:00:00  0 CNY => 0.00002895 BTC  OTCBTC送的
fans656   2018-04-11 08:25:00  104.13 CNY => 100 ADA
fans656   2018-04-12 22:31:00  135.32 CNY => 100 ADA
fans656   2018-04-12 22:37:00  135.31 CNY => 100 ADA
fans656   2018-08-01 21:48:00  686.49 CNY => 700 ADA
fans656   2018-08-31 00:46:00  1000 CNY => 0.02118973 BTC
fans656   2018-09-02 20:44:00  1174.45 CNY => 500.02 XRP
fans656   2018-09-02 22:58:00  1013.82 CNY => 0.503 ETH
fans656   2018-09-04 00:33:00  898.91 CNY => 2.01 LTC
fans656   2018-09-05 00:09:15  4020.04 CNY => 0.07978132 BTC
fans656   2018-09-12 13:12:53  436.61 CNY => 1000 ADA
fans656   2018-09-20 15:37:36  732.34 CNY => 20.1 EOS
fans656   2018-09-22 00:32:53  430 CNY <= 100 XRP
fans656   2018-09-25 11:47:42   131.09 CNY => 900 TRX
fans656   2018-09-25 11:48:15   145.67 CNY => 1000 TRX
fans656   2018-09-25 11:48:43   145.67 CNY => 1000 TRX
fans656   2018-09-25 11:49:11   177.99 CNY => 100 XLM
fans656   2018-09-25 11:49:29   150.24 CNY => 0.05 BCH
fans656   2018-09-25 13:33:07  949.5 CNY <= 300 XRP
tyn       2018-08-13 22:13:13  786 CNY => 1000 ADA
tyn       2018-09-12 21:13:28  430 CNY => 1000 ADA
'''.strip()
