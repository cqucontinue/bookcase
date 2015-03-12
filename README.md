Book Collection
===

>To manage books in 113

```
Dev Server IP: 182.92.167.199
U can ssh continue@IP to update code and test your new feature 
```

##API
```json
URI: http://book.113continue.com - Down!!!
DEV: http://182.92.167.199

HTTP Method: POST|GET
Data type: JSON
Time format: yyyy-MM-dd HH:mm:ss, "2015-02-16 01:58:00"
```

####Edit book information
>equal to insert + update

```json
url: /book/edit

para:
required:
    isbn: string

optional:
    title: 标题, string
    alt: 豆瓣链接, string
    author: 作者, object in array, [{"name": "foo"}, ...]
    publisher: 出版社, array
    image: 豆瓣图片链接, string
    price: 标价, string
    tags: object in array, [{"name": "computer science"}, ...]
    
    owner: 所有者, object in array, [
                                        {
                                             "name": "bob",
                                             "grade": "2012",
                                             ...
                                        },
                                        ...
                                   ]
    isdonated: true or false, if true then set owner to "113"
    donor: 捐赠人, object in array

return:
    errmsg: ""
    errcode: 成功 0 错误 1

```

<!--
####Insert books
```json
method: POST

url: /book/insert

para:
required:
    isbn: string

optional:
    title: 标题, string
    alt: 豆瓣链接, string
    author: 作者, object in array, [{"name": "foo"}, ...]
    publisher: 出版社, array
    image: 豆瓣图片链接, string
    price: 标价, string
    tags: object in array, [{"name": "computer science"}, ...]
    
    owner: 所有者, object in array, [
                                        {
                                             "name": "bob",
                                             "grade": "2012",
                                             ...
                                        },
                                        ...
                                   ]
    isdonated: true or false, if true then set owner to "113"
    donor: 捐赠人, object in array

return: 
    errmsg: 先返回空字符串
    errcode: 成功 0, 失败 1
```

####Update book information
```json
url: /book/update

para:
required:
    isbn: string

optional:
    title: 标题, string
    alt: 豆瓣链接, string
    author: 作者, object in array, [{"name": "foo"}, ...]
    publisher: 出版社, array
    image: 豆瓣图片链接, string
    price: 标价, string
    tags: object in array, [{"name": "computer science"}, ...]
    
    owner: 所有者, object in array, [
                                        {
                                             "name": "bob",
                                             "grade": "2012",
                                             ...
                                        },
                                        ...
                                   ]
    isdonated: true or false, if true then set owner to "113"
    donor: 捐赠人, object in array

return:
    errmsg: "book_not_found"
    errcode: 成功 0, 失败 1
```
-->

####Get all books
```json
method: GET

url: /book/get

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

url: /book/delete/isbn
Ex: /book/delete/9780136019299

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

url: /auth/register

para:
required:
    member_id: string
    password: string

optional:
    fullname: string

return:
    errcode: 1 错误 0 成功
    errmsg: "no_member_id" | "no_password" | "member_existed"
```

####Login
```json
method: POST

url: /auth/login

para:
required:
    member_id: 现在用学号作为用户名
    password: string
    
return:
    errcode: 0 成功 1 失败
    errmsg: "para_error" | "not_found" | "login_fail" 
```


####Logout
```json
method: GET

url: /auth/logout

return:
    errcode: 0 成功
```


####Get user stat
```json
method: GET

url: /auth/

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
