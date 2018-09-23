import os


debugging = os.path.exists('DEBUG')



host = os.environ.get('HOST') or '0.0.0.0'
port = int(os.environ.get('PORT', 4434))
