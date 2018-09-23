import os


debugging = os.path.exists('DEBUG')


host = os.environ.get('HOST') or '0.0.0.0'
port = int(os.environ.get('PORT', 4434))

user_home_path = os.path.expanduser('~')
ssh_dir_path = os.path.join(user_home_path, '.ssh')
auth_pubkey_fpath = os.path.join(ssh_dir_path, 'id_rsa.pub')
auth_pubkey = open(auth_pubkey_fpath).read().strip()
