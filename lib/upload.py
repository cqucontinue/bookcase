#-*-coding:utf-8-*-
import os
import tempfile

import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web

from PIL import Image
from datetime import datetime
from tornado.options import define, options

if __name__ == "__main__":
    define("port", default=8000, type=int, help="run on the given port")

class Application(tornado.web.Application):

    def __init__(self):

        handlers = [(r"/image",ImageHandler)]
        settings = dict(debug=True)
        super(Application,self).__init__(handlers, **settings)
    
class ImageHandler(tornado.web.RequestHandler):
    def get(self):
        pass

    def post(self):
        if not self.request.files:
            file_empty = {
                    "errmsg":"no_image",
                    "errcode":1
            }
            self.write(file_empty)
            return

        meta = self.request.files['image'][0]
        upload_path = "/home/gavin/Desktop/113bookcase/book-collection/imgs/avatar/"
        filename = meta['filename']

        # 判断图片大小
        if len(meta['body']) > 2*1024*1024:
            too_big = {
                    "errmsg":"too_big",
                    "errcode":1
            }
            self.write(too_big)
            return

        #判断图片尺寸是否合理
        temp_file = tempfile.NamedTemporaryFile(delete=True)
        temp_file.write(meta['body'])
        temp_file.seek(0)
        #self.write(temp_file.name)
        #return
        try:
            image_one = Image.open(temp_file.name)
        except IOError,e:
            illegal_image = {
                    "errmsg":"illegal_image",
                    "errcode":1
            }
            self.write(illegal_image)
            return
        if image_one.size[0] < 250 or image_one.size[1] < 250 or \
                image_one.size[0] > 10000 or image_one.size[1] > 10000:
                temp_file.close()
                bad_dimensions = {
                        "errmsg":"bad-dimensions",
                        "errcode":1
                }
                self.write(bad_dimensions)
                return 
                
        #判断图片格式是否正确
        temp_file.close()
        suffix = os.path.splitext(filename)[1]

        #self.write(suffix)
        #return
        suffix_lst = [".jpg",".png",".gif",".jpeg"]
        flag = False
        for key in suffix_lst:
            if suffix == key:
                flag = True
        if flag:
            image_path = os.path.join(upload_path,filename)
            with open(image_path,"wb") as f:
                f.write(meta['body'])
                f.close()

        else:
            invalid_image = {
                    "errmsg":"invalid_image",
                    "errcode":1
            }
            self.write(invalid_image)
            return 
        
        #修改文件名字
        if os.path.isfile(image_path):
            time = datetime.now().__format__("%Y-%m-%d_%H:%M:%S")
            new_filename = time + suffix
            new_image_path = os.path.join(upload_path,new_filename)
            os.rename(image_path,new_image_path)
        

if __name__ == '__main__':
    tornado.options.parse_command_line()
    http_server = tornado.httpserver.HTTPServer(Application())
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()
