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


class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
            (r"/wunderlist/search",WunSearchHandler),
            (r"/wunderlist/edit",WunEditHandler)
        ]
        settings = dict(
            debug=True
        )
        conn = pymongo.Connection("localhost", 27017)
        self.db = conn["continuetry"]
        tornado.web.Application.__init__(self, handlers, **settings)


class WunSearchHandler(BaseHandler):
    def get(self):
        qs = self.get_argument("qs", None)
        if not qs:
            no_qs = {
                "errmsg": "no_qs",
                "errcode": 1
            }
            self.write(no_qs) 
            return
            
        coll = self.db["sbooks"]
        coll_second = self.db["bbooks"]
        #add two vote attribute
        book_fields = ["isbn", "vote_count","voter","title", 
                       "alt", "author",
                       "publisher", "image", "price",
                       "tags", "isdonated", "donor"]
        book_fields_two = ["isbn","voter","title", 
                       "alt", "author",
                       "publisher", "image", "price",
                       "tags", "isdonated", "donor"]
        lst2 = []
        lst3 = []

        for key2 in coll.find({"isbn": int(qs)}):
            lst2.append(key2)
        if len(lst2) != 0:
            for key in lst2:
                del key["_id"]
                self.write(key)
        else:
            for key3 in coll_second.find({"isbn":qs}):
                lst3.append(key3)
            if len(lst3) != 0:
                for key in lst3:
                    del key["_id"]
                    self.write(key)
            else:
                not_exist = {
                        "errmsg":"not_exist",
                        "errcode":1
                }
                self.write(not_exist)

class WunEditHandler(BaseHandler):
    def post(self):
        isbn = self.get_argument("isbn",None)
        if not isbn:
            no_isbn = {
                "errmsg":"no_isbn",
                "errcode":1
            }
            self.write(no_isbn)
            return

        Wunbook = {}
        lst = []
        Wunbook["voter"] = lst
        Wunbook["vote_count"] = 0
        for key in book_fields_two:
            if key == "voter":
                Wunbook[key].append(self.get_argument(key,None))
            else:
                Wunbook[key] = self.get_argument(key,None)
        Wunbook["created_at"] = datetime.now().__format__("%Y-%m-%d %H:%M:%S") 
        coll_second.insert(Wunbook)
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