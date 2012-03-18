(function() {
    // TODO: 美化Toolbar
    var toolbarTemplate = 
        '<div class="toolbar">' + 
            '<div class="info-bar"><span class="info-version">JSON Editor v0.8</div>' + 
            '<div class="menu-bar"></div>' +
        '</div>'
    var bar = $(toolbarTemplate).prependTo('#visual');
    var infoBar = bar.children('.info-bar');
    var menuBar = bar.children('.menu-bar');
    var versionLabel = infoBar.children('.info-version');
    var itemTemplate = '<div class="toolbar-item {name}">{text}</div>';

    /**
     * 向Toolbar中添加一项。
     *
     * @param {object} options 待添加项的配置。
     * @param {string} options.name 添加项的名称即标识符。
     * @param {string} options.text 添加项的显示标签内容。
     * @param {function} options.click 该项被点击时响应的函数。
     */
    window.addToolbarItem = function(options) {
        var html = $.formatTempalte(itemTemplate, options);
        var item = $(html).appendTo(menuBar);
        if (options.click) {
            item.on('click', options.click);
        }
    };

    /**
     * 申请InfoBar上的一块区域。
     *
     * @param {number} maxWidth 需要申请的区域的最大宽度
     * @param {boolean} [allowFallback=false] 如果宽度不够，是否允许返回一个宽度较小的区域
     * @return {Element|null} 如果有足够的宽度来容纳申请的区域，或者允许使用更小的区域，则返回一个容器元素，否则返回null
     */
    window.requestInfoSection = function(maxWidth, allowFallback)　{
        // 把所有的section都拉到max-width的宽，然后计算剩余空间
        function calculateWidth(dom) {
            dom = $(dom);
            // 引起一次Layout，考虑到插件不会频繁调用这个函数，以实现简便为第一要素
            dom.css('width', dom.css('max-width'));
            var width = dom.outerWidth();
            dom.css('width', '');
            return width;
        }
        var totalWidth = [].reduce.call(
            infoBar.children('.info-section').map(calculateWidth),
            function(x, y) { return x + y; },
            0
        );
        var visual = $('#visual');
        var isVisible = visual.is(':visible');
        if (!isVisible) {
            visual.show();
        }
        var availableWidth = infoBar.width() - totalWidth - versionLabel.width();
        if (!isVisible) {
            visual.hide();
        }
        if (availableWidth < maxWidth && !allowFallback) {
            return null;
        }

        var section = document.createElement('div');
        section.style.maxWidth = maxWidth + 'px';
        versionLabel.before(section);

        return section;
    };
}());