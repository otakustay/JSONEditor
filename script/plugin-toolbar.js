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
}());