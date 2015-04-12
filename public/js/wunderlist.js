

var boolAddWunder = false; // use to mark wheather add-wunderlist-block is 'block'
var currPage = 1; // use to mark curr page
var allPages = 1; // use to mark total count of pages
var sortWay = 'updated_at'; // the wunderlist's sort way, default is based on update time


//
// listetn to sort way
//
var timeOrder = document.getElementById('time-order');
var popOrder = document.getElementById('pop-order');

timeOrder.onclick = function () {

    // change the style of order-block
    timeOrder.style.color = '#528BB8'; // focus on time-order
    popOrder.style.color = '#A0A0A0';

    sortWay = 'updated_at';
    listenTurnOpetation(sortWay);
}

popOrder.onclick = function () {

    // change the style of order-block
    popOrder.style.color = '#528BB8'; // focus on pop-order
    timeOrder.style.color = '#A0A0A0';

    sortWay = 'vote_count';
    listenTurnOpetation(sortWay);
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
            // show the err tip block
            var errTip = document.getElementById('add-wunderlist-content')
                .getElementsByClassName('err-tip')[0];
            errTip.style.display = 'block';
            if (res.errmsg && res.errmsg == 'book_got') {
                document.getElementById('err-message').innerText = '此书已有，返回并查看';
            }
            else if (res.errmsg && res.errmsg == 'book_exist') {
                document.getElementById('err-message').innerText = '此本书在愿望清单中已存在，返回并查看';
            }
        } else {
            alert('Success!');
            // turn to wunderlist.html
            location.href = '/wunderlist.html';
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
    // forbid cros
    data.append('_xsrf', CookieUtil.get('_xsrf') || '');

    xhr.open('post', '/wunderlist/edit', true);
    //xhr.setRequestHeader("_xsrf", document.cookie._xsrf || '');
    xhr.send(data);
}

//
// vote to some boos
//
function submitVote(objBook) {

    var xhr = new XMLHttpRequest()
    var url = '/wunderlist/vote?isbn=' + objBook.isbn;

    xhr.onload = function () {
        var res = JSON.parse(xhr.responseText);

        // if something wrong
        if (res.errcode && res.errcode == 1) {
            alert('There has something wrong! Please try agian later!');
        } else {
            // refresh the count of vote
            // TODO: when vote success, upload a new vote-icon
            objBook.node.getElementsByClassName('want-ico')[0].src = '/static/imgs/had-want-icon.png';
            objBook.node.getElementsByClassName('vote-count')[0].innerText = ++objBook.voteCount;
        }
    }
    xhr.onerror = function () { alert('err!');}

    xhr.open('get', url, true);
    xhr.send();
}

