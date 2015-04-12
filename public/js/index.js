
// 
// choose which part of js code execute
//
var pageTitle = document.title;

switch (pageTitle) {
    case 'Continue-login':
        handleLoginPage();
        break;
    case 'Continue-donate':
        handleDonatePage();
        break;
}

//
// work for login.html
//
function handleLoginPage() {

    // submit bottom
    var submit = $('.login-buttom');

    var passwordNode = $('.password');

    // listen to Enter key
    passwordNode.focus(function () {
        this.onkeydown = function (event) {
            var e = event || window.event;

            if (e && e.keyCode != 13) return;
            else {
                submitLoginReq();
            }
        }
    });
    // listen to Submit bottom
    submit.click(function () {
        submitLoginReq();
    })
}

var bookInf = {};
//
// work for donate.html
//
function handleDonatePage() {

    
    // change the style of nav
    var publicNav = document.getElementById('public-nav');
    publicNav.getElementsByClassName('borrow')[0].style.color = '#767779';
    publicNav.getElementsByClassName('donate')[0].style.color = '#0084B5';
    publicNav.getElementsByClassName('wonderlist')[0].style.color = '#767779';


    var isbnBox = document.getElementById('search-box');

    isbnBox.onfocus = function () {
        // lister to Enter when focus on search-box 
        this.onkeydown = function (event) {
            var e = event || window.event;

            // if not Enter key, return
            if (e && e.keyCode != 13) return;
            
            var isbnCode = isbnBox.value;
            
            var url = 'https://api.douban.com/v2/book/isbn/' + isbnCode;

            // CROS
            $.ajax({
                url: url,
                type: 'GET',
                async: false,
                dataType: 'jsonp',
                jsonp: 'callback'
            })
            .done(function (resData) {
                reflashBookInf(resData);
            })
            .fail(function () {
                alert('Something wrong, try again later.');
            });
        }
    }

    // click submit
    var donateSubmit = document.getElementById('donate-identify');

    donateSubmit.onclick = function () {
        if (!bookInf.isbn) {
            alert("请正确输入所捐书籍的ISBN");
            return;
        } else {
            var xhr = new XMLHttpRequest();
            xhr.onload = function () {

                var res = JSON.parse(xhr.responseText);
                // if err
                if (res.errcode == 1) {
                    alert("失败");
                } else {
                    alert("捐赠成功！");
                    location.href = '/donate.html';
                }
            }

            // remark the book inf 
            var data = new FormData();
            data.append('isbn', bookInf.isbn);
            data.append('title', bookInf.title);
            data.append('alt', bookInf.alt);
            data.append('author', bookInf.author);
            data.append('publisher', bookInf.publisher);
            data.append('pub_date', bookInf.pubDate);
            data.append('image', bookInf.image);
            data.append('tags', bookInf.tags);
            data.append('donor', bookInf.donor);
            // forbid cros
            data.append('_xsrf', CookieUtil.get('_xsrf') || '');

            //Object.toString(bookInf)
            xhr.open('post', '/book/edit', true);
            //xhr.setRequestHeader("_xsrf", document.cookie._xsrf || '');
            xhr.send(data);
            //
        }
    }
}

function reflashBookInf (json) {

    // if not found this book
    if (json.msg && json.msg == 'book_not_found') {
        return;
    } else {
        // reflash the inf on web
        var bookInfNode = document.getElementsByClassName('book-inf')[0];

        bookInfNode.getElementsByClassName('cover')[0].setAttribute("src", json.images.large);
        bookInfNode.getElementsByClassName('get-more')[0].setAttribute("href", json.alt);

        bookInfNode.getElementsByClassName('title')[0].lastChild.innerText
            = json.title;
        bookInfNode.getElementsByClassName('author')[0].lastChild.innerText
            = json.author[0];
        bookInfNode.getElementsByClassName('publisher')[0].lastChild.innerText
            = json.publisher;
        bookInfNode.getElementsByClassName('publish-time')[0].lastChild.innerText
            = json.pubdate;
        bookInfNode.getElementsByClassName('isbn')[0].lastChild.innerText
            = json.isbn13 || json.isbn10;
        
        // store the book inf
        bookInf.isbn      = json.isbn13;
        bookInf.title     = json.title;
        bookInf.alt       = json.alt;
        bookInf.author    = json.author;
        bookInf.publisher = json.publisher;
        bookInf.pubDate   = json.pubdate;
        bookInf.image     = json.images.large;
        bookInf.tags      = json.tags;

        bookInf.donor = CookieUtil.get("identify", "userId");
    }
    
}


function submitLoginReq() {
    var tip = $('.login-tip');//document.getElementById('login-tip');

    var username = $('.username').val();
    var password = $('.password').val();

    if (username == '' || password == '') {
        tip.html('请输入账号、密码。');
        tip.slideDown('fast');
        return;
    }

    $.ajax({
        url: '/auth/login',
        type: 'post',
        async: 'true',
        data: {
            'member_id': username,
            'password': password,
            '_xsrf': CookieUtil.get('_xsrf') || ''
        }
    })
    .done(function (resData) {
        var res = resData;
        if (res.errcode && res.errcode == 1) {
            tip.html('账号或密码错误！');
            tip.slideDown('fast');
        } else {
            location.href = '/wunderlist.html';
        }
    });
}