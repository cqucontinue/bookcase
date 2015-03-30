
var wunderlistArray = [];

function Wunderlist() {
    // create a new node
    var bookInfNode = document.createElement('div');
    bookInfNode.className = "book-inf";

    var detailHTML = '<img class="cover" /><div class="details"><span class="title inf">书名： <span></span></span><span class="author inf">作者： <span></span></span><span class="publisher inf">出版社： <span></span></span><span class="publish-time inf">出版时间： <span></span></span><span class="isbn inf">ISBN： <span></span></span><a class="get-more" href="javascript:;" target="_blank">了解更多</a></div>'
    bookInfNode.innerHTML = detailHTML;

    // infmation
    this.image = "";
    this.title = "";
    this.author = "";
    this.publisher = "";
    this.pubDate = "";
    this.isbn = "";
    this.alt = "";
    this.createTime = "";
    this.tags = [];

    this.node = bookInfNode;
}

Wunderlist.prototype.show = function () {
    
    // basic node
    this.node.getElementsByClassName('cover')[0].setAttribute("src", this.image);
    this.node.getElementsByClassName('get-more')[0].setAttribute("href", this.alt);

    this.node.getElementsByClassName('title')[0].lastChild.innerText
        = this.title;
    this.node.getElementsByClassName('author')[0].lastChild.innerText
        = this.author;
    this.node.getElementsByClassName('publisher')[0].lastChild.innerText
        = this.publisher;
    this.node.getElementsByClassName('publish-time')[0].lastChild.innerText
        = this.pubDate;
    this.node.getElementsByClassName('isbn')[0].lastChild.innerText
        = this.isbn;

    // specail node
    this.handleSpecialNode();

    // show
    document.getElementById('wunder-list').appendChild(this.node);
    //document.getElementById('content').appendChild(this.node);

}

//
// There have some special node in diffrent page
//
Wunderlist.prototype.handleSpecialNode = function () {
    var objWunder = this;

    // if the page is add-wunderlist.html
    if (pageTitle == 'Continue-add-wunderlist') {
        // create a botton
        var button = document.createElement('button');
        button.innerText = '添加入愿望清单';
        button.className = 'submit-wunder';

        // add Listen to this button
        button.onclick = function () {
            submitWunder(objWunder);
        };

        // append this node
        this.node.appendChild(button);
    }

    // if the page is wunderlist.html
    if (pageTitle == 'Continue-wunderlist') {

        var otherInf = document.createElement('div');
        otherInf.className = 'other-inf';

        var otherInfHTML = '<span class="create-time inf">添加时间： <span></span></span><span class="want-too inf"><span>我也想看： </span></span><span class="want-too-list inf">张世宝、陈敏、米文卓等人也想看</span>'
        otherInf.innerHTML = otherInfHTML;

        // insert HTML
        this.node.appendChild(otherInf);

        // listen to LIKE event
        var butLike = document.createElement('img');
        butLike.className = 'want-ico';
        butLike.src = '/static/imgs/want-icon.png';

        otherInf.getElementsByClassName('want-too')[0].appendChild(butLike);

        butLike.onclick = function () {
            submitVote(objWunder);
        }
    }
}

//
// when want to add a book to wunderlist
//
function submitWunder(objWunder) {
    //alert(objWunder.isbn);
    var xhr = new XMLHttpRequest();

    xhr.onload = function () {
        var res = JSON.parse(xhr.responseText);

        if (res.errcode && res.errcode == 1) {
            alert('Something wrong! Try again later');
        } else {
            alert('Success!');
        }
    }

    // the data
    var data = new FormData();
    
    data.append('isbn', objWunder.isbn);
    data.append('title', objWunder.title);
    data.append('alt', objWunder.alt);
    data.append('author', objWunder.author);
    data.append('publisher', objWunder.publisher);
    data.append('pub_date', objWunder.pubDate);
    data.append('image', objWunder.image);
    data.append('tags', objWunder.tags);

    xhr.open('post', '/wunderlist/edit', true);
    xhr.setRequestHeader("_xsrf", document.cookie._xsrf || '');
    xhr.send(data);
}

//
// vote to some boos
//
function submitVote(objBook) {
    alert(objBook.isbn);
    var xhr = new XMLHttpRequest()
    var url = '/wunderlist/vote?isbn=' + objBook.isbn;

    xhr.onload = function () {
        var res = JSON.parse(xhr.responseText);

        // if something wrong
        if (res.errcode && res.errcode == 1) {
            alert('There has somethinf wrong! Please try agian later!');
        } else {
            alert('Vote successful!');
            // TODO
        }
    }
    xhr.onerror = function () { alert('err!');}

    xhr.open('get', url, true);
    xhr.send();
}

function showWunderlist(res) {

    // if something wrong
    if (res.msg && res.msg == 'book_not_found') {
        alert("Something wrong!");
        return;
    }

    //if (res instanceof Object) {
    //    res = res.books;
    //}
    if (pageTitle == 'Continue-add-wunderlist') {
        res = res.books;
    }

    // the number of wunderlist
    var count = res.length;
    for (var i = 0; i < count; ++i) {
        var temp = new Wunderlist();
        temp.image = res[i].image;
        temp.title = res[i].title;
        temp.author = res[i].author; // TODO: author is a array
        temp.publisher = res[i].publisher;
        temp.pubDate = res[i].pub_date || res[i].pubdate;
        temp.alt = res[i].alt;
        temp.createTime = res[i].create_at || '';
        temp.isbn = res[i].isbn13 || res[i].isbn;
        temp.tags = res[i].tags;

        // show
        temp.show();
    }
}

// start
//
// choose which part of js code execute
//
var pageTitle = document.title;

switch (pageTitle) {
    case 'Continue-wunderlist':
        handleWunderlistPage();
        break;
    case 'Continue-add-wunderlist':
        handleWunderlistAdd();
        break;
}

function handleWunderlistPage() {
    document.onreadystatechange = function () {

        // change the style of nav
        var publicNav = document.getElementById('public-nav');
        publicNav.getElementsByClassName('borrow')[0].style.color = '#767779';
        publicNav.getElementsByClassName('donate')[0].style.color = '#767779';
        publicNav.getElementsByClassName('wonderlist')[0].style.color = '#0084B5';

        var xhr = new XMLHttpRequest();

        xhr.onload = function () {
            var res = JSON.parse(xhr.responseText);
            showWunderlist(res);
        }

        xhr.open('get', '/wunderlist/get', true);
        xhr.send();
    }
}

function handleWunderlistAdd() {
    var isbnBox = document.getElementById('search');

    isbnBox.onfocus = function () {
        // lister to Enter when focus on search-box 
        this.onkeydown = function (event) {
            var e = event || window.event;

            // if not Enter key, return
            if (e && e.keyCode != 13) return;

            // remove all node that searched just now
            var father = document.getElementById('content');
            var childen = father.childNodes;
            for (var i = 0; i < childen.length; ++i) {
                father.removeChild(childen[0]);  // there have some problem
            }

            var isbnCode = isbnBox.value;

            var url = 'https://api.douban.com/v2/book/search?q=' + isbnCode + '&count=5';

            // CROS
            $.ajax({
                url: url,
                type: 'GET',
                async: false,
                dataType: 'jsonp',
                jsonp: 'callback',
                success: function (json) {
                    showWunderlist(json)
                },
                error: function () {
                    alert('fail');
                }
            });
        }
    }
}