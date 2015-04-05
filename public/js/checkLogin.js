
var xhrLogin = new XMLHttpRequest();
xhrLogin.onload = function () {
    var res = JSON.parse(xhrLogin.responseText);
    if (res.errcode && res.errcode == 1) {
        document.title != 'Continue-login' && (location.href = '/login.html');
    } else {
        // if has login, record the userId as browser identify
        //SubCookieUtil.set("identify", "userId", res.member_id);
        CookieUtil.set('identify', res.member_id);
    }

}
xhrLogin.open("get", "/auth/");
xhrLogin.send();


// subCookieUtil object
// - document.cookie=data=name=xxx&phone=123456
//
var SubCookieUtil = {
    get: function (name, subName) {
        var subCookies = this.getAll(name);
        if (subCookies) {
            return subCookies[subName];
        } else {
            return null;
        }
    },

    getAll: function (name) {
        var cookieName = encodeURIComponent(name) + "=",
            cookieStart = document.cookie.indexOf(cookieName),
            cookieValue = null,
            cookieEnd,
            subCookies,
            i, len,     // add self
            parts,
            result = {};

        if (cookieStart > -1) {
            cookieEnd = document.cookie.indexOf(";", cookieStart);
            if (cookieEnd == -1) {
                cookieEnd = document.cookie.length;
            }
            cookieValue = document.cookie.substring(cookieStart + cookieName.length, cookieEnd);

            if (cookieValue.length > 0) {
                subCookies = cookieValue.split("&");

                for (i = 0, len = subCookies.length; i < len; i++) {
                    parts = subCookies[i].split("=");
                    result[decodeURIComponent(parts[0])] =
                        decodeURIComponent(parts[1]);
                }

                return result;
            }
        }

        return null;
    },

    set: function (name, subName, value, expires, path, domain, secure) {
        var subcookies = this.getAll(name) || {};
        subcookies[subName] = value;
        this.setAll(name, subcookies, expires, path, domain, secure);
    },

    setAll: function (name, subcookies, expires, path, domain, secure) {

        var cookieText = encodeURIComponent(name) + "=",
            subcookieParts = [],
            subName;

        for (subName in subcookies) {
            if (subName.length > 0 && subcookies.hasOwnProperty(subName)) {
                subcookieParts.push(encodeURIComponent(subName) + "=" +
                    encodeURIComponent(subcookies[subName]));
            }
        }

        if (subcookieParts.length > 0) {
            cookieText += subcookieParts.join("&");

            if (expires instanceof Date) {
                cookieText += "; expires=" + expires.toGMTString();
            }

            if (path) {
                cookieText += "; path=" + path;
            }

            if (domain) {
                cookieText += "; domain=" + domain;
            }

            if (secure) {
                cookieText += "; secure";
            }
        } else {
            cookieText += "; expires=" + (new Date(0)).toGMTString();
        }

        document.cookie = cookieText;
    },

    unset: function (name, subName, path, domain, secure) {
        var subcookies = this.getAll(name);
        if (subcookies) {
            delete subcookies[subName];
            this.setAll(name, subcookies, null, path, domain, secure);
        }
    },

    unsetAll: function (name, path, domain, secure) {
        this.setAll(name, null, new Date(0), path, domain, secure);
    }
};

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