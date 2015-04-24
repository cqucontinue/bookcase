// Prototypal Inheritance in JavaScript
function object(o) {
    function F() { }
    F.prototype = o;
    return new F();
}
// Parasitic combined inheritance
function inheritPrototype(subType, superType) {
    var prototype = object(superType.prototype);
    prototype.constructor = subType;
    subType.prototype = prototype;
}

var bookArray = [];
function Book() {
    // basic infmation
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

    // create a new node
    var bookInfNode = $('<div></div>');
    bookInfNode.attr('class', 'book-inf');

    var detailHTML = '<img class="cover" /><div class="details"><span class="title inf">书名： <span></span></span><span class="author inf">作者： <span></span></span><span class="publisher inf">出版社： <span></span></span><span class="publish-time inf">出版时间： <span></span></span><span class="isbn inf">ISBN： <span></span></span><a class="get-more" href="javascript:;" target="_blank">了解更多</a></div>';
    bookInfNode.append(detailHTML);

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

    document.title == 'Continue-wunderlist' && !boolAddWunder && $('#wunder-list').append(this.node);
    document.title == 'Continue-wunderlist' && boolAddWunder && $('#show-block').append(this.node);
    document.title == 'Continue-donate' && $('.show-block').append(this.node);
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

    //var bookArray = [];
    
    for (var i = 0; i < count; ++i) {
        // if this is for wunderlist part
        if (document.title == 'Continue-wunderlist' && boolAddWunder == false) {
            var temp = new WunderBook();
            temp.voteCount = res[i].vote_count;
            temp.voter = res[i].voter;
        }
        // if this is for add wunderlist part
        else if ((document.title == 'Continue-wunderlist' && boolAddWunder == true)) {
            var temp = new AddWunderBook();
        }
            //  if (document.title == 'Continue-donate')
        else {
            var temp = new DonateBook();
        }
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
        }

        // show
        temp.showList();
        // save
        bookArray.push(temp);
        //console.log(bookArray)
    }

    return bookArray;
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