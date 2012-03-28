(function() {
    /**
     * 创建ModalFrame
     */
    function create() {
        var frame = $('<div class="modal-frame"></div>').hide();
        var modal = $('<div class="modal"></div>').hide();
        var disposed = false;
        var contentReusable = false;

        function show() {
            if (disposed) {
                return;
            }

            frame.appendTo($.body);
            modal.appendTo($.body).show();

            /*
             * 按以下方法定位：
             * 1. 尽量放在窗口中间
             * 2. 如果纵向空间不够，则向上移动，最多离上边距有{padding}的距离
             * 3. 如果超出视窗，交给视窗的滚动条处理
             */
            var pageHeight = $.window.height();
            var scrollTop = $.window.scrollTop();
            var width = frame.width();
            var height = frame.height();
            var padding = 20;
            var allowedTopAdjust = pageHeight / 2 - padding;
            frame
                .show()
                .css('top', Math.round(scrollTop + (pageHeight / 2) - Math.min(allowedTopAdjust, height / 2)))
                .css('left', '50%')
                .css('margin-left', -Math.round(width / 2));
        }

        /**
         * 销毁当前的ModalFrame。
         * 通常不需要显式地调用此函数，在下一次申请ModalFrame时，上一个会被自动销毁。
         * 如果与该ModalFrame关联的DOM结构非常庞大，需尽快释放以免影响系统性能，则可以显式地调用。
         */
        function dispose() {
            if (disposed) {
                return;
            }

            if (contentReusable) {
                frame.children().detach();
            }

            frame.remove();
            modal.remove();

            disposed = true;
        }

        // 在遮罩层上点击鼠标会使ModalFrame关闭
        modal.on('mousedown', dispose);

        return $.spawn({
            dom: frame[0],
            show: show,
            dispose: dispose,
            isActive: {
                get: function() { return frame.is(':visible'); }
            },
            canUse: {
                get: function() { return !disposed; }
            },
            contentReusable: {
                get: function() { return contentReusable; },
                set: function(value) { contentReusable = value; }
            }
        });
    }

    // 单例维护，只允许出现一个ModalFrame
    var current = null;

    /**
     * 向系统申请一个ModalFrame。
     * ModalFrame是一个在遮罩全屏的半透明层上出现的容器，其中可以放置任何元素。
     * 同一时间只会存在一个ModalFrame，如果申请时有一个ModalFrame已经在显示状态，则申请返回null。
     * ModalFrame在申请后应尽快调用show()函数显示，否则可能被其他插件抢占，
     * 如果申请的ModalFrame不在显示状态，其他插件可以申请一个新的ModalFrame并显示，
     * 在这种情况下，再次调用show()将不会有任何效果，可以通过canUse属性来判断持有的ModalFrame是否可用。
     *
     * 一个ModalFrame对象有以下函数/属性：
     *   dom - 获取ModalFrame的核心DOM对象，可通过将元素填充到该DOM对象中来控制展现的内容。
     *   canUse - 判断是否可以显示当前的ModalFrame。
     *   isActive - 判断当前的ModalFrame是否处在激活状态。
     *   contentReusable - 默认情况下，该值为false，当ModalFrame被销毁时，会使用jQuery删除所有内容，同时删除注册的事件和关联的数据等，导致内容元素无法重用。
     *                     如果需要系统仅移除内容中的DOM元素，而不删除事件和数据等信息，则需要将该值设置为true。
     *   show() - 显示当前的ModalFrame，如果在申请得到ModalFrame后未及时显示，则有可能被其它插件抢占，导致该函数调用没有任何结果。
     *   dispose() - 销毁当前ModalFrame。
     *
     * @return {object|null} 根据是否可以申请ModalFrame，返回一个ModalFrame对象或null。
     */
    window.requestModalFrame = function() {
        /*
         * 如果已经有一个ModalFrame在显示，则无法使用
         * 如果拿到ModalFrame但保留实例而不显示，则可能会被后续请求抢占，导致该ModalFrame无法显示
         */
        if (current && current.isActive) {
            return null;
        }

        if (current) {
            current.dispose();
        }
        current = create();
        return current;
    };
}());