#!/usr/bin/env python

from lib.base import BaseHandler

import tornado.locale
import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web

from datetime import datetime
from tornado.options import define, options
import pymongo


if __name__ == "__main__":
    define("port", default=8000, type=int, help="run on the given port")
    define("coll_wunder", default="wunbooks", help="wunder books collection")


class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
            (r"/wunderlist/search", WunSearchHandler),
            (r"/wunderlist/edit", WunEditHandler)
        ]
        # settings = dict(
        #     debug=True
        # )
        settings = {
            "debug": True
        }
        conn = pymongo.Connection("localhost", 27017)
        self.db = conn["continue"]
        tornado.web.Application.__init__(self, handlers, **settings)


class WunSearchHandler(BaseHandler):
    def get(self):
        isbn = self.get_argument("isbn", None)
        if not isbn:
            no_isbn = {
                "errmsg": "no_isbn",
                "errcode": 1
            }
            self.write(no_isbn)
            return
            
        coll = self.db[options.coll_books]
        coll_w = self.db[options.coll_wunder]

        book_in_books = coll.find_one({"isbn": isbn})
        book_in_wbooks = coll_w.find_one({"isbn": isbn})

        if book_in_books is not None:
            book_got = {
                "errcode": 1,
                "errmsg": "book_got"
            }
            self.write(book_got)
            return

        if book_in_wbooks is not None:
            book_exist = {
                "errcode": 1,
                "errmsg": "book_exist"
            }
            self.write(book_exist)
            return

        if book_in_books and book_in_wbooks is None:
            book_not_exist = {
                "errcode": 0
            }
            self.write(book_not_exist)


class WunEditHandler(BaseHandler):
    def post(self):
        isbn = self.get_argument("isbn", None)
        if not isbn:
            no_isbn = {
                "errmsg": "no_isbn",
                "errcode": 1
            }
            self.write(no_isbn)
            return

        book_fields = ["isbn", "title", "alt", "author",
                       "publisher", "image", "price", "tags"]
        # Wunder list database
        coll = self.db[options.coll_wunder]
        if isbn:
            wunbook = {}
            wunbook["voter"] = []
            wunbook["vote_count"] = 0

            for key in book_fields:
                wunbook[key] = self.get_argument(key, None)

            wunbook["created_at"] = datetime.now().__format__("%Y-%m-%d %H:%M:%S")
            coll.insert(wunbook)

            # Save success
            insert_sucs = {
                "errcode": 0
            }
            self.write(insert_sucs)


if __name__ == "__main__":
    tornado.options.parse_command_line()
    http_server = tornado.httpserver.HTTPServer(Application())
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()
