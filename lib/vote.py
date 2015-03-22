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
            (r"/wunderlist/vote",VoteHandler)
        ]
        settings = dict(
            debug=True
        )
        conn = pymongo.Connection("localhost", 27017)
        self.db = conn["continuetry"]
        tornado.web.Application.__init__(self, handlers, **settings)

class VoteHandler(BaseHandler):
    def get(self):
        member_id = self.get_argument("member_id",None)
        isbn = self.get_argument("isbn",None)
        if not member_id:
            no_member_id = {
                    "errmsg":"no_member_id",
                    "errcode":1
            }
            self.write(no_member_id)
            return
        elif not isbn:
            no_isbn = {
                "errmsg":"no_isbn",
                "errcode":1
            }
            self.write(no_isbn)
            return 
        else:
            #I can't debug,because it need cookie_secret,others are OK
            auth_member_id = self.get_current_user()
            if member_id != auth_member_id["member_id"]:
                diff_member_id = {
                        "errcode":1,
                        "errmsg":"diff_member_id"
                }
                self.write(diff_member_id)
                return
                
        #wunderlist database
        coll = self.db["bbooks"]
        vote_book = coll.find_one({"isbn":isbn})

        #confirm user vote or not vote
        if member_id not in vote_book["voter"]:
            vote_book["vote_count"] += 1
            vote_book["voter"].append(member_id)
            coll.save(vote_book)
        else:
            already_vote = {
                    "errcode":1,
                    "errmsg":"already_vote"
            }
            self.write(already_vote)
            return 


def main(): 
    tornado.options.parse_command_line()
    http_server = tornado.httpserver.HTTPServer(Application())
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()

if __name__ == "__main__":
    main()