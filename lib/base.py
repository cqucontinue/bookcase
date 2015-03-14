#!/usr/bin/env python

import tornado.web
# from bson.objectid import ObjectId    # To convert the ObjectId from a string


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
        member = coll.find_one({"_id": member_id})
        member["member_id"] = member_id
        # Delete _id
        del member["_id"]
        # Delete password in user info
        del member["password"]
        del member["password_hash"]
        # return dumps(user)
        return member

