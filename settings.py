import os

# The following settings are mainly for tornado's
# internal settings

# Tornado debug setting
DEBUG = True

# Security about
XSRF_COOKIES = True

# Login url for auto jump
LOGIN_URL="/auth/nologin"

# Set file path
DIRNAME = os.path.dirname(__file__)
STATIC_PATH = os.path.join(DIRNAME, "public")
STATIC_URL_PREFIX = "/static/"
TEMPLATE_PATH = os.path.join(DIRNAME, "public/template")


# Some other settings
# Set log file prefix
LOG_FILE_PREFIX = os.path.join(DIRNAME, "logs/tornado.log")

# Set http server
LISTEN_PORT = 8000
LISTEN_ADDRESS = "127.0.0.1"

# Set mongodb
MONGODB_HOST = "127.0.0.1"
MONGODB_PORT = 27017
DB_CONTINUE = "continue"
COLL_BOOKS = "books"
COLL_MEMBERS = "members"
COLL_WUNDER = "wunbooks"
COLL_BORROW = "borrowbooks"
COLL_BLACK_LIST = "blacklist"
MAX_BOOKS_PER_PAGE = 8
