Book Collection
====

>To manage books in 113

```
Deployment target: book.113continue.com
SSH supported
```

##noSQL DB model

```json
mongodb:
    - database: continue
        - collections: members, books, wunbooks

members {
    "_id": "member_id",        // NOT NULL
    "fullname": "string",      // DEFAULT NULL
    "password_hash": "string", // NOT NULL
    "url_token": "string",     // DEFAULT NULL
    "avatar_path": "string",   // DEFAULT NULL
    "created": "string",       // NOT NULL
    "last_updated": "string",  // NOT NULL

    "contact": {
        "email": "string",        // NULL
        "phone": "string"         // NULL
        // More can add here
    },

    "info": {
        "grade": "string",            // DEFAULT NULL
        "gender": "string",           // DEFAULT NULL
        "school": "string",           // DEFAULT NULL
        "self_introduction": "string" // DEFAULT NULL
    }
}

books {
    "title": "string",    // 标题
    "alt": "string",      // 豆瓣链接
    "author": [],
    "publisher": "string",
    "image": "string",    // 豆瓣图片链接
    "tags": [],
    "isdonated": "bool",  // If true then set owner to "113"
    "donor": [],
    "pub_date": "string",
    "updated_at": "string",
    "created_at": "string"
}

wunbooks {
    "title": "string",
    "alt": "string",        // 豆瓣链接
    "author": [],
    "publisher": "string",
    "image": "string",      // 豆瓣图片链接
    "tags": [],
    "pub_date": "string",   // 出版时间
    "created_at": "string",
    "updated_at": "string",
    "voter": ["member_id", ""],
    "vote_count": "int"
}
```


