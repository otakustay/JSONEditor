(function() {
    var testData = JSON.stringify(
{"id":473515839,"description":"GoodWallet存储在移动所有必要的数据。此应用程序的目的不是纯粹是为了存储用户名,密码,PIN码等,但也如服装,信用卡资料或社会安全号码的大小其他类型的数据!您决定如何使用这个伟大的应用程序!\n\n/ /它是如何工作的?\n所有你要记住,从现在起是一个密码,允许访问应用程序,让你的数据是私有的。\n\n/ / iCloud的\n此应用程序同步,使备份使用苹果iCloud的最新技术!\n\n//加密\n所有数据被加密两次。所以,如果你失去你的iPhone,iPad或iPod触摸,可以确保您的数据是安全的。\n\n/ /安全特性\n将于后3分钟或闲置,如果你关闭应用程序。您也可以手动注销。\n\n//型号\n该应用程序为您的记录型号,作为信用卡,护照或一个网上帐户模型的模型(这样就可以存储,如亚马逊,eBay和Twitter网站的认证模式)。\n\n//设计专业\n我们认为一个关于此应用程序的设计,因为我们希望您能够存储和访问他们的数据快速和容易。\n\n//更新\n我们不断完善和更新GoodWallet。我们强烈建议您告诉我们您认为可以做得更好,这是电子邮件地址:feedback@wegenerlabs.com。\n请联系我们,如果有一些东西是翻译错误。","largeIconUrl":"http://a3.mzstatic.com/us/r1000/101/Purple/5a/f2/38/mzl.gixhdcdw.175x175-75.png","seller":{"name":"Erik Wegener","viewUrl":"http://www.wegenerlabs.com/"},"releaseNotes":"错误修正","censoredName":"GoodWallet","contentRating":"4+","contentAdvisoryRating":"4+","averageUserRating":null,"userRatingCount":null,"languages":["EN"],"categories":[{"id":6007,"name":"效率","alias":"productivity"},{"id":6000,"name":"商业","alias":"business"}],"screenshotUrls":["http://a3.mzstatic.com/us/r1000/076/Purple/c6/f5/34/mzl.bdvtjjmu.png","http://a4.mzstatic.com/us/r1000/089/Purple/c1/7f/6c/mzl.foyftxov.png","http://a5.mzstatic.com/us/r1000/117/Purple/d1/58/50/mzl.owatmkqv.png","http://a1.mzstatic.com/us/r1000/113/Purple/f8/a1/52/mzl.qdixkhjm.png","http://a2.mzstatic.com/us/r1000/086/Purple/ac/3a/33/mzl.zjphlxzy.png"],"iPadScreenshotUrls":["http://a2.mzstatic.com/us/r1000/100/Purple/20/5a/d7/mzl.hzgpixao.1024x1024-65.jpg","http://a1.mzstatic.com/us/r1000/070/Purple/bf/81/5a/mzl.egfhgxce.1024x1024-65.jpg","http://a3.mzstatic.com/us/r1000/110/Purple/52/d3/44/mzl.szatrrug.1024x1024-65.jpg","http://a4.mzstatic.com/us/r1000/079/Purple/01/d9/44/mzl.jdvbofpi.1024x1024-65.jpg","http://a2.mzstatic.com/us/r1000/091/Purple/16/7f/76/mzl.jdmyoqcp.1024x1024-65.jpg"],"languagePriority":100,"brief":{"id":473515839,"name":"GoodWallet","version":"1.7","releaseDate":"\/Date(1324616704000+0800)\/","price":0.0,"currency":"CNY","fileSize":2024163,"viewUrl":"http://itunes.apple.com/cn/app/goodwallet/id473515839?mt=8&uo=4","iconUrl":"http://a3.mzstatic.com/us/r1000/101/Purple/5a/f2/38/mzl.gixhdcdw.100x100-75.png","introduction":"GoodWallet存储在移动所有必要的数据。此应用程序的目的不是纯粹是为了存储用户名,密码,PIN码等,但也如服装,信用卡资料或社会安全号码的大小其他类型的数据!您决定如何使用这个伟大的应用程序!\n\n/ /它是如何工作的?\n所有你要记住,从现在起是一个密码,允许访问应用程序,让你的数据是私有的。\n\n/ / iCloud的\n此应用程序同步,使备份使用苹果iCloud的最新技术!\n\n//加密\n所有","releaseNotes":"错误修正","primaryCategory":{"id":6007,"name":"效率","alias":"productivity"},"developer":{"id":424482392,"name":"wegenerlabs","viewUrl":"http://itunes.apple.com/cn/artist/wegenerlabs/id424482392?uo=4"},"averageUserRatingForCurrentVersion":null,"userRatingCountForCurrentVersion":null,"features":["iosUniversal"],"supportedDevices":["all"],"deviceType":4,"isGameCenterEnabled":false,"lastValidUpdate":{"id":0,"app":473515839,"time":"\/Date(1329857935000+0800)\/","type":5,"oldValue":"1.6","newValue":"1.7","isPriceUpdate":false},"languagePriority":100,"isActive":true}});

    function toggleDragUI(e) {
        e.preventDefault();
        e.stopPropagation();

        $(e.target).toggleClass('drag-over');
    }

    function setAcceptDrop(e) {
        e.dataTransfer.dropEffect = 'move';
        e.preventDefault();
    }

    function readFromFile(e) {
        e.preventDefault();

        var target = $(e.target);
        target.toggleClass('drag-over');

        if (e.dataTransfer.files.length) {
            var file = e.dataTransfer.files[0];
            var reader = new FileReader();
            reader.onload = function() { target.val(this.result); };
            reader.readAsText(file);
        }
        else {
            var text = e.dataTransfer.getData('text');
            target.val(text);
        }
    }

    $('textarea')
        .on('dragenter', toggleDragUI)
        .on('dragover', setAcceptDrop)
        .on('dragleave', toggleDragUI)
        .on('drop', readFromFile);

    $('#submit').on(
        'click',
        function(e) {
            e.preventDefault();

            var text = document.querySelector('#json').value;
            visualize(text, true);
        }
    );

    $('#test').on(
        'click',
        function() {
            document.querySelector('#json').value = testData;
        }
    );
}());