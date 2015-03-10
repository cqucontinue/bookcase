#!/usr/bin/env python

import superuuid
from lib.base import BaseHandler

import tornado.web
import tornado.escape
import tornado.httpserver
import tornado.ioloop
import pymongo
from datetime import datetime

from tornado.options import define, options


if __name__ == "__main__":
    define("port", default=8000, type=int, help="run on the given port")
    define("mongodb_host", default="127.0.0.1", help="database host")
    define("mongodb_port", default=27017, help="database port")
    define("mongodb_db", default="continue", help="database name")


class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
            (r"/auth", AuthHandler),
            (r"/auth/login", LoginHandler),
            (r"/auth/logout", LogoutHandler),
            (r"/auth/register", RegisterHandler)
        ]
        settings = {
            # Request head must include: X-XSRFToken
            "login_url": "/auth/login",
            # "xsrf_cookies": True,
            # IF more than one processing?
            "cookie_secret": superuuid.generate(),
            "debug": True
        }
        tornado.web.Application.__init__(self, handlers, **settings)

        # Have one global connection to the book DB across all handlers
        conn = pymongo.Connection(options.mongodb_host, 
                                  options.mongodb_port)
        self.db = conn[options.mongodb_db]

        
class AuthHandler(BaseHandler):
    # @tornado.web.authenticated
    # def get(self):
    def get(self):
        if not self.current_user:
            not_login = {
                "errcode": 1,
                "errmsg": "not_login"
            }
            self.write(not_login)
            return
        else:
            self.write(self.current_user)
        

class LoginHandler(BaseHandler):
    def post(self):
        account = self.get_argument("account", None)
        password = self.get_argument("password", None)

        if not account or not password:
            para_error = {
                "errcode": 1,
                "errmsg": "para_error"
            }
            self.write(para_error)
            return

        coll = self.db["users"]
        user = coll.find_one({"email": account})
        if not user:
            not_found = {
                "errcode": 1,
                "errmsg": "not_found"
            }
            self.write(not_found)
            return
        else:
            if password != user["password"]:
                login_fail = {
                    "errcode": 1,
                    "errmsg": "login_fail"
                }
                self.write(login_fail)
                return
            else:
                self.set_secure_cookie("user_id", user["_id"].__str__())
                login_sucs = {
                    "errcode": 0
                }
                self.write(login_sucs)


class LogoutHandler(BaseHandler):
    def get(self):
        # TODO
        # @authenticated
        self.clear_cookie("user_id")
        logout_sucs = {
            "errcode": 0
        }
        self.write(logout_sucs)


class RegisterHandler(BaseHandler):
    def post(self):
        user_fields = ["email", "firstname", "lastname", "password"]

        email = self.get_argument("email", None)
        password = self.get_argument("password", None)
        if not email:
            no_email = {
                "errcode": 1,
                "errmsg": "no_email"
            }
            self.write(no_email)
            return

        if not password:
            no_password = {
                "errcode": 1,
                "errmsg": "no_password"
            }
            self.write(no_password)
            return

        if email:
            coll = self.db["users"]
            
            if coll.find_one({"email": email}) is not None:
                user_exist = {
                    "errcode": 1,
                    "errmsg": "user_exist"
                }
                self.write(user_exist)
                return

            user = {}
            for key in user_fields:
                user[key] = self.get_argument(key, None)
            user["created_at"] = datetime.now().__format__("%Y-%m-%d %H:%M:%S")
            user["updated_at"] = datetime.now().__format__("%Y-%m-%d %H:%M:%S")
            coll.insert(user)
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
