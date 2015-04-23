#!/usr/bin/env python
# -*- coding: utf-8 -*-

# Import global settings
import settings as gsettings
from lib.base import BaseHandler, BaseStaticFileHandler
# Private new handler
from lib.book import V1_AddBookHandler
# Private old handler
from lib.book import (GetHandler, EditHandler,
                      DeleteHandler)
from lib.auth import (AuthHandler, LoginHandler,
                      LogoutHandler, RegisterHandler,
                      NologinHandler)
from lib.wunderlist import (WunEditHandler, GetWunBooksHandler,
                            VoteHandler)
from lib.search import SearchHandler
from lib import superuuid
# Public module
import tornado.locale
import tornado.httpserver
import tornado.ioloop
import tornado.web as web
import pymongo

from tornado.options import define, options

# Update some options with providing command arguments 
# can make debug easier
# Define server
define("port", default=gsettings.LISTEN_PORT, type=int, help="run on the given port")
# Define mongodb server
define("mongodb_host", default=gsettings.MONGODB_HOST, help="mongodb host")
define("mongodb_port", default=gsettings.MONGODB_PORT, help="mongodb port")
# Define DB
define("db_continue", default=gsettings.DB_CONTINUE, help="database name")


class Application(tornado.web.Application):
    def __init__(self):
        # Load global settings, then this variable-gsettings can be
        # used in tornado.web.RequestHandler with self.application.gsettings
        # and in tornado.web.Application with self.gsettings
        self.gsettings = gsettings

        handlers = [
            # Handler first request
            (r"/", MainHandler),
            # (r"/(.*\.html)", web.StaticFileHandler, {"path": "public"}),
            (r"/(.*\.html)", HtmlHandler),
            # Old API
            (r"/book/get", GetHandler),
            (r"/book/edit", EditHandler),
            (r"/book/delete", DeleteHandler),
            (r"/book/search", SearchHandler),
            (r"/auth/", AuthHandler),
            (r"/auth/login", LoginHandler),
            (r"/auth/nologin", NologinHandler),
            (r"/auth/logout", LogoutHandler),
            (r"/auth/register", RegisterHandler),
            (r"/wunderlist/get", GetWunBooksHandler),
            (r"/wunderlist/edit", WunEditHandler),
            (r"/wunderlist/vote", VoteHandler),
            # RESTful API
            (r"/v1/books/isbn/(.*)", V1_AddBookHandler)
            # Add new Handler HERE
        ]

        # These settings are for the tornado internal settings
        # and they should refer to global settings
        settings = {
            "login_url": self.gsettings.LOGIN_URL,
            "xsrf_cookies": self.gsettings.XSRF_COOKIES,
            # Suite to one instance
            "cookie_secret": superuuid.generate(),
            # favicon.ico robots.txt also direct into here
            "static_url_prefix": self.gsettings.STATIC_URL_PREFIX,
            "static_path": self.gsettings.STATIC_PATH,
            "static_handler_class": BaseStaticFileHandler,
            "debug": self.gsettings.DEBUG
        }
        tornado.web.Application.__init__(self, handlers, **settings)

        # Init database
        conn = pymongo.Connection(options.mongodb_host,
                                  options.mongodb_port)
        self.db = conn[options.db_continue]


class MainHandler(BaseHandler):
    def get(self):
        if self.get_current_user():
            self.redirect("/static/donate.html")
        else:
            self.redirect("/static/login.html")


class HtmlHandler(BaseHandler):
    def get(self, html_name):
        self.redirect("/static/" + html_name)


def main():
    # If DEBUG, then use pretty console log
    if gsettings.DEBUG is False:
        tornado.options.options.log_file_prefix = gsettings.LOG_FILE_PREFIX
    tornado.options.parse_command_line()
    http_server = tornado.httpserver.HTTPServer(Application())
    http_server.listen(options.port, address=gsettings.LISTEN_ADDRESS)
    tornado.ioloop.IOLoop.instance().start()


if __name__ == "__main__":
    main()
