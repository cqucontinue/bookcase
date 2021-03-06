#!/usr/bin/env python
#-*- coding: utf-8 -*-

from lib.base import BaseHandler

import re
import os.path
import json

import tornado.locale
import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web

from tornado.options import define, options
import pymongo

'''
if __name__ == "__main__":
    define("port", default=8000, type=int, help="run on the given port")


class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
            (r"/book/search",SearchHandler)
        ]
        gsettings = dict(
            debug=True
        )
        conn = pymongo.Connection("localhost", 27017)
        self.db = conn["continuetry"]
        tornado.web.Application.__init__(self, handlers, **gsettings)


if __name__ == "__main__":
    class BaseHandler(tornado.web.RequestHandler):
        pass
'''

class SearchHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        qs = self.get_argument("qs", None)
        if not qs:
            no_qs = {
                "errmsg": "no_qs",
                "errcode": 1
            }
            self.write(no_qs)
        # coll = self.db["books"]
        coll = self.db[self.gsettings.COLL_BOOKS]
        
        book_fields = ["isbn", "title", "alt", "author",
                       "publisher", "image", "price",
                       "tags", "owner", "isdonated", "donor"]

        books = []
        for book in coll.find({"$or": [
                                dict([(x, {"$regex": qs, "$options": "i"})])
                                 for x in book_fields
                                ]
                            }):
            book_extra_info = self.db[self.gsettings.COLL_BORROW].find_one({"book": book["isbn"]})
            if book_extra_info:
                book["borrow_status"] = 1
                book["borrow_user"] = book_extra_info["user"]
                book["return_time"] = book_extra_info["return_time"].__format__("%Y-%m-%d")
            else:
                book["borrow_status"] = 0
            del book["_id"]
            books.append(book)
        self.write({"books": books})


        # book_fields_second = ["isbn", "alt", 
        #                "publisher", "image", "price",
        #                "tags", "owner", "isdonated", "donor"]
        # lst1 = []
        # lst2 = []
        # lst3 = []

        # rexExp = re.compile('.*%s.*' % qs, re.IGNORECASE)
        # for key1 in coll.find({"title": rexExp}):
        #     lst1.append(key1)
        # if len(lst1) != 0:
        #     for key in lst1:
        #         del key["_id"]
        #         self.write(key)
        # else:
        #     for key2 in coll.find({"author": rexExp}):
        #             lst2.append(key2)
        #     if len(lst2) != 0:
        #         for key in lst2:
        #             del key["_id"]
        #             self.write(key)
        #     else:
        #         for lstkey in book_fields_second:
        #             for key3 in coll.find({lstkey: rexExp}):
        #                 lst3.append(key3)
        #         if len(lst3) != 0:
        #             for key in lst3:
        #                 del key["_id"]
        #                 self.write(key)
        #         else:
        #             not_find = {
        #                 "errmsg": "not_find",
        #                 "errcode": 1
        #             }
        #             self.write(not_find)

if __name__ == "__main__":
    tornado.options.parse_command_line()
    http_server = tornado.httpserver.HTTPServer(Application())
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()
