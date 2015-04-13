

var boolAddWunder = false; // use to mark wheather add-wunderlist-block is 'block'
var currPage = 1; // use to mark curr page
var allPages = 1; // use to mark total count of pages
var sortWay = 'updated_at'; // the wunderlist's sort way, default is based on update time


//
// listetn to sort way
//
var timeOrder = $('#time-order');
var popOrder = $('#pop-order');

timeOrder.click(function () {

    // change the style of order-block
    timeOrder.css('color', '#528BB8'); // focus on time-order
    popOrder.css('color', '#A0A0A0');

    sortWay = 'updated_at';
    listenTurnOpetation(sortWay);
});

popOrder.click(function () {

    // change the style of order-block
    popOrder.css('color', '#528BB8'); // focus on pop-order
    timeOrder.css('color', '#A0A0A0');

    sortWay = 'vote_count';
    listenTurnOpetation(sortWay);
});

//
// when want to add a book to wunderlist
//
function submitWunder(objWunder) {
    //CROS
    //objWunder.bookInf._xsrf = CookieUtil.get('_xsrf') || '';
    console.log(objWunder.bookInf)
    $.ajax({
        url: '/wunderlist/edit',
        type: 'post',
        async: true,
        //data: objWunder.bookInf + { "_xsrf": CookieUtil.get('_xsrf') || ''}
        data: {
            'image': objWunder.bookInf.image,
            'title': objWunder.bookInf.title,
            'author': objWunder.bookInf.author[0],
            'publisher': objWunder.bookInf.publisher,
            'pub_date': objWunder.bookInf.pub_date,
            'isbn': objWunder.bookInf.isbn,
            'alt': objWunder.bookInf.alt,
            'tags': objWunder.bookInf.tags,
            '_xsrf': CookieUtil.get('_xsrf') || ''
        }
    })
    .done(function (resData) {
        var res = resData;

        if (res.errcode && res.errcode == 1) {
            // show the err tip block
            var errTip = $('#add-wunderlist-content .err-tip');
            errTip.css('display', 'block');
            if (res.errmsg && res.errmsg == 'book_got') {
                $('#err-message').html('此书已有，返回并查看');
            }
            else if (res.errmsg && res.errmsg == 'book_exist') {
                $('#err-message').html('此本书在愿望清单中已存在，返回并查看');
            }
        } else {
            alert('Success!');
            // turn to wunderlist.html
            location.href = '/wunderlist.html';
        }
    });
}

//
// vote to some boos
//
function submitVote(objBook) {

    var url = '/wunderlist/vote?isbn=' + objBook.bookInf.isbn;

    $.ajax({
        url: url,
        type: 'get',
        async: true
    })
    .done(function (resData) {
        var res = resData;

        // if something wrong
        if (res.errcode && res.errcode == 1) {
            console.log(res.errmsg);
            alert('There has something wrong! Please try agian later!');
        } else {
            // refresh the count of vote
            // TODO: when vote success, upload some information
            $('.want-ico', objBook.node).attr('src', '/static/imgs/had-want-icon.png');
            $('.vote-count', objBook.node).html(++objBook.voteCount);
        }
    });
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
        // no result
        $('.err-tip').css('display', 'block');
        $('#err-message').html('无结果，请核对后在输入');
    }

    for (var i = 0; i < count; ++i) {
        
        var temp = new Book();
        temp.bookInf.image = res[i].image;
        temp.bookInf.title = res[i].title;
        temp.bookInf.author = res[i].author; // TODO: author is a array
        temp.bookInf.publisher = res[i].publisher;
        temp.bookInf.pub_date = res[i].pub_date || res[i].pubdate;
        temp.bookInf.alt = res[i].alt;
        temp.bookInf.createTime = res[i].create_at || '';
        temp.bookInf.isbn = res[i].isbn13 || res[i].isbn;
        temp.bookInf.tags = res[i].tags;

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
    $('#public-nav .borrow').css('color', '#767779');
    $('#public-nav .donate').css('color', '#767779');
    $('#public-nav .wunderlist').css('color', '#0084B5');
    
    // listen to add-wunderlist-block occupied
    //var addWunder = document.getElementById('my-wunderlist');
    var addWunder = $('#my-wunderlist');
    addWunder.click(function () {

        // hidden the err tip block
        $('#add-wunderlist-content .err-tip').css('display', 'none');
        var addWunderContent = $('#add-wunderlist-content');
        addWunderContent.css('display', 'block');

        // clean
        cleanAllChilden($('#show-block'));
        // TODO: cleanAllChilden

        boolAddWunder = true;
        // listen to handleWunderlistAdd
        handleWunderlistAdd();

        // listen to shot down add wunderlist
        var shotDown = $('#shot-down-add-wunder');
        shotDown.click(function () {
            boolAddWunder = false;
            addWunderContent.css('display', 'none');
        });
    });

    // listen to some operator like next, prev
    listenTurnOpetation(sortWay); // default sortWay = updated_at
}