function showList(res) {

    // if something wrong
    if (res.errcode && res.errcode == 1) {
        alert("Something wrong!");
        return;
    }
    // refresh the total pages
    allPages = res.pages;

    //if (pageTitle == 'Continue-add-wunderlist') {
    //    res = res.books;
    //}
    res = (res.books || res);
    // the number of wunderlist
    var count = res.length;
    // if there is no book
    if (count == 0) {
        var errTip = document.getElementsByClassName('err-tip')[0];
        errTip.style.display = 'block';

        var errMsg = document.getElementById('err-message');
        errMsg.innerText = '无结果，请核对后在输入';
    }

    for (var i = 0; i < count; ++i) {
        var temp = new Book();
        temp.image = res[i].image;
        temp.title = res[i].title;
        temp.author = res[i].author; // TODO: author is a array
        temp.publisher = res[i].publisher;
        temp.pubDate = res[i].pub_date || res[i].pubdate;
        temp.alt = res[i].alt;
        temp.createTime = res[i].create_at || '';
        temp.isbn = res[i].isbn13 || res[i].isbn;
        temp.tags = res[i].tags;

        // if this is for wunderlist part
        res[i].vote_count && (temp.voteCount = res[i].vote_count);
        
        temp.voter = res[i].voter;

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
    //case 'Continue-add-wunderlist':
    //    handleWunderlistAdd();
    //    break;
}

function handleWunderlistPage() {
    // change the style of nav
    var publicNav = document.getElementById('public-nav');
    publicNav.getElementsByClassName('borrow')[0].style.color = '#767779';
    publicNav.getElementsByClassName('donate')[0].style.color = '#767779';
    publicNav.getElementsByClassName('wonderlist')[0].style.color = '#0084B5';

    // listen to add-wunderlist-block occupied
    var addWunder = document.getElementById('my-wunderlist');
    addWunder.onclick = function () {

        // hidden the err tip block
        document.getElementById('add-wunderlist-content')
            .getElementsByClassName('err-tip')[0].style.display = 'none';

        var addWunderCotent = document.getElementById('add-wunderlist-content');
        addWunderCotent.style.display = 'block';

        // clean
        cleanAllChilden(document.getElementById('show-block'));

        boolAddWunder = true;
        // listen to handleWunderlistAdd
        handleWunderlistAdd();

        // listen to shot down add wunderlist
        var shotDown = document.getElementById('shot-down-add-wunder');
        shotDown.onclick = function () {
            boolAddWunder = false;
            addWunderCotent.style.display = 'none';
        }
    }

    // listen to some operator like next, prev
    listenTurnOpetation(sortWay); // default sortWay = updated_at
}


//
// add a book to wunderlist
//
function handleWunderlistAdd() {
    var isbnBox = document.getElementById('add-wunder-search');

    isbnBox.onfocus = function () {
        // lister to Enter when focus on search-box 
        this.onkeydown = function (event) {

            // hidden err when input agian
            var errTip = document.getElementsByClassName('err-tip')[0];
            errTip.style.display = 'none';

            var e = event || window.event;

            // if not Enter key, return
            if (e && e.keyCode != 13) return;

            document.getElementById('searching-tip').style.display = 'block';
            // remove all node that searched just now
            var father = document.getElementById('show-block');
            cleanAllChilden(father);

            var isbnCode = isbnBox.value;

            var url = 'https://api.douban.com/v2/book/search?q=' + isbnCode + '&count=10';

            // CROS
            $.ajax({
                url: url,
                type: 'GET',
                async: false,
                dataType: 'jsonp',
                jsonp: 'callback',
                //ajaxSend: function () {
                    
                //},
            })
            .done(function (resData) {
                document.getElementById('searching-tip').style.display = 'none';
                showList(resData);
            });
        }
    }
}


//
// get books form wunderlist
//
function getWunderlist(turnedPage, sort) {
    // send wunderlist require
    var xhr = new XMLHttpRequest();
    var url = '/wunderlist/get?' + 'page=' + turnedPage
        + '&' + 'sort=' + sort;

    xhr.onload = function () {
        var res = JSON.parse(xhr.responseText);
        showList(res);
    }

    xhr.open('get', url, false); // synchronous
    xhr.send();
}


//
// listen to smoe operation, just like next page
//
function listenTurnOpetation(_sortWay) {

    // clean page
    cleanAllChilden(document.getElementById('wunder-list')); 
    // get the first page of wunderlist
    getWunderlist(1, _sortWay);
    // uppdate
    updatePages();

    // next page
    var nextPage = document.getElementById('wunderlist-content')
        .getElementsByClassName('next-page')[0];
    nextPage.onclick = function () {
        if (currPage == allPages) {
            alert('This is the last page!');
            return;
        }
        cleanAllChilden(document.getElementById('wunder-list')); // clean page
        getWunderlist(++currPage, _sortWay);
        updatePages();
    }

    // prev page
    var prePage = document.getElementById('wunderlist-content')
        .getElementsByClassName('pre-page')[0];
    prePage.onclick = function () {
        if (currPage == 1) {
            alert('This is the first page!');
            return;
        }
        cleanAllChilden(document.getElementById('wunder-list')); // clean page
        getWunderlist(--currPage, _sortWay);
        updatePages();
    }

    // first page
    var firstPage = document.getElementById('wunderlist-content')
        .getElementsByClassName('first-page')[0];
    firstPage.onclick = function () {
        cleanAllChilden(document.getElementById('wunder-list')); // clean page
        currPage = 1;
        getWunderlist(currPage, _sortWay);
        updatePages();
    }

    // last page
    var lastPage = document.getElementById('wunderlist-content')
        .getElementsByClassName('last-page')[0];
    lastPage.onclick = function () {
        cleanAllChilden(document.getElementById('wunder-list')); // clean page
        currPage = allPages;
        getWunderlist(currPage, _sortWay);
        updatePages();
    }
    
}

//
// clean all of childen under the node
//
function cleanAllChilden(father) {
    var childen = father.childNodes;
    var childenLength = childen.length;
    for (var i = 0; i < childenLength; ++i) {
        father.removeChild(childen[0]);  // there have some problem
    }
}

//
// update the count of curr page and total page
//
function updatePages() {
    var curr = document.getElementById('wunderlist-content').getElementsByClassName('curr')[0];
    curr.innerText = currPage;

    var total = document.getElementById('wunderlist-content').getElementsByClassName('total')[0];
    total.innerText = allPages;
}

//
// check whether voted before, if had voted, can't vote again
//
function hadVoted(_objBook) {
    var currUserId = CookieUtil.get('identify');

    var voterLen = _objBook.voter.length;
    for (var i = 0; i < voterLen; ++i) {
        if (currUserId == _objBook.voter[i].member_id) {
            return true;
        }
    }
    return false;
}