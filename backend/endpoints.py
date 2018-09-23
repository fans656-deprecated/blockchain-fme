import view


endpoints = [
    ('GET', '/txs', view.get_raw_txs),
    ('GET', '/api/transactions/<string:owner>', view.get_transactions),
    ('GET', '/api/prices', view.get_prices),
    ('POST', '/api/tx/<string:owner>', view.post_tx),
    ('PUT', '/api/tx/<string:owner>/<string:tx_id>', view.put_tx),
    ('DELETE', '/api/tx/<string:owner>/<string:tx_id>', view.delete_tx),
]
