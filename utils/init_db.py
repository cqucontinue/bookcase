#!/usr/bin/env python
# -*- coding: utf-8 -*-

import pymongo
import re
from passlib.hash import md5_crypt
from datetime import datetime

conn = pymongo.Connection("localhost", 27017)
members = conn["continue"]["members"]

members_init_fields = ["member_id", "fullname", "password"]


def insert_to_db(line):
    infos = line.split()
    member = {
        "fullname": infos[0],
        "_id": infos[1],
        "password_hash": md5_crypt.encrypt(infos[1]),
        "created": datetime.now().__format__("%Y-%m-%d %H:%M:%S"),
        "last_updated": datetime.now().__format__("%Y-%m-%d %H:%M:%S"),
        "url_token": None,
        "avatar_path": None
    }
    members.insert(member)

def main():
    with open("member_info.txt", "r") as f:
        for line in f:
            insert_to_db(line.strip('\n'))


if __name__ == "__main__":
    main()
