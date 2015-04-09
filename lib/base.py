#!/usr/bin/env python

import tornado.web


class BaseHandler(tornado.web.RequestHandler):
    @property
    def db(self):
        return self.application.db

    # TODO
    # Rewrite error page


    def get_current_user(self):
        member_id = self.get_secure_cookie("member_id")
        if not member_id:
            return None
        # This cannot use DEFINE options
        # TODO
        coll = self.db.members   # Connect to members' collection
        member = coll.find_one({"_id": member_id}, 
                               {"_id": 0,
                                "password": 0,
                                "password_hash": 0})
        member["member_id"] = member_id
        # return dumps(user)
        return member
