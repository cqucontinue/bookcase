
function Book() {
    // create a new node
    var bookInfNode = $('<div></div>')//document.createElement('div');
    //bookInfNode.className = "book-inf";
    bookInfNode.attr('class', 'book-inf');

    var detailHTML = '<img class="cover" /><div class="details"><span class="title inf">书名： <span></span></span><span class="author inf">作者： <span></span></span><span class="publisher inf">出版社： <span></span></span><span class="publish-time inf">出版时间： <span></span></span><span class="isbn inf">ISBN： <span></span></span><a class="get-more" href="javascript:;" target="_blank">了解更多</a></div>'
    //bookInfNode.innerHTML = detailHTML;
    bookInfNode.append(detailHTML);

    // infmation
    this.bookInf = {
        image: '',
        title: '',
        author: [],
        publisher: '',
        pub_date: '',
        isbn: '',
        alt: '',
        tags: []
    }

    this.voteCount = 0;
    this.voter = [];

    this.node = bookInfNode;
}

Book.prototype.show = function () {

    // basic node
    $('.cover', this.node).attr('src', this.bookInf.image);
    $('.get-more', this.node).attr('href', this.bookInf.alt);

    $('.title', this.node).children(":last").html(this.bookInf.title);
    $('.author', this.node).children(":last").html(this.bookInf.author[0]);
    $('.publisher', this.node).children(":last").html(this.bookInf.publisher);
    $('.publish-time', this.node).children(":last").html(this.bookInf.pub_date);
    $('.isbn', this.node).children(":last").html(this.bookInf.isbn);

    // specail node
    this.handleSpecialNode();

    // show
    //!boolAddWunder && document.getElementById('wunder-list').appendChild(this.node);
    document.title == 'Continue-wunderlist' && !boolAddWunder && $('#wunder-list').append(this.node);
    document.title == 'Continue-wunderlist' && boolAddWunder && $('#show-block').append(this.node);
    document.title == 'Continue-donate' && $('.show-block').append(this.node)
}

//
// There have some special node in diffrent page
//
Book.prototype.handleSpecialNode = function () {
    var objWunder = this;

    // if the page is add-wunderlist.html
    if (document.title == 'Continue-wunderlist' && boolAddWunder == true) {
        // create a botton
        var button = $('<button> + 添加 </button>')
        button.addClass('submit-add-wunder');

        // add Listen to this button
        button.click(function () {
            submitWunder(objWunder);
        });

        // append this node
        button.insertBefore(this.node.children(':first'));
    }

    // if the page is wunderlist.html
    else if (document.title == 'Continue-wunderlist' && boolAddWunder == false) {

        //var otherInf = document.createElement('div');
        //otherInf.className = 'other-inf';
        var otherInf = $('<div></div>');
        otherInf.addClass('other-inf');

        var otherInfHTML = '<span class="create-time inf">添加时间： <span></span></span><span class="want-too inf"><span>我也想看： </span></span>';
        otherInf.append(otherInfHTML);

        // insert HTML
        this.node.append(otherInf);

        // add like botton
        //var butLike = document.createElement('img');
        //butLike.className = 'want-ico';
        var butLike = $('<img />');
        butLike.addClass('want-ico');

        // listen to LIKE event, if didn't vote before
        if (hadVoted(objWunder)) {
            butLike.attr('src', '/static/imgs/had-want-icon.png');
            butLike.css('cursor', 'not-allowed');
            butLike.click(function () {
                return;
                // do nothing;
            });
        }
        else if (!hadVoted(objWunder)) {
            butLike.attr('src', '/static/imgs/want-icon.png')
            butLike.css('cursor', 'pointer');
            butLike.click(function () {
                submitVote(objWunder);
            });
        }

        // add vote count
        var voteCount = $('<span></span>');
        voteCount.addClass('vote-count');
        voteCount.html(this.voteCount || '');

        // add want-too-list
        var wantList = $('<span></span>');
        wantList.addClass('want-too-list').addClass('inf');

        $('.want-too', otherInf).append(butLike);
        $('.want-too', otherInf).append(voteCount)

        // update the innerText
        wantList.html(wantListStr(this.voter));
        
        otherInf.append(wantList);
    }

    // for donate html
    else if (document.title == 'Continue-donate') {
        cleanAllChilden($('.show-block'));
        // click submit
        var donateTip = $('<div class="donate-tip">提醒：书籍捐出后，原所有者 有权将书从bookcase中抽出。</div>');
        var donateSubmit = $('<button type="submit" class="donate-identify">确认捐献</button>');

        donateSubmit.click(function () {
            // if no books
            if (objWunder.bookInf.isbn == '') {
                alert("请正确输入所捐书籍的ISBN");
                return;
            } else {
                submitDonateReq(objWunder);
            }
        });
    }

    objWunder.node.append(donateTip);
    objWunder.node.append(donateSubmit);
}


// function
// return a want read str
//
function wantListStr(_voter) {
    var wantListStr = '';
    var wantListLength = _voter.length;
    for (var i = wantListLength - 1; i >= 0 && (wantListLength - i) <= 3; --i) {
        wantListStr += _voter[i].fullname;
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

    return wantListStr;
}

function showList(res) {

    // if something wrong
    if (res.errcode && res.errcode == 1) {
        alert("Something wrong!");
        return;
    }
    // refresh the total pages
    allPages = res.pages || '';

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
        temp.bookInf.publisher = res[i].publisher;
        temp.bookInf.pub_date = res[i].pub_date || res[i].pubdate;
        temp.bookInf.alt = res[i].alt;
        temp.bookInf.createTime = res[i].create_at || '';
        temp.bookInf.isbn = res[i].isbn13 || res[i].isbn;

        // TODO: author and tags is a array
        typeof res[i].author == 'string'
            && (temp.bookInf.author = JSON.parse(res[i].author));
        typeof res[i].author == 'object'
            && (temp.bookInf.author = res[i].author);
        // tags is a array
        for (var j = 0; j < res[i].tags.length; ++j) {
            temp.bookInf.tags[j] = res[i].tags[j].name;
            console.log(temp.bookInf.tags)
        }

        // if this is for wunderlist part
        res[i].vote_count && (temp.voteCount = res[i].vote_count);

        temp.voter = res[i].voter;

        // show
        temp.show();
    }
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