#!/usr/bin/env python

from lib.base import BaseHandler

import tornado.locale
import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web
import json
from datetime import datetime


class EditHandler(BaseHandler):
    def post(self):
        coll = self.db[self.gsettings.COLL_BOOKS]
        book_fields = ["isbn", "title", "alt", "author",
                       "publisher", "image",
                       "tags", "isdonated", "donor", "pub_date"]
        isbn = self.get_argument("isbn", None)
        if not isbn:
            no_isbn = {
                "errmsg": "no_isbn",
                "errcode": 1
            }
            self.write(no_isbn)
            return
        book = coll.find_one({"isbn": isbn})
        if book is not None:
            # If book exist, update information
            for key in book_fields:
                if book[key] is None:
                    book[key] = self.get_argument(key, None)
            book["updated_at"] = datetime.now().__format__("%Y-%m-%d %H:%M:%S")
            coll.save(book)
            # Update success
            update_sucs = {
                "errcode": 0
            }
            self.write(update_sucs)
            return
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
                "errcode": 0
            }
            self.write(insert_sucs)


class GetHandler(BaseHandler):
    def get(self):
        coll = self.db[self.gsettings.COLL_BOOKS]
        books = coll.find()
        books_r = []
        for book in books:
            del book["_id"]
            books_r.append(book)
        self.write(json.dumps(books_r))


class DeleteHandler(BaseHandler):
    def get(self):
        coll = self.db[self.gsettings.COLL_BOOKS]

        isbn = self.get_argument(isbn)
        if not isbn:
            no_isbn = {
                "errmsg": "no_isbn",
                "errcode": 1
            }
            self.write(no_isbn)
            return
        else:    
            coll.remove({"isbn": isbn})
            remove_sucs = {
                "errcode": 0
            }
            self.write(remove_sucs)