##RESTful API About
> 1. Format refer to [douban API](http://developers.douban.com/wiki/?title=api_v2)
> 2. Concept refer to
    - [REST API Quick Tips](http://www.restapitutorial.com/lessons/restquicktips.html)
    - [Principles of good RESTful API Design](http://codeplanet.io/principles-good-restful-api-design)
    - [RESTful API 设计指南](http://www.ruanyifeng.com/blog/2014/05/restful_api.html)
    - [理解 RESTful 架构](http://www.ruanyifeng.com/blog/2011/09/restful.html)


##API V1 说明
1. 数据返回格式统一使用 json
2. API 里面的通配符, :id 代表纯数字, :name 代表由数字+字母+[-_.]这些特殊字符
3. 使用 HTTP Status Code 表示状态
4. 时间格式: yyyy-MM-dd HH:mm:ss, Ex."2015-02-16 01:58:00"
5. HTTP Method: GET, POST, PUT, DELETE, ...


##API V1 错误
发生错误时, HTTP Status Code 为 400

错误格式:
```
{
    "errmsg": "uri_not_found",
    "errcode": 12,
    "request": "GET \/v1\/book\/12345678910"
}
```


##API V1 返回

API返回值有两种
1. 返回单个对象, 具体结构见相关接口
2. 返回对象列表

请求参数

|参数|意义|备注|
|----|----|----|
|start|起始元素||
|count|返回结果的数量||

返回:
```
{
    "start": 0,
    "count": 10,
    "total": 50,
    "targets": []
}
```

##返回状态说明
通过 HTTP Status Code 来说明 API 请求是否成功. 下面的表格展示了可能的 HTTP Status Code 以及其含义

|状态码|含义|说明|
|------|----|----|
|200|OK|请求成功|
|201|CREATED|创建成功|
|202|ACCEPTED|更新成功|
|400|BAD REQUEST|请求的地址不存在或者包含不支持的参数|
|401|UNAUTHORIZED|未授权|
|403|FORBIDDEN|被禁止访问|
|404|NOT FOUND|请求的资源不存在|
|500|INTERNAL SERVER ERROR|内部错误|

##通用的错误码

|错误码|错误信息|含义|status code|
|------|--------|----|-----------|
|10|unknow_v1_error|未知错误|400|
|11|need_permission|需要权限|403|
|12|uri_not_found|资源不存在|404|
|13|missing_args|参数不全|400|
|14|image_too_large|上传图片太大|400|
|15|has_ban_word|输入有违禁词|400|
|16|target_not_found|相关的对象不存在|400|
|17|image_unknow|不支持的图片格式|400|
|18|image_wrong_format|照片格式有误(仅支持JPG,GIF,PNG)|400|

##Bookcase
####添加书籍

```
POST    /v1/books/
```

|参数|意义|备注|
|----|----|----|
|必选|
|isbn|||
|可选|
|title|标题||
|alt|豆瓣链接||
|author|作者|数组|
|image|豆瓣图片链接||
|tags||数组|
|isdonated|该书是否被捐赠|如果被捐赠,就设置 owner 值为 113|
|donor|捐赠人|数组|
|pub_date|出版时间||

返回: status=201 及 该图书的信息(单个对象)


####更新书籍信息

```
PUT    /v1/books/
```

|参数|意义|备注|
|----|----|----|
|必选|
|isbn|||
|可选|
|title|标题||
|alt|豆瓣链接||
|author|作者|数组|
|image|豆瓣图片链接||
|tags||数组|
|isdonated|该书是否被捐赠|如果被捐赠,就设置 owner 值为 113|
|donor|捐赠人|数组|
|pub_date|出版时间||

返回: status=202 及 该图书的信息(单个对象)


####删除图书

```
DELETE  /v1/books/
```

返回: status=200, OK


####fields参数选择需求的指定字段
- 对于使用 GET 方式获取数据的 API, 可以通过 `fields` 参数指定返回数据中的信息项的字段,以减少返回数据中并不需要的部分
- `fields` 参数的格式支持用逗号分隔字段名, 没有 `fields` 参数或者 `fields` 参数为 `all` 表示不做过滤

Ex.
```
GET /v1/books/isbn?fields=isbn,title
```

返回数据:
```
{
    "isbn": "1234567890123",
    "title": "没有这本书"
}
```


####获取图书

```
GET /v1/books/
```

|参数|意义|备注|
|----|----|----|
|start|取结果的 offset|默认为 0|
|count|取结果的条数|默认为 20, 最大 50|

返回status=200,
```
{
    "start": 0,
    "count": 20,
    "total": 50,
    "books": []
}
```


####根据isbn获取图书信息

```
GET /v1/books/isbn/:name
```

返回图形信息,status=200


####搜索图书

```
GET /v1/books/s
```

|参数|意义|备注|
|----|----|----|
|q|查询关键字|q和tag必传其一|
|tag|查询的tag|q和tag必传其一|
|start|取结果的 offset|默认 0|
|count|去结果的条数|默认 20, 最大 100|

返回: status=200,
```
{
    "start": 0,
    "count": 20,
    "total": 30,
    "books": []
}
```

##Old version API
####Edit books
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
    donor: 捐赠人, array
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

####Get books in wunderlist - pagination
```json
method: GET

uri: /wunderlist/get?page=int&pmax=max_books_each_page&sort=sort_method
Ex: /wunderlist/get?page=1&pmax=8&sort=updated_at


return:
    {
        "pages": 3,
        "page": 1,
        books: [
            {
                "isbn": "...",
                "created_at": "2015-02-16 00:00:00",
                "updated_at": "2015-02-16 00:00:00",
                ...
                voter: [
                    {
                        "member_id": "20xx2323",
                        ...
                    }
                ]
            }, 
            ...
        ]
    }

    or

    "no_page" | "invalid_pmax" | "no_sort" | "no_sort_field" | "illegal_request"`

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


##Python module
`passlib`, `pymongo`, `tornado`


##Server about
```shell
nginx 1.6.2 - proxy pass
supervisor - daemon
    |
    |--server.py
```
