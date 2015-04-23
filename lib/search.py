#!/usr/bin/env python
#-*- coding: utf-8 -*-

from base import BaseHandler
#import settings as gsettings
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
        settings = dict(
            debug=True
        )
        conn = pymongo.Connection("localhost", 27017)
        self.db = conn["continuetry"]
        tornado.web.Application.__init__(self, handlers, **settings)
'''

class SearchHandler(BaseHandler):
    def get(self):

        qs = self.get_argument("q", None)
        tag = self.get_argument("tag",None)
        start = self.get_argument("start",None)
        count = self.get_argument("count",None)
        #judge qs and tag
        if qs and not tag:
            search = qs
            tsearch = False
        elif tag and (not qs or qs):
            tsearch = tag
            search = False
        else:
            missing_args = {
                "errmsg": "missing_args",
                "errcode": 1
            }
            self.write(missing_args)
            return
        
        books_info = {"start":0,"count":20,"total":50,"books":[]}
        # coll = self.db["books"]
        sum_books_lst = []
        coll = self.db[self.gsettings.COLL_BOOKS]

        book_fields = ["isbn", "title", "alt", "author",
                       "publisher", "image", "price",
                       "isdonated", "donor"]
        
        #get total
        flag = []
        if tsearch:
            trexExp = re.compile('.*%s.*' % tsearch, re.IGNORECASE)
            for tkey in coll.find({"tags":{"$in":[trexExp]}}):
                if tkey["_id"] not in flag:
                    del tkey["_id"]
                    sum_books_lst.append(tkey)
        else: 
            rexExp = re.compile('.*%s.*' % search, re.IGNORECASE)  
            for bkey in book_fields:
                for ckey in coll.find({bkey:rexExp}):
                    if ckey["_id"] not in flag:
                        flag.append(ckey["_id"])
                        del ckey["_id"]
                        #self.write(ckey)
                        sum_books_lst.append(ckey)
        total_info = len(sum_books_lst)
        #self.write({"total":total_info})
        #return
        if total_info == 0:
            self.write(books_info)
            return
        #bad_offset = {"errmsg":"bad_offset","start":start,"count":0,"total":total_info}
        #if not isinstance(start,int) or not isinstance(count,int)
        try:
            start_info = 0 if not start or int(start) < 0 else total_info-1 if int(start) > total_info else int(start)
            count_info = 1 if not count or int(count) < 0 else 50 if int(count) > total_info else int(count)
            books_info["start"] = start_info
            books_info["count"] = count_info
            books_info["total"] = total_info
        except ValueError:
            bad_format = {
                    "errmsg":"start and count must be int",
                    "errcode":1
            }
            self.write(bad_format)
            return

        if (total_info - start_info) < count:
            for key in range(start_info,total_info):
                books_info["books"].append(sum_books_lst[key])
            self.write(books_info)
        else:
            for key in range(start_info,start_info+count_info):
                books_info["books"].append(sum_books_lst[key])
            self.write(books_info)
        sum_books_lst = []
        '''
        for key1 in coll.find({"title": rexExp}):
            lst1.append(key1)
        if len(lst1) != 0:
            for key in lst1:
                del key["_id"]
                self.write(key)
        else:
            for key2 in coll.find({"author": rexExp}):
                    lst2.append(key2)
            if len(lst2) != 0:
                for key in lst2:
                    del key["_id"]
                    self.write(key)
            else:
                for lstkey in book_fields_second:
                    for key3 in coll.find({lstkey: rexExp}):
                        lst3.append(key3)
                if len(lst3) != 0:
                    for key in lst3:
                        del key["_id"]
                        self.write(key)
                else:
                    not_find = {
                        "errmsg": "not_find",
                        "errcode": 1
                    }
                    self.write(not_find)
        '''
if __name__ == "__main__":
    tornado.options.parse_command_line()
    http_server = tornado.httpserver.HTTPServer(Application())
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()
