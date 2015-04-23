#!/usr/bin/env python

import tornado.web

class BaseHandler(tornado.web.RequestHandler):
    @property
    def db(self):
        return self.application.db

    # @property
    # def settings(self):
    #   return self.application.settings
    
    @property
    def gsettings(self):
        return self.application.gsettings

    def get_current_user(self):
        member_id = self.get_secure_cookie("member_id")
        if not member_id:
            return None

        coll = self.db[self.gsettings.COLL_MEMBERS]   # Connect to members' collection
        member = coll.find_one({"_id": member_id}, 
                               {"_id": 0,
                                "password": 0,
                                "password_hash": 0})
        member["member_id"] = member_id
        # return dumps(user)
        return member

    def set_default_headers(self):
        self.set_header("Server", "Tornado+/%s" % tornado.version)

    def prepare(self):
        self.set_cookie("_xsrf", self.xsrf_token)
        # self.set_status(500, "Default set 500 in prepare")


class BaseStaticFileHandler(tornado.web.StaticFileHandler):
    def set_default_headers(self):
        self.set_header("Server", "Nginx+/%s" % tornado.version)