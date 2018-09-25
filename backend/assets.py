# coding: utf-8
import datetime
from decimal import Decimal


DATETIME_FORMAT = '%Y-%m-%d %H:%M:%S'
FIAT_UNITS = set(['cny', 'usd'])
BASE_UNIT = 'cny'


class Transaction(object):

    @staticmethod
    def parse(s):
        s = s.strip()
        if s.startswith('#'):
            return None
        parts = s.split('  ')
        if len(parts) == 2:
            parts.append('')
        ctime_str, exchange_str, comment = parts
        ctime = datetime.datetime.strptime(ctime_str, DATETIME_FORMAT)
        if '=>' in exchange_str:
            tx_type = 'buy'
            src, dst= map(make_value, exchange_str.split('=>'))
        else:
            tx_type = 'sell'
            dst, src= map(make_value, exchange_str.split('<='))
        return Transaction(ctime, src, dst, comment)

    @staticmethod
    def is_valid(tx):
        try:
            Transaction.parse(tx)
            return True
        except Exception:
            return False

    def __init__(self, ctime, src, dst, comment):
        self.ctime = ctime
        self.src = src
        self.dst = dst
        self.comment = comment

    @property
    def type(self):
        is_fiat_src = self.src['unit'] in FIAT_UNITS
        is_fiat_dst = self.dst['unit'] in FIAT_UNITS
        if is_fiat_src and not is_fiat_dst:
            return 'buy'
        elif not is_fiat_src and is_fiat_dst:
            return 'sell'
        else:
            return 'exchange'

    def is_buy(self):
        return self.type == 'buy'

    def is_sell(self):
        return self.type == 'sell'

    def is_exchange(self):
        return self.type == 'exchange'

    def as_dict(self):
        return {
            'ctime': self.ctime.strftime(DATETIME_FORMAT),
            'src': {
                'amount': str(self.src['amount']),
                'unit': self.src['unit'],
            },
            'dst': {
                'amount': str(self.dst['amount']),
                'unit': self.dst['unit'],
            },
            'comment': self.comment,
        }

    def __str__(self):
        s


class Crypto(object):

    def __init__(self, unit):
        self.unit = unit
        self.amount = Decimal(0)
        self.gain = Decimal(0)
        self.cost = Decimal(0)
        self.txs = []

    @property
    def net_cost(self):
        return self.cost - self.gain

    @property
    def cost_price(self):
        net_cost = self.net_cost
        if net_cost <= 0:
            return Decimal(0)
        else:
            return net_cost / self.amount

    def __str__(self):
        return '{}: {:-10.2f} (+{:-10.2f} -{:-10.2f})'.format(
            self.unit,
            self.amount,
            self.gain,
            self.cost,
        )


class Fiat(object):

    def __init__(self, unit):
        self.unit = unit
        self.cost = Decimal(0)
        self.gain = Decimal(0)

    def __str__(self):
        return '{}: {:-10.2f} (+{:-10.2f} -{:-10.2f})'.format(
            self.unit,
            self.gain - self.cost,
            self.gain,
            self.cost,
        )


class Assets(object):

    def __init__(self):
        self.assets = {}

    def add_tx(self, tx):
        src = self.get_asset(tx.src['unit'])
        dst = self.get_asset(tx.dst['unit'])
        src_amount = tx.src['amount']
        dst_amount = tx.dst['amount']
        if tx.is_buy():
            src.cost += src_amount
            dst.cost += convert_fiat(tx.ctime, tx.src)
            dst.amount += dst_amount
        elif tx.is_sell():
            src.amount -= src_amount
            src.gain += convert_fiat(tx.ctime, tx.dst)
            dst.gain += dst_amount
        elif tx.is_exchange():
            cost = src.cost_price * src_amount
            src.amount -= src_amount
            src.cost -= cost
            dst.amount += dst_amount
            dst.cost += cost

    def get_asset(self, unit):
        if unit not in self.assets:
            if unit in FIAT_UNITS:
                asset = Fiat(unit)
            else:
                asset = Crypto(unit)
            self.assets[unit] = asset
        return self.assets[unit]

    def show(self):
        crypto_assets = []
        fiat_assets = []
        for asset in self.assets.values():
            if asset.unit in FIAT_UNITS:
                fiat_assets.append(asset)
            else:
                crypto_assets.append(asset)
        for asset in crypto_assets:
            print asset
        print '-' * 70
        base_asset = Fiat(BASE_UNIT)
        now = datetime.datetime.now()
        for asset in fiat_assets:
            base_asset.cost += convert_fiat(
                now, {'unit': asset.unit, 'amount': asset.cost}
            )
            base_asset.gain += convert_fiat(
                now, {'unit': asset.unit, 'amount': asset.gain}
            )
        print base_asset


def make_value(value_str):
    amount, unit = value_str.split()
    return {
        'amount': Decimal(amount),
        'unit': unit.lower(),
    }


def convert_fiat(ctime, value, base_unit=BASE_UNIT):
    unit = value['unit']
    amount = value['amount']
    if unit == base_unit:
        return amount
    else:
        return amount * 7 if base_unit == 'cny' else amount / 7


if __name__ == '__main__':
    lines = filter(bool, '''
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
    2018-09-23 11:07:15  1000 ADA => 1 BTC
    2018-09-23 11:08:42  10 USD => 1 FOO
    2018-09-23 11:08:42  20 USD <= 1 FOO
    '''.strip().split('\n'))

    txs = filter(bool, (Transaction.parse(line) for line in lines))

    assets = Assets()
    for tx in txs:
        assets.add_tx(tx)
    assets.show()
