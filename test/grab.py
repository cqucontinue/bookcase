# -*- coding: utf-8 -*-

import urllib2
import pymongo
import json


conn = pymongo.Connection("localhost", 27017)
sbooks = conn["continue"]["sbooks"]


tags = ["编程", "计算机", "小说", "散文", "数学"]

def gen_url(tag):
    url_base = "https://api.douban.com/v2/book/search?tag="
    new_url = url_base + tag + "&count=100"
    return new_url


for tag in tags:
    r = urllib2.urlopen(gen_url(tag)).read()
    dr = json.loads(r)
    for idx in dr:
        sbooks.insert(idx)


print "Down!"
