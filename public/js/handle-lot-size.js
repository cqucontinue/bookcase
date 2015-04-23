

var book = [];
var lotDonateSub = $("#lotsize-donate-page .submit");

lotDonateSub.click(function () {

    $('.unsuccess-list').css('display', 'none');

    var content = $("#lotsize-donate-page .donate-list").val();

    if (content == '') {
        alert('There is nothing');
        return;
    }

    content = content.replace(/-/g, '');
    var donateList = content.split('\n');

    for (var i = 0; i < donateList.length; ++i) {
        getDonateBook(donateList[i]);
        //console.log(bookArray[0]);
        //submitDonateReq(bookArray[i]);
    }
    //setTimeout(function () {
    //    console.log(bookArray);
    //}, 10000);
    $('.totall').html(donateList.length);
    var count = 0;

    var submit = setInterval(function () {
        if (bookArray.length > 0) {
            for (var i = 0; i < bookArray.length; ++i) {
                //console.log(bookArray[0]);
                submitDonateReq(bookArray.shift());
                ++count;
                $('.successful').html(count);
            }
            if (count == donateList.length) {
                // if success
                clearTimeout(submit);
            }
            
        }
    }, 1000);

    setTimeout(function () {
        if (count != donateList.length) {
            $('.unsuccess-list').css('display', 'block');
            clearTimeout(submit);
        }
    }, 10000 + bookArray.length * 4000);
})

