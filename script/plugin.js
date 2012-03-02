var plugin = {};

plugin.isInVisualMode = function() {
    return location.href.indexOf('/visual') >= 0;
};

(function() {
    var body = $('body');
    var win = $(window);
    var doc = $(document);

    function defineProperty(o, name, value) {
        // Property Descriptor
        if (typeof value === 'object' && 
            ('value' in value || 'get' in value || 'set' in value)) {
            Object.defineProperty(o, name, value);
        }
        // Direct Value
        else {
            Object.defineProperty(o, name, { value: value });
        }
    }

    function spawn(properties) {
        var o = {};
        for (var key in properties) {
            if (properties.hasOwnProperty(key)) {
                var value = properties[key];
                defineProperty(o, key, value);
            }
        }
        return o;
    }

    //ModalFrame
    function ModalFrame() {
        var frame = $('<div class="modal-frame"></div>').hide();
        var modal = $('<div class="modal"></div>').hide();
        var disposed = false;

        function canUse() {
            return !disposed;
        }

        function show() {
            if (disposed) {
                return;
            }

            frame.appendTo(body);
            modal.appendTo(body).show();

            /*
             * 按以下方法定位：
             * 1. 尽量放在窗口中间
             * 2. 如果纵向空间不够，则向上移动，最多离上边距有{padding}的距离
             * 3. 如果超出视窗，交给视窗的滚动条处理
             */
            var pageWidth = win.width();
            var pageHeight = win.height();
            var scrollTop = win.scrollTop();
            var scrollLeft = win.scrollLeft();
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

        function dispose() {
            if (disposed) {
                return;
            }

            if (this.contentReusable) {
                frame.children().detach();
            }

            frame.remove();
            modal.remove();

            disposed = true;
        }

        function isActive() {
            return frame.is(':visible');
        }

        var context = spawn({
            dom: frame[0],
            show: show,
            dispose: dispose,
            isActive: isActive,
            canUse: canUse,
            contentReusable: false
        });

        modal.on('mousedown', dispose.bind(context));

        return context;
    }

    // 单例维护，只允许出现一个ModalFrame
    ModalFrame.current = null;

    plugin.requestModalFrame = function() {
        /*
         * 如果已经有一个ModalFrame在显示，则无法使用
         * 如果拿到ModalFrame但保留实例而不显示，则可能会被后续请求抢占，导致该ModalFrame无法显示
         */
        if (ModalFrame.current && ModalFrame.current.isActive()) {
            return null;
        }

        if (ModalFrame.current) {
            ModalFrame.current.dispose();
        }
        ModalFrame.current = ModalFrame();
        return ModalFrame.current;
    };

    // Popup
    function Popup() {
        var element = $('<div class="popup"><div class="popup-content"></div><span class="popup-anchor">工具弹出层</span></div>');
        var content = element.children('.popup-content');
        var anchor = element.children('.popup-anchor');
        var attached = false;
        var disposed = false;

        function canUse() {
            return !disposed;
        }

        /**
         * 将Popup关联到指定元素上
         *
         * @param {Element} 指定元素的选择器、DOM对象或jQuery对象
         */
        function attachTo(target) {
            if (disposed) {
                return;
            }

            target = $(target);
            // 重设Popup的样式
            element
                .removeClass('popup-above popup-below')
                .css('top', 0).css('left', 0)
                .hide()
                .appendTo(body);
            // 重设三角箭头的样式
            anchor.css('left', '');
            /*
             * 定位Popup方法:
             * 1. 把Popup加入到body，以便计算宽和高。
             * 2. 把Popup放到目标元素的上方，居中对齐。
             * 3. 如果Popup的上边界在可视区域以外，则放到目标元素的下面。
             * 4. 按以下步骤调整水平位置：
             *    4.1. 如果Popup的左边界在可视区域以外，则贴住左边缘。
             *    4.2. 否则如果Popup的右边界在可视区域以外，则贴住右边缘。
             */
            var win = $(window);
            var scrollLeft = win.scrollLeft();
            var scrollTop = win.scrollTop();
            var offset = target.offset();
            // 目标元素尺寸
            var targetWidth = target.outerWidth();
            var targetHeight = target.outerHeight();
            // 页宽
            var pageWidth = $(document).width();
            // 三角箭头的尺寸
            var anchorWidth = anchor.outerWidth() / 2;
            var anchorHeight = anchor.outerHeight() / 2;
            // Popup的尺寸
            var popupHeight = element.outerHeight() + anchorHeight;
            var popupWidth = element.outerWidth();
            // 紧贴边缘时留白
            var dockPadding = 4;
            // 实际计算的位置
            var left = offset.left + (targetWidth / 2) - (popupWidth / 2);
            var top = offset.top - popupHeight;

            if (top < scrollTop + dockPadding) { // 3
                top = offset.top + targetHeight + anchorHeight;
                element.addClass('popup-below');
            }
            else {
                element.addClass('popup-above');
            }
            if (left < scrollLeft) { // 4.1
                left = scrollLeft + dockPadding;
            }
            else if (left + popupWidth > scrollLeft + pageWidth) { // 4.2
                left = scrollLeft + pageWidth - popupWidth - dockPadding;
            }

            element.css('top', top).css('left', left).stop(true, true).fadeIn();

            /*
             * 三角箭头位置计算方法:
             * 1. 让三角箭头与目标元素的中间点对齐。
             * 2. 进一步调整:
             *    2.1 如果超出左边界，则紧贴左边缘，此情况下Popup肯定也贴着左边缘。
             *    2.2 否则如果超出右边缘，则紧贴右边缘，此情况下Popup肯定也贴着右边缘。
             */
            var middlePoint = offset.left + (targetWidth / 2);
            var anchorLeft = middlePoint - left;

            if (anchorLeft < scrollLeft) { // 2.1
                anchorLeft = 0;
            }
            else if (anchorLeft + anchorWidth > pageWidth) { // 2.2
                anchorLeft = '100%';
            }
            anchor.css('left', anchorLeft);

            attached = target[0];
        }

        /**
         * 解除Popup
         *
         * @param {boolean} [immediate=false] 指定是否立即消失，如值为false则有动画渐隐效果。
         */
        function dispose(immediate) {
            if (disposed) {
                return;
            }

            if (immediate) {
                element.remove();
            }
            else {
                element.stop(true, true).fadeOut(function() { element.remove(); });
            }

            doc.off('mousedown', autoDispose);

            attached = false;
            disposed = true;
        }

        /**
         * 判断当前Popup是否关联在指定元素上
         *
         * @param {Element} 判断关联目标的选择器、DOM元素或jQuery对象
         * @returns {boolean} Popup是否与指定的元素关联
         */
        function isAttachedTo(target) {
            if (disposed || !attached) {
                return false;
            }

            // 目标元素为当前停靠的元素本身或者其子元素
            return target === attached || $.contains(attached, target);
        }

        // 在目标元素及popup自身以外的地方点击鼠标，将popup销毁
        function autoDispose(e) {
            var dom = element[0];
            if (dom !== e.target && !$.contains(dom, e.target) && !isAttachedTo(e.target)) {
                dispose();
            }
        }
        doc.on('mousedown', autoDispose);

        var context = spawn({
            dom: content[0],
            attachTo: attachTo,
            dispose: dispose,
            isAttachedTo: isAttachedTo,
            canUse: canUse
        });

        return context;
    }

    // 同一时间只允许有一个Popup出现
    Popup.current = null;

    /**
     * 向插件系统请求一个Popup
     *
     * @returns {object} 如有可用Popup则返回Popup对象，否则返回null
     */
    plugin.requestPopup = function() {
        if (Popup.current) {
            Popup.current.dispose(true);
        }

        Popup.current = Popup();
        return Popup.current;
    };

    /**
     * 向插件系统请求与指定元素关联的Popup
     *
     * @param {Element} 判断关联目标的选择器、DOM元素或jQuery对象
     * @returns {object} 如果有Popup且与指定的元素存在关联则返回该Popup对象，否则返回null
     */
    plugin.requestAttachedPopupFor = function(element) {
        var available = Popup.current;
        if (available && available.canUse() && available.isAttachedTo(element)) {
            return available;
        }
        else {
            return null;
        }
    };
}());

// Popup
(function() {
}());

// Toolbar
(function() {
    // TODO: 美化Toolbar
    var bar = $('<div class="toolbar"></div>').prependTo('body');
    var itemTemplate = '<div class="toolbar-item {0}">{1}</div>';

    // TODO: mouseenter的情况下后退至input怎么处理？增加visualModeChanged事件？
    bar.hover(
        function() {
            if (plugin.isInVisualMode()) {
                bar.addClass('active');
            }
        },
        function() {
            bar.removeClass('active');
        }
    );

    plugin.addToolbarItem = function(options) {
        var html = itemTemplate.replace(/\{0\}/, options.name).replace(/\{1\}/, options.text);
        var item = $(html).appendTo(bar);
        if (options.click) {
            item.on('click', options.click);
        }
    };
}());
