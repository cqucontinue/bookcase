#!/usr/bin/env python

from lib.base import BaseHandler

import tornado.locale
import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web

import json
from datetime import datetime, timedelta

class BorrowBookHandler(BaseHandler):
	@tornado.web.authenticated
	def get(self):
		user_id = self.current_user["fullname"]

		coll = self.db[self.gsettings.COLL_BORROW]
		books = []
		for book in coll.find({"user": user_id}):
			del book["_id"]
			book["borrow_time"] = book["borrow_time"].__format__("%Y-%m-%d")
			book["return_time"] = book["return_time"].__format__("%Y-%m-%d")

			temp_book = self.db[self.gsettings.COLL_BOOKS].find_one({"isbn": book["book"]})
			del temp_book["_id"]
			book["book_info"] = temp_book
			books.append(book)
		print books
		self.write({"books": books})

	@tornado.web.authenticated
	def post(self):
		isbn = self.get_argument("isbn", None)
		user_id = self.current_user["fullname"]

		borrow_time = datetime.now()
		return_time = borrow_time + timedelta(days=15)

		if not isbn:
			no_isbn = {
				"errmsg": "no_isbn",
				"errcode": 1
			}
			self.write(no_isbn)
			return

		coll = self.db[self.gsettings.COLL_BLACK_LIST]
		coll_borrow = self.db[self.gsettings.COLL_BORROW]
		black_user = coll.find_one({"user": user_id})
		if black_user and black_user["count"] >= 3:
			forbidden_borrow = {
				"errmsg": "forbidden_borrow",
				"errcode": 1
			}
			self.write(forbidden_borrow)
			return
		coll_borrow.insert({
				"book": isbn, 
				"user": user_id, 
				"borrow_time": borrow_time, 
				"return_time": return_time,
				"count": 1
		})
		self.write({"errcode": 0})

	@tornado.web.authenticated
	def put(self):
		isbn = self.get_argument("isbn", None)
		user_id = self.current_user["fullname"]

		if not isbn:
			no_isbn = {
				"errmsg": "no_isbn",
				"errcode": 1
			}
			self.write(no_isbn)
			return
			
		coll_borrow = self.db[self.gsettings.COLL_BORROW]
		book = coll_borrow.find_one({"book": isbn, "user": user_id})
		if book["count"] >= 3:
			out_of_number = {
				"errmsg": "out_of_number",
				"errcode": 1
			}
			self.write(out_of_number)
			return
		book["return_time"] += timedelta(days=15)
		book["count"] += 1
		coll_borrow.save(book)
		self.write({"errcode": 0})

	@tornado.web.authenticated
	def delete(self):
		isbn = self.get_argument("isbn", None)
		user_id = self.current_user["fullname"]

		if not isbn:
			no_isbn = {
				"errmsg": "no_isbn",
				"errcode": 1
			}
			self.write(no_isbn)
			return

		coll_borrow = self.db[self.gsettings.COLL_BORROW]
		book = coll_borrow.find_one({"book": isbn, "user": user_id})
		time_space = datetime.now() - book["return_time"]
		if time_space.days > 1:
			coll = self.db[self.gsettings.COLL_BLACK_LIST]
			coll.update({"user": user_id}, {"$inc": {"count": 1}}, True, False)
		coll_borrow.remove(book)
		self.write({"errcode": 0})



