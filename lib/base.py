#!/usr/bin/env python

import tornado.web
from bson.objectid import ObjectId    # To convert the ObjectId from a string


class BaseHandler(tornado.web.RequestHandler):
    @property
    def db(self):
        return self.application.db

    def get_current_user(self):
        user_id = self.get_secure_cookie("user_id")
        if not user_id:
            return None
        coll = self.db["users"]   # Connect to user's collection
        user = coll.find_one({"_id": ObjectId(user_id)})
        user["id"] = user_id
        # Delelte _id
        del user["_id"]
        # Delete password in user info
        del user["password"]
        # return dumps(user)
        return user
