var plugin = {};

// Popup
(function() {
    var body = $('body');

    var element = $('<div class="popup"><div class="popup-content"></div><span class="popup-anchor">工具弹出层</span></div>');
    var content = element.children('.popup-content');
    var anchor = element.children('.popup-anchor');
    var attached = false;

    function attachTo(target) {
        if (attached) {
            detach(true);
        }

        target = $(target);
        // 重设Popup的样式
        element
            .removeClass('popup-above popup-below')
            .css('top', 0).css('left', 0)
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
            element.removeClass('popup-above').addClass('popup-below');
        }
        else {
            element.removeClass('popup-below').addClass('popup-above');
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

        attached = target;
    }

    function detach(immediate) {
        if (!attached) {
            return;
        }

        if (immediate) {
            element.hide();
        }
        else {
            element.stop(true, true).fadeOut();
        }

        attached = false;
    }

    function isAttachedTo(target) {
        target = $(target);

        if (!attached) {
            return false;
        }
        if (target[0] === attached[0]) {
            return true;
        }
        return $.contains(attached[0], target[0]);
    }

    element.hide().appendTo(body);

    // 在目标元素及popup自身以外的地方点击鼠标，将popup隐藏
    $(document).on(
        'mousedown',
        function(e) {
            if (element[0] !== e.target && !$.contains(element[0], e.target) && !isAttachedTo(e.target)) {
                detach();
            }

        }
    );

    plugin.requestPopup = function() {
        detach(true);

        return {
            dom: content.empty()[0],
            attachTo: attachTo,
            isAttachedTo: isAttachedTo
        }
    };
    plugin.requestAttachedPopupFor = function(element) {
        if (isAttachedTo(element)) {
            return {
                dom: content[0],
                attachTo: attachTo,
                isAttachedTo: isAttachedTo
            };
        }
        else {
            return null;
        }
    }
}());