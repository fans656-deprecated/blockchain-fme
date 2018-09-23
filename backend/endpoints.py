import view


endpoints = [
    #('GET', '/api/assets', view.get_assets),
    ('GET', '/api/transactions/<string:owner>', view.get_transactions),
    ('GET', '/api/prices', view.get_prices),
    ('GET', '/api/tx/<string:owner>/<string:tx>', view.add_tx),
    ('DELETE', '/api/tx/<string:owner>/<string:tx>', view.delete_tx),
]
