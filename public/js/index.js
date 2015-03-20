
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

    var submit = document.getElementById('login-buttom');
    var tip = document.getElementById('login-tip');

    submit.onclick = function () {
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;

        if (username == '' || password == '') {
            tip.innerText = '请输入账号、密码。';
            tip.style.display = 'block';
            return;
        }

        var fd = new FormData();
        fd.append('member_id', username);
        fd.append('password', password);

        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            var responJSON = JSON.parse(xhr.responseText);
            if (responJSON.errcode == 1) {
                tip.innerText = '账号或密码错误！';
                tip.style.display = 'block';
            }
        }

        xhr.open('post', '/auth/login', true);
        xhr.send(fd);

    }
}

//
//
//
function handleDonatePage() {

    var isbnBox = document.getElementById('search-box');

    isbnBox.onfocus = function () {
        // lister to Enter when focus on search-box 
        this.onkeydown = function (event) {
            var e = event || window.event;

            // if not Enter key, return
            if (e && e.keyCode != 13) return;
            
            var isbnCode = isbnBox.value;
            
            var url = 'https://api.douban.com/v2/book/isbn/' + isbnCode;

            //var xhr = new XMLHttpRequest();
            
            ////var xhr = createXHR();
            //xhr.onload = function () {
            //    var responJSON = JSON.parse(xhr.responseText);
            //    // if not found this book
            //    if (responJSON.msg && responJSON.msg == 'book_not_found') {
            //        return;
            //    } else {
            //        var bookInf = document.getElementsByClassName('book-inf')[0];
            //        bookInf.getElementsByClassName('title')[0].lastChild.innerText
            //            = responJSON.title;
            //    }
            //}

            //xhr.open("get", url, true);
            //xhr.setRequestHeader("dataType", "jsonp");
            //xhr.send();

            $.ajax({
                url: url,
                type: 'GET',
                async: false,
                dataType: 'jsonp',
                jsonp: "callback",
                success: function (json) {
                    reflashBookInf(json)
                },
                error: function () {
                    alert('fail');
                }
            })
        }
    }
}

function reflashBookInf (json) {

    // if not found this book
    if (json.msg && json.msg == 'book_not_found') {
        return;
    } else {
        var bookInf = document.getElementsByClassName('book-inf')[0];

        bookInf.getElementsByClassName('cover')[0].setAttribute("src", json.images.large);

        bookInf.getElementsByClassName('title')[0].lastChild.innerText
            = json.title;
        bookInf.getElementsByClassName('author')[0].lastChild.innerText
            = json.author[0];
        bookInf.getElementsByClassName('publisher')[0].lastChild.innerText
            = json.publisher;
        bookInf.getElementsByClassName('publish-time')[0].lastChild.innerText
            = json.pubdate;
        bookInf.getElementsByClassName('isbn')[0].lastChild.innerText
            = json.isbn13 || json.isbn10;

    }
    
}

