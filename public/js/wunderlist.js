

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

    this.voteCount = 0;
    this.voter = [];

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
    !boolAddWunder && document.getElementById('wunder-list').appendChild(this.node);
    boolAddWunder && document.getElementById('show-block').appendChild(this.node);

}

//
// There have some special node in diffrent page
//
Wunderlist.prototype.handleSpecialNode = function () {
    var objWunder = this;

    // if the page is add-wunderlist.html
    if (boolAddWunder == true) {
        // create a botton
        var button = document.createElement('button');
        button.innerText = ' + 添加 ';
        button.className = 'submit-add-wunder';

        // add Listen to this button
        button.onclick = function () {
            submitWunder(objWunder);
        };

        // append this node
        //this.node.appendChild(button);
        this.node.insertBefore(button, this.node.firstChild);
    }

    // if the page is wunderlist.html
    if (boolAddWunder == false) {

        var otherInf = document.createElement('div');
        otherInf.className = 'other-inf';

        var otherInfHTML = '<span class="create-time inf">添加时间： <span></span></span><span class="want-too inf"><span>我也想看： </span></span>';
        otherInf.innerHTML = otherInfHTML;

        // insert HTML
        this.node.appendChild(otherInf);

        // add like botton
        var butLike = document.createElement('img');
        butLike.className = 'want-ico';
        // listen to LIKE event, if didn't vote before
        if (hadVoted(objWunder)) {
            butLike.src = '/static/imgs/had-want-icon.png';
            butLike.style.cursor = 'not-allowed';
            butLike.onclick = function () {
                // do nothing;
            }
        }
        else if (!hadVoted(objWunder)) {
            butLike.src = '/static/imgs/want-icon.png';
            butLike.onclick = function () {
                submitVote(objWunder);
            }
        }

        otherInf.getElementsByClassName('want-too')[0].appendChild(butLike);

        // add vote count
        var voteCount = document.createElement('span');
        voteCount.className = 'vote-count';
        voteCount.innerText = this.voteCount || '';

        otherInf.getElementsByClassName('want-too')[0].appendChild(voteCount);

        // add want-too-list
        var wantList = document.createElement('span');
        wantList.className = 'want-too-list inf';

        var wantListStr = '';
        var wantListLength = this.voter.length;
        for (var i = wantListLength - 1; i >= 0 && (wantListLength - i) <= 3; --i) {
            wantListStr += this.voter[i].fullname;
            if ((wantListLength <= 3 && i != 0) || 
                (wantListLength > 3 && (wantListLength - i) != 3)) {
                wantListStr += '、';
            }
        }
        if (wantListLength > 3) {
            wantListStr += '等人也想看';
        } else {
            wantListStr += '也想看'
        }
        // update the innerText
        wantList.innerText = wantListStr;

        otherInf.appendChild(wantList);
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

function showWunderlist(res) {

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
    console.log(count);
    // if there is no book
    if (count == 0) {
        var errTip = document.getElementsByClassName('err-tip')[0];
        errTip.style.display = 'block';

        var errMsg = document.getElementById('err-message');
        errMsg.innerText = '无结果，请核对后在输入';
    }

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
                success: function (json) {
                    document.getElementById('searching-tip').style.display = 'none';
                    showWunderlist(json)
                },
                error: function () {
                    
                }
            });
            //.done(function (data) {
            //    document.getElementById('searching-tip').style.display = 'none';
            //    showWunderlist(data);
            //})
            //.fail(function () {
            //    alert('fail');
            //});
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
        showWunderlist(res);
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