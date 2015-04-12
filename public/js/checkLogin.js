// CookieUtil.get()/CookieUtil.set()
// use to set cookie
//
var CookieUtil = {

    get: function (name) {
        var cookieName = encodeURIComponent(name) + '=',
            cookieStart = document.cookie.indexOf(cookieName),
            cookieValue = null;

        if (cookieStart > -1) {
            var cookieEnd = document.cookie.indexOf(';', cookieStart);
            if (cookieEnd == -1) cookieEnd = document.cookie.length;
            cookieValue = decodeURIComponent(document.cookie.substring(cookieStart
                          + cookieName.length, cookieEnd));
        }
        return cookieValue;
    },

    set: function (name, value, expires, path, domain, secure) {
        var cookieText = encodeURIComponent(name) + '=' + encodeURIComponent(value);

        if (expires instanceof Date) {
            cookieText += '; expires=' + expires.toGMTString();
        }

        if (path) cookieText += '; path=' + path;

        domain && (cookieText += '; domain=' + domain);

        secure && (cookieText += '; secure');

        document.cookie = cookieText;
    },

    unset: function (name, path, domain, secure) {
        this.set(name, '', new Date(0), path, domain, secure);
    }
};


// send authentication request
//
$.ajax({
    url: '/auth/',
    type: 'get',
    async: false
})
.done(function (resData) {
    var res = resData;
    if (res.errcode && res.errcode == 1) {
        document.title != 'Continue-login' && (location.href = '/login.html');
    } else {
        // if has login, record the userId as browser identify
        CookieUtil.set('identify', res.member_id);
    }
});


