#!/usr/bin/env python

import superuuid
from lib.base import BaseHandler

import tornado.web
import tornado.escape
import tornado.httpserver
import tornado.ioloop
import pymongo
from datetime import datetime
from passlib.hash import md5_crypt

from tornado.options import define, options

'''
if __name__ == "__main__":
    define("port", default=8000, type=int, help="run on the given port")
    define("mongodb_host", default="127.0.0.1", help="database host")
    define("mongodb_port", default=27017, help="database port")
    define("db_continue", default="continue", help="database name")
    define("coll_members", default="members", help="basic member information collection")


class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
            (r"/auth/", AuthHandler),
            (r"/auth/nologin", NologinHandler),
            (r"/auth/login", LoginHandler),
            (r"/auth/logout", LogoutHandler),
            (r"/auth/register", RegisterHandler)
        ]
        settings = {
            # Request head must include: X-XSRFToken
            "login_url": "/auth/nologin",
            "xsrf_cookies": True,
            # IF more than one processing?
            "cookie_secret": superuuid.generate(),
            "debug": True
        }
        tornado.web.Application.__init__(self, handlers, **settings)

        # Have one global connection to the book DB across all handlers
        conn = pymongo.Connection(options.mongodb_host, 
                                  options.mongodb_port)
        self.db = conn[options.db_continue]
'''

class AuthHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        self.write(self.current_user)


class NologinHandler(BaseHandler):
    def get(self):
        self.set_cookie("_xsrf", self.xsrf_token)
        not_login = {
            "errmsg": "not_login",
            "errcode": 1
        }
        self.write(not_login)


class LoginHandler(BaseHandler):
    def post(self):
        member_id = self.get_argument("member_id", None)
        password = self.get_argument("password", None)

        if not member_id or not password:
            para_error = {
                "errcode": 1,
                "errmsg": "para_error"
            }
            self.write(para_error)
            return

        coll = self.db[options.coll_members]
        member = coll.find_one({"_id": member_id})
        if not member:
            not_found = {
                "errcode": 1,
                "errmsg": "not_found"
            }
            self.write(not_found)
            return
        else:
            password_hash = member["password_hash"]
            if not md5_crypt.verify(password, password_hash):
                login_fail = {
                    "errcode": 1,
                    "errmsg": "login_fail"
                }
                self.write(login_fail)
                return
            else:
                self.set_secure_cookie("member_id", member["_id"])
                login_sucs = {
                    "errcode": 0
                }
                self.write(login_sucs)


class LogoutHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        self.clear_cookie("member_id")
        logout_sucs = {
            "errcode": 0
        }
        self.write(logout_sucs)


class RegisterHandler(BaseHandler):
    def post(self):
        member_fields = ["member_id", "password", "password_hash",
                         "fullname", "url_token", "avatar_path"]

        member_id = self.get_argument("member_id", None)
        password = self.get_argument("password", None)
        if not member_id:
            no_member_id = {
                "errcode": 1,
                "errmsg": "no_member_id"
            }
            self.write(no_member_id)
            return

        if not password:
            no_password = {
                "errcode": 1,
                "errmsg": "no_password"
            }
            self.write(no_password)
            return

        if member_id:
            coll = self.db[options.coll_members]
            
            if coll.find_one({"_id": member_id}) is not None:
                member_exist = {
                    "errcode": 1,
                    "errmsg": "member_exist"
                }
                self.write(member_exist)
                return

            member = {
                "_id": member_id,
                "password_hash": md5_crypt.encrypt(password)
            }
            del member_fields[member_fields.index("password")]
            del member_fields[member_fields.index("password_hash")]
            del member_fields[member_fields.index("member_id")]
            for key in member_fields:
                member[key] = self.get_argument(key, None)
            member["created"] = datetime.now().__format__("%Y-%m-%d %H:%M:%S")
            member["last_updated"] = datetime.now().__format__("%Y-%m-%d %H:%M:%S")
            coll.insert(member)

            regist_sucs = {
                "errcode": 0
            }
            self.write(regist_sucs)


def main():
    tornado.options.parse_command_line()
    http_server = tornado.httpserver.HTTPServer(Application())
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()


if __name__ == "__main__":
    main()
