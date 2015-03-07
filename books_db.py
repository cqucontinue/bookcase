#!/usr/bin/env python


import os.path
import json
from datetime import datetime

import tornado.locale
import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web


from tornado.options import define, options
import pymongo


define("port", default=8000, type=int, help="run on the given port")


class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
            (r"/book/edit", EditHandler),
            (r"/book/insert", InsertHandler),
            (r"/book/update", UpdateHandler),
            (r"/book/delete", DeleteHandler),
            (r"/book/get", GetHandler)
        ]
        settings = {
            "debug": True
        }
        conn = pymongo.Connection("localhost", 27017)
        self.db = conn["continue"]
        tornado.web.Application.__init__(self, handlers, **settings)
        
        
# class BaseHandler(tornado.web.RequestHandler):
    # def initialize(self, db):
    #    self.db = db
    # (r"/", BaseHandler, dic(db=new db))
    
    # def prepare():
        


class EditHandler(tornado.web.RequestHandler):
    def post(self):
        coll = self.application.db.books        # Prepare database
        book_fields = ["isbn", "title", "alt", "author",
                       "publisher", "image", "price",
                       "tags", "owner", "isdonated", "donor"]
        isbn = self.get_argument("isbn", None)
        if not isbn:
            no_isbn = {
                          "msg": "no_isbn",
                          "code": 1
                      }
            self.write(no_isbn)
        book = coll.find_one({"isbn": isbn})
        if book != None:
            # If book exist, update infomation
            for key in book_fields:
                if book[key] == None:
                    book[key] = self.get_argument(key, None)
            book["updated_at"] = datetime.now().__format__("%Y-%m-%d %H:%M:%S")
            coll.save(book)
            # Update success
            update_sucs = {
                              "msg": "",
                              "code": 0
                          }
            self.write(update_sucs)
        else:
            book = {}
            # If book not found, add the book
            for key in book_fields:
                book[key] = self.get_argument(key, None)
            book["created_at"] = datetime.now().__format__("%Y-%m-%d %H:%M:%S")
            book["updated_at"] = datetime.now().__format__("%Y-%m-%d %H:%M:%S")
            coll.insert(book)
            # Save success
            insert_sucs = {
                              "msg": "",
                              "code": 0
                          }
            self.write(insert_sucs)


class InsertHandler(tornado.web.RequestHandler):
    def post(self):
        coll = self.application.db.books        # Prepare database
        book_fields = ["isbn", "title", "alt", "author",
                       "publisher", "image", "price",
                       "tags", "owner", "isdonated", "donor"]
        book = {}
        isbn = self.get_argument("isbn", None)
        if not isbn:
            no_isbn = {
                          "msg": "no_isbn",
                          "code": 1
                      }
            self.write(no_isbn)
        if coll.find_one({"isbn": isbn}) != None:
            # Book exist, return error
            book_exist = {
                             "msg": "book_exist",
                             "code": 1
                         }
            self.write(book_exist)
        else:    
            # Prepare the new book
            for key in book_fields:
                book[key] = self.get_argument(key, None)
            book["created_at"] = datetime.now().__format__("%Y-%m-%d %H:%M:%S")
            book["updated_at"] = datetime.now().__format__("%Y-%m-%d %H:%M:%S")
            coll.insert(book)
            # Save success
            insert_sucs = {
                              "msg": "",
                              "code": 0
                          }
            self.write(insert_sucs)


class UpdateHandler(tornado.web.RequestHandler):
    def post(self):
        coll = self.application.db.books        # Prepare database
        book_fields = ["isbn", "title", "alt", "author",
                       "publisher", "image", "price",
                       "tags", "owner", "isdonated", "donor"]
        isbn = self.get_argument("isbn", None)
        if not isbn:
            no_isbn = {
                          "msg": "no_isbn",
                          "code": 1
                      }
            self.write(no_isbn)
        book = coll.find_one({"isbn": isbn})
        if book != None:
            for key in book_fields:
                if book[key] == None:
                    book[key] = self.get_argument(key, None)
            book["updated_at"] = datetime.now().__format__("%Y-%m-%d %H:%M:%S")
            coll.save(book)
            # Update success
            update_sucs = {
                              "msg": "",
                              "code": 0
                          }
            self.write(update_sucs)
        else:    
            # Book not found 
            book_not_found = {
                                 "msg": "book_not_found",
                                 "code": 1
                             }
            self.write(book_not_found)

class DeleteHandler(tornado.web.RequestHandler):
    def post(self):
        coll = self.application.db.books
        isbn = self.get_argument("isbn", None)
        if not isbn:
            no_isbn = {
                          "msg": "no_isbn",
                          "code": 1
                      }
            self.write(no_isbn)
        else:    
            coll.remove({"isbn": isbn});
            remove_sucs = {
                              "msg": "",
                              "code": 0
                          }
            self.write(remove_sucs)


class GetHandler(tornado.web.RequestHandler):
    def post(self):
        coll = self.application.db.books
        books = coll.find()
        books_r = []
        for book in books:
            del book["_id"]
            books_r.append(book)
        self.write(json.dumps(books_r))


if __name__ == "__main__":
    tornado.options.parse_command_line()
    http_server = tornado.httpserver.HTTPServer(Application())
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()
