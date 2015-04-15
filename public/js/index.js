/**********************************************
 * 
 *********************************************/
function DonateBook() {
    Book.call(this); // inheritance
}
inheritPrototype(DonateBook, Book);

DonateBook.prototype.showList = function () {
    // first clean the page
    cleanAllChilden($('.show-block'));
    // basic inf show
    this.show();
    var objBook = this;

    // for donate html
    
    // click submit
    var donateTip = $('<div class="donate-tip">提醒：书籍捐出后，原所有者 有权将书从bookcase中抽出。</div>');
    var donateSubmit = $('<button type="submit" class="donate-identify">确认捐献</button>');

    donateSubmit.click(function () {
        // if no books
        if (objBook.bookInf.isbn == '') {
            alert("请正确输入所捐书籍的ISBN");
            return;
        } else {
            submitDonateReq(objBook);
        }
    });

    this.node.append(donateTip);
    this.node.append(donateSubmit);
}
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

//
// work for donate.html
//
function handleDonatePage() {
    // change the style of nav
    $('#public-nav .borrow').css('color', '#767779');
    $('#public-nav .donate').css('color', '#0084B5');
    $('#public-nav .wunderlist').css('color', '#767779');

    var isbnBox = $('#search-box');

    isbnBox.focus(function () {
        // lister to Enter when focus on search-box 
        $(this).keydown(function (event) {
            var e = event || window.event;

            // if not Enter key, return
            if (e && e.keyCode != 13) return;
            // get book from douban
            getDonateBook(isbnBox.val());

        });
    });
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

function getDonateBook(isbnCode) {

    var url = 'https://api.douban.com/v2/book/search?q=' + isbnCode + '&count=1';

    // CROS
    $.ajax({
        url: url,
        type: 'GET',
        async: false,
        dataType: 'jsonp',
        jsonp: 'callback'
    })
    .done(function (resData) {
        showList(resData);
    })
    .fail(function () {
        alert('Something wrong, try again later.');
    });
}

function submitDonateReq(_objBook) {

    var sendData = _objBook.bookInf;
    // add some needed
    sendData.donor = CookieUtil.get("identify", "userId");
    sendData._xsrf = CookieUtil.get('_xsrf') || '';
    // change the method that an array to send
    sendData.author = JSON.stringify(_objBook.bookInf.author);
    sendData.tags = JSON.stringify(_objBook.bookInf.tags);

    $.ajax({
        url: '/book/edit',
        type: 'post',
        async: true,
        data: sendData,
    })
    .done(function (resData) {
        var res = resData;
        // if err
        if (res.errcode == 1) {
            alert("失败");
        } else {
            alert("捐赠成功！");
            location.href = '/donate.html';
        }
    });
}