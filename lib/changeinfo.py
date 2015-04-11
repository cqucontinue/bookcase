import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web
import pymongo

from datetime import datetime
from base import BaseHandler
from passlib.hash import md5_crypt

from datetime import datetime
from tornado.options import define, options

if __name__ == "__main__":
    define("port", default=8000, type=int, help="run on the given port")
    define("mongodb_host", default="127.0.0.1", help="database host")
    define("mongodb_port", default=27017, help="database port")
    define("db_continue", default="continue", help="database name")
    define("coll_members", default="members", help="basic member information collection")
    
class Application(tornado.web.Application):

    def __init__(self):
        
        handlers = [(r"/changeinfo",InfoHandler)]
        settings = dict(debug=True)
        super(Application,self).__init__(handlers, **settings)
        #connection database
        conn = pymongo.Connection(options.mongodb_host, 
                                  options.mongodb_port)
        self.db = conn[options.db_continue]
        
        
class InfoHandler(BaseHandler):

    def post(self):

        coll = self.application.db[options.coll_members]
        member_id = self.current_user["member_id"]
        member = coll.find_one({"_id":member_id})
        if not member_id:
            no_member_id = {
                    "errmsg":"no_member_id",
                    "errcode":1
            }
            self.write(no_member_id)
            return
            
        info = ["grade","gender","school","self_introduction"]
        for key in info:
            member["info"][key] = self.get_argument(key,None)
        #important argument
        member["fullname"] = self.get_argument("fullname",None)
        password = self.get_argument("password",None)
        member["password_hash"] = md5_crypt.encrypt(password)
        #normal argument
        member["contact"]["email"] = self.get_argument("email",None)
        member["contact"]["phone"] = self.get_argument("phone",None)
        member["created"] = datetime.now().__format__("%Y-%m-%d %H:%M:%S")
        member["last_updated"] = datetime.now().__format__("%Y-%m-%d %H:%M:%S")
        coll.save(member)
            
if __name__ == '__main__':
    tornado.options.parse_command_line()
    http_server = tornado.httpserver.HTTPServer(Application())
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()
