#!/usr/bin/env python

from lib.base import BaseHandler
from lib.auth import NologinHandler

import tornado.locale
import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web
import json
from datetime import datetime
from tornado.options import define, options
import pymongo


class GetWunBooksHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        page = self.get_argument("page", None)
        # pmax = [1, 20]
        pmax = self.get_argument("pmax", 8)
        pmax = int(pmax)
        sort = self.get_argument("sort", None)
        
        if not page:
            no_page = {
                "errmsg": "no_page",
                "errcode": 1
            }
            self.write(no_page)
            return
        else:
            page = int(page)
        
        if pmax not in range(1, 20):
            invalid_pmax = {
                "errmsg": "invalid_pmax",
                "errcode": 1
            }
            self.write(invalid_pmax)
            return 

        if not sort:
            no_sort = {
                "errmsg": "no_sort",
                "errcode": 1
            }
            self.write(no_sort)
            return

        sort_fields = ["vote_count", "created_at", "updated_at"]
        if sort not in sort_fields:
            no_sort_field = {
                "errmsg" : "no_sort_field",
                "errcode": 1
            }
            self.write(no_sort_field)
            return
        
        # Connect to collection - wunbooks  
        coll = self.db[self.gsettings.COLL_WUNDER]
        # Init wunbooks
        cursor = coll.find({}, {"_id": 0, "voter.password": 0, "voter.password_hash": 0})
        cursor.sort([(sort, pymongo.DESCENDING), ("updated_at", pymongo.DESCENDING)])
        pages = cursor.count() / pmax if cursor.count() % pmax is 0 else (cursor.count() / pmax) + 1

        try:
            bindex = pmax * (page-1)
            ncursor = cursor[bindex:(bindex + pmax)]
            books_r = []
            for book in ncursor:
                books_r.append(book)
            books_r_s = {
                "pages": pages,
                "page": page,
                "books": books_r
            }
            self.write(json.dumps(books_r_s))
        except NameError:
            illegal_request = {
                "errmsg": "illegal_request",
                "errcode": 1
            }
            self.write(illegal_request)
            return


class WunSearchHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        isbn = self.get_argument("isbn", None)
        if not isbn:
            no_isbn = {
                "errmsg": "no_isbn",
                "errcode": 1
            }
            self.write(no_isbn)
            return
            
        coll = self.db[self.gsettings.COLL_BOOKS]
        coll_w = self.db[self.gsettings.COLL_WUNDER]

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


        book_not_exist = {
            "errcode": 0
        }
        self.write(book_not_exist)


class WunEditHandler(BaseHandler):
    @tornado.web.authenticated
    def post(self):
        if not self.get_current_user():
            self.redirect("/auth/nologin")
            return

        isbn = self.get_argument("isbn", None)
        if not isbn:
            no_isbn = {
                "errmsg": "no_isbn",
                "errcode": 1
            }
            self.write(no_isbn)
            return

        # Check the book if existed in wunderlist | bookcase
        # Return error message if the book exists
        coll = self.db[self.gsettings.COLL_BOOKS]
        coll_w = self.db[self.gsettings.COLL_WUNDER]

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

        # Insert new book into wunderlist
        book_fields = ["isbn", "title", "alt", "author",
                       "publisher", "image", "tags", "pub_date"]
        if isbn:
            wunbook = {}
            wunbook["voter"] = [self.get_current_user()]
            wunbook["vote_count"] = 1

            for key in book_fields:
                wunbook[key] = self.get_argument(key, None)

            wunbook["created_at"] = datetime.now().__format__("%Y-%m-%d %H:%M:%S")
            wunbook["updated_at"] = datetime.now().__format__("%Y-%m-%d %H:%M:%S")
            coll_w.insert(wunbook)

            # Save success
            insert_sucs = {
                "errcode": 0
            }
            self.write(insert_sucs)


class VoteHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        isbn = self.get_argument("isbn", None)
        if not isbn:
            no_isbn = {
                "errmsg": "no_isbn",
                "errcode": 1
            }
            self.write(no_isbn)
            return

        # Wunderlist database
        coll = self.db[self.gsettings.COLL_WUNDER]
        vote_book = coll.find_one({"isbn": isbn})

        # Confirm user vote or not vote
        member = self.current_user
        del member["created"]
        del member["last_updated"]
        if member not in vote_book["voter"]:
            vote_book["vote_count"] += 1
            vote_book["voter"].append(member)
            coll.save(vote_book)
            # Return sucs
            new_vote_book = coll.find_one({"isbn": isbn}, {"_id": 0, 
                "voter.created": 0, "voter.last_updated": 0})
            self.write(new_vote_book)
        else:
            already_vote = {
                "errcode": 1,
                "errmsg": "already_vote"
            }
            self.write(already_vote)
