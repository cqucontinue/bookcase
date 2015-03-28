
var wunderlistArray = [];

function Wunderlist() {
    var bookInfNode = document.createElement('div');
    bookInfNode.className = "book-inf";

    var detailHTML = '<img class="cover" /><div class="details"><span class="title inf">书名： <span></span></span><span class="author inf">作者： <span></span></span><span class="publisher inf">出版社： <span></span></span><span class="publish-time inf">出版时间： <span></span></span><span class="isbn inf">ISBN： <span></span></span><a class="get-more" href="javascript:;" target="_blank">了解更多</a></div>'
    bookInfNode.innerHTML = detailHTML;

    // infmation
    this.coverURL = "";
    this.title = "";
    this.author = "";
    this.publiser = "";
    this.publishTime = "";
    this.isbn = "";
    this.getMore = "";
    this.createTime = "";
    this.node = bookInfNode;
}

Wunderlist.prototype.show = function () {
    
    this.node.getElementsByClassName('cover')[0].setAttribute("src", this.coverURL);
    this.node.getElementsByClassName('get-more')[0].setAttribute("href", this.getMore);

    this.node.getElementsByClassName('title')[0].lastChild.innerText
        = this.title;
    this.node.getElementsByClassName('author')[0].lastChild.innerText
        = this.author;
    this.node.getElementsByClassName('publisher')[0].lastChild.innerText
        = this.publiser;
    this.node.getElementsByClassName('publish-time')[0].lastChild.innerText
        = this.publishTime;
    this.node.getElementsByClassName('isbn')[0].lastChild.innerText
        = this.isbn;

    // show
    document.getElementsByTagName('body')[0].appendChild(this.node);

}




var test = document.getElementById('test');

test.onclick = function () {

    var xhr = new XMLHttpRequest();

    xhr.onload = function () {
        var res = JSON.parse(xhr.responseText);
        handleWunderlist(res);
    }

    xhr.open('get', '/wunderlist/get', true);
    xhr.send();
}

function handleWunderlist(res) {
    // the number of wunderlist
    var count = res.length;
    console.log(count);
    for (var i = 0; i < count; ++i) {
        var temp = new Wunderlist();
        temp.coverURL = res[i].image;
        temp.title = res[i].title;
        temp.author = res[i].author[0];
        temp.publiser = res[i].publiser;
        temp.publishTime = res[i].pub_date;
        temp.getMore = res[i].alt;
        temp.createTime = res[i].create_at;

        // show
        temp.show();
        
    }
    alert(detailHTML);
}