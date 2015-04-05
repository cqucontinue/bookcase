#!/usr/bin/env python
# -*- coding: utf-8 -*-

# Private module
from lib.base import BaseHandler
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

# Define server
define("port", default=8000, type=int, help="run on the given port")
# Define mongodb server
define("mongodb_host", default="127.0.0.1", help="database host")
define("mongodb_port", default=27017, help="database port")
# Define DB and collections in mongodb
define("db_continue", default="continue", help="database name")
define("coll_books", default="books", help="book collection")
define("coll_members", default="members", help="basic member information collection")
define("coll_wunder", default="wunbooks", help="wunder books collection")


class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
            # Handler fisrt request
            (r"/", MainHandler),
            (r"/(.*\.html)", web.StaticFileHandler, {"path": "public"}),
            # API
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
            (r"/wunderlist/vote", VoteHandler)
            # Add new Handler HERE
        ]
        settings = {
            "login_url": "/auth/nologin",
            # TODO finish xrsf
            "xsrf_cookies": True,
            # Suite to one instance
            "cookie_secret": superuuid.generate(),
            # favicon.ico robots.txt also direct here
            "static_url_prefix": "/static/",
            "static_path": "public",
            "debug": True
        }
        tornado.web.Application.__init__(self, handlers, **settings)

        conn = pymongo.Connection(options.mongodb_host,
                                  options.mongodb_port)
        self.db = conn[options.db_continue]


class MainHandler(BaseHandler):
    def get(self):
        self.set_cookie("_xsrf", self.xsrf_token)
        if self.get_current_user():
            self.redirect("/donate.html")
        else:
            self.redirect("/login.html")


def main():
    tornado.options.parse_command_line()
    http_server = tornado.httpserver.HTTPServer(Application())
    http_server.listen(options.port, address="127.0.0.1")
    tornado.ioloop.IOLoop.instance().start()


if __name__ == "__main__":
    main()
