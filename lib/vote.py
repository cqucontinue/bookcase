#!/usr/bin/env python

from lib.base import BaseHandler

import tornado.locale
import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web

from tornado.options import define, options
import pymongo


if __name__ == "__main__":
    define("port", default=8000, type=int, help="run on the given port")
    define("coll_wunder", default="wunbooks", help="wunder books collection")

class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
            (r"/wunderlist/vote", VoteHandler)
        ]
        settings = dict(
            debug=True
        )
        conn = pymongo.Connection("localhost", 27017)
        self.db = conn["continue"]
        tornado.web.Application.__init__(self, handlers, **settings)


class VoteHandler(BaseHandler):
    def get(self):
        member_id = self.get_argument("member_id", None)
        isbn = self.get_argument("isbn", None)
        if not member_id:
            no_member_id = {
                "errmsg": "no_member_id",
                "errcode": 1
            }
            self.write(no_member_id)
            return

        if not isbn:
            no_isbn = {
                "errmsg": "no_isbn",
                "errcode": 1
            }
            self.write(no_isbn)
            return

        if member_id and isbn:
            # I can't debug, because it need cookie_secret,others are OK
            # U should use self.current_user() not self.get_current_user()
            auth_member_id = self.current_user()
            if member_id is not auth_member_id:
                diff_member_id = {
                    "errcode": 1,
                    "errmsg": "diff_member_id"
                }
                self.write(diff_member_id)
                return
                
        # Wunderlist database
        coll = self.db[options.coll_wunder]
        vote_book = coll.find_one({"isbn": isbn})

        # Confirm user vote or not vote
        if member_id not in vote_book["voter"]:
            vote_book["vote_count"] += 1
            vote_book["voter"].append(member_id)
            coll.save(vote_book)
            vote_sucs = {
                "errcode": 0
            }
            self.write(vote_sucs)
        else:
            already_vote = {
                "errcode": 1,
                "errmsg": "already_vote"
            }
            self.write(already_vote)


def main(): 
    tornado.options.parse_command_line()
    http_server = tornado.httpserver.HTTPServer(Application())
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()


if __name__ == "__main__":
    main()
