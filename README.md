Book Collection
===

>To manage books in 113

##API
```json
URI: http://book.113continue.com
HTTP Method: POST
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
    msg: ""
    code: 成功 0 错误 1

```

<!--
####Insert books
```json
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
    msg: 先返回空字符串
    code: 成功 0, 失败 1
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
    msg: "book_not_found"
    code: 成功 0, 失败 1
```
-->

####Get all books
```json
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
url: /book/delete

para:
required:
    isbn: string

return:
    msg: "book_not_found"
    code: 成功 0, 失败 1
```
