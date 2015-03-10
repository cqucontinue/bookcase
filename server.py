#!/usr/bin/env python
# -*- coding: utf-8 -*-

# Private module
from lib.book import (GetHandler, EditHandler,
                      DeleteHandler)
from lib.auth import (AuthHandler, LoginHandler,
                      LogoutHandler, RegisterHandler)
from lib import superuuid
# Public module
import tornado.locale
import tornado.httpserver
import tornado.ioloop
import tornado.web
import pymongo

from tornado.options import define, options

# DEFINE
define("port", default=8000, type=int, help="run on the given port")
define("mongodb_host", default="127.0.0.1", help="database host")
define("mongodb_port", default=27017, help="database port")
define("mongodb_db", default="continue", help="database name")


class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
            (r"/book/get", GetHandler),
            (r"/book/edit", EditHandler),
            (r"/book/delete/([0-9]+)", DeleteHandler),
            (r"/auth", AuthHandler),
            (r"/auth/login", LoginHandler),
            (r"/auth/logout", LogoutHandler),
            (r"/auth/register", RegisterHandler)
            # Add new Handler HERE
        ]
        settings = {
            "login_url": "/auth/login",
            # Suite to one instance
            "cookie_secret": superuuid.generate(),
            "debug": True
        }
        tornado.web.Application.__init__(self, handlers, **settings)

        conn = pymongo.Connection(options.mongodb_host,
                                  options.mongodb_port)
        self.db = conn[options.mongodb_db]


def main():
    tornado.options.parse_command_line()
    http_server = tornado.httpserver.HTTPServer(Application())
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()


if __name__ == "__main__":
    main()