(function() {
    // TODO: 美化Toolbar
    var bar = $('<div class="toolbar"></div>').prependTo('body');
    var itemTemplate = '<div class="toolbar-item {name}">{text}</div>';

    // TODO: mouseenter的情况下后退至input怎么处理？增加visualModeChanged事件？
    bar.hover(
        function() {
            if (isInVisualMode()) {
                bar.addClass('active');
            }
        },
        function() {
            bar.removeClass('active');
        }
    );

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
        var item = $(html).appendTo(bar);
        if (options.click) {
            item.on('click', options.click);
        }
    };
}());