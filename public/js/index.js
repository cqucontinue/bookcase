
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

            if (e && e.keyCode != 13) return;
            else {
                alert("hah")
            }
        }
    }
}