//
// add a book to wunderlist
//
function handleWunderlistAdd() {
    var isbnBox = document.getElementById('add-wunder-search');
    var isbnBox = $('#add-wunder-search');

    isbnBox.focus(function () {
        // lister to Enter when focus on search-box 
        $(this).keydown(function (event) {

            // hidden err when input agian
            $('.err-tip').css('display', 'none');

            var e = event || window.event;

            // if not Enter key, return
            if (e && e.keyCode != 13) return;

            $('#searching-tip').css('display', 'block');
            // remove all node that searched just now
            cleanAllChilden($('#show-block'));

            // submit
            submitWunderlistAdd(isbnBox.val());
        });
    });
}

function submitWunderlistAdd(_isbn) {
    var isbnCode = _isbn;

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


//
// get books form wunderlist
//
function getWunderlist(turnedPage, sort) {
    // send wunderlist require
    var url = '/wunderlist/get?' + 'page=' + turnedPage
        + '&' + 'sort=' + sort;

    $.ajax({
        url: url,
        type: 'get',
        async: false
    })
    .done(function (resData) {
        // TODO: why
        var res = JSON.parse(resData);
        showList(res);
    })
}


//
// listen to smoe operation, just like next page
//
function listenTurnOpetation(_sortWay) {

    // clean page
    cleanAllChilden($('#wunder-list')); 
    // get the first page of wunderlist
    getWunderlist(1, _sortWay);
    // uppdate
    updatePages();

    // next page
    var nextPage = $('#wunderlist-content .next-page');
    nextPage.click(function () {
        if (currPage == allPages) {
            alert('This is the last page!');
            return;
        }
        cleanAllChilden($('#wunder-list')); // clean page
        getWunderlist(++currPage, _sortWay);
        updatePages();
    });

    // prev page
    var prePage = $('#wunderlist-content .pre-page');
    prePage.click(function () {
        if (currPage == 1) {
            alert('This is the first page!');
            return;
        }
        cleanAllChilden($('#wunder-list')); // clean page
        getWunderlist(--currPage, _sortWay);
        updatePages();
    })

    // first page
    var firstPage = $('#wunderlist-content .first-page');
    firstPage.click(function () {
        cleanAllChilden($('#wunder-list')); // clean page
        currPage = 1;
        getWunderlist(currPage, _sortWay);
        updatePages();
    });

    // last page
    var lastPage = $('#wunderlist-content .last-page');
    lastPage.click(function () {
        cleanAllChilden($('#wunder-list')); // clean page
        currPage = allPages;
        getWunderlist(currPage, _sortWay);
        updatePages();
    });
    
}

//
// clean all of childen under the node
//
function cleanAllChilden(father) {
    var childen = father.children();
    var childenLength = childen.length;
    for (var i = 0; i < childenLength; ++i) {
        childen[i].remove();  // there have some problem
    }
}

//
// update the count of curr page and total page
//
function updatePages() {
    $('#wunderlist-content .curr').html(currPage);
    $('#wunderlist-content .total').html(allPages);
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