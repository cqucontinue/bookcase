Book Collection
===

>To manage books in 113

```
Dev Server IP: 182.92.167.199
U can ssh continue@IP to update code and test your new feature 
```

##noSQL DB model
```json
mongodb:
    - database: cotinue
        - collections: contact, members, info, books

members {
    "_id": member_id    // NOT NULL
    "fullname": string, // DEFAULT NULL
    "nickname": string, // DEFAULT NULL
    "password": string, // NOT NULL
    "password_hash": string, // DEFAULT NULL
    "url_token": string,     // DEFAULT NULL
    "avatar_path": string,   // DEFAULT NULL
    "created": string,       // NOT NULL
    "last_updated": string   // NOT NULL
}

contact {
    "_id": member_id,   // NOT NULL
    "email": string,    // NULL
    "phone": string     // NULL
    // More can add here
}

info {
    "_id": member_id, // NOT NULL,
    "grade": string,  // DEFAULT NULL,
    "gender": string, // DEFAULT NULL,
    "school": string, // DEFAULT NULL,
    "self_introduction": string  // DEFAULT NULL
}
```


##API
```json
URL: http://book.113continue.com - Down!!!
DEV: http://182.92.167.199

HTTP Method:
    GET 用于获取信息
    POST 用于编辑(插入, 删除, 更新), 参数要添加 _xsrf (cookie里获得)
Data type: JSON
Time format: yyyy-MM-dd HH:mm:ss, "2015-02-16 01:58:00"
```
额外
####Edit book information
>equal to insert + update

```json
method: POST

uri: /book/edit

para:
required:
    isbn: string
    _xsrf: string in cookie

optional:
    title: 标题, string
    alt: 豆瓣链接, string
    author: 作者, array, []
    publisher: 出版社, array
    image: 豆瓣图片链接, string
    tags: array, []
    isdonated: true or false, if true then set owner to "113"
    donor: 捐赠人, object in array
    pub_date: 出版时间, string
    
return:
    errmsg: ""
    errcode: 成功 0 错误 1

```

####Get all books
```json
method: GET

uri: /book/get

return:
    [
        {
            "isbn": "...",
            ...
            "created_at": "2015-02-16 00:00:00",
            "updated_at": "2015-02-16 00:00:00",
            ...
        },
        ...
    ]
```

####Delete book
```json
method: GET

uri: /book/delete?isbn=isbn_code
Ex: /book/delete?isbn=9780136019299

return:
    errmsg: "book_not_found"
    errcode: 成功 0, 失败 1
```
para:
required:
    isbn: string


####Register
```json
method: POST

uri: /auth/register

para:
required:
    member_id: string
    password: string
    _xrfs: string in cookie

optional:
    fullname: string

return:
    errcode: 1 错误 0 成功
    errmsg: "no_member_id" | "no_password" | "member_existed"
```

####Login
```json
method: POST

uri: /auth/login

para:
required:
    member_id: 现在用学号作为用户名
    password: string
    _xrfs: string in cookie
    
return:
    errcode: 0 成功 1 失败
    errmsg: "para_error" | "not_found" | "login_fail" 
```

####Logout
```json
method: GET

uri: /auth/logout

return:
    errcode: 0 成功
```

####Get user stat
```json
method: GET

uri: /auth/

return:
    errcode: 1 错误
    errmsg: "not_login"
    
    or
    
    {
        "member_id": "",
        "fullname": "",
        "created": "",
        "last_updated": "",
        "avatar_path": "",
        "url_token": ""
    }
```

####Get wunder list
```json
method: GET

uri: /wunderlist/get

return:
    [
        {
            "isbn": "...",
            ...
            "created_at": "2015-02-16 00:00:00",
            "updated_at": "2015-02-16 00:00:00",
            ...
        },
        ...
    ]
```

####Search book in wunder list via isbn
```json
method: GET

uri: /wunderlist/search?isbn=isbn_code
Ex: /wunderlist/search?isbn=1234567890123

return:
    errmsg: "no_isbn",
    errcode: 1
    // 已购买
    errcode: 1,
    errmsg: "book_got"
    // 已存在在清单里
    errcode: 1,
    errmsg: "book_exist"
    // 成功
    errcode 0
```

####Insert book in wunder list
```json
method: POST

uri: /wunderlist/edit

para:
required:
    isbn: string
    _xsrf: string in cookie

optional:
    title: string,
    alt: 豆瓣链接
    author: array,
    publisher: 出版社,
    image: 豆瓣图片链接,
    tags: 标签,
    pub_date: 出版时间
```

####Vote in wunder list
```json
method: GET

uri: /wunderlist/vote?isbn=isbn_code
Ex: /wunderlist/vote?isbn=1234567890123

return:
    // 成功
    errcode: 0
    
    or
    
    errmsg: "no_isbn",
    errcode: 1
    
    or 
    
    errmsg: "already_vote
    errcode: 1
```


##Server about
```shell
nginx 1.6.2 - proxy pass
supervisor - daemon
    |
    |--server.py
```
