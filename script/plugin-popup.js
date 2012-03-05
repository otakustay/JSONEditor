(function() {
    function create() {
        var element = $('<div class="popup"><div class="popup-content"></div><span class="popup-anchor">工具弹出层</span></div>');
        var content = element.children('.popup-content');
        var anchor = element.children('.popup-anchor');
        var attached = false;
        var disposed = false;

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
                .appendTo($.body);
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
            var scrollLeft = $.window.scrollLeft();
            var scrollTop = $.window.scrollTop();
            var offset = target.offset();
            // 目标元素尺寸
            var targetWidth = target.outerWidth();
            var targetHeight = target.outerHeight();
            // 页宽
            var pageWidth = $.document.width();
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
         * 解除Popup，在销毁Popup时，其内部的元素都将使用jQuery移除，即元素上的事件和数据都将销毁。
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

            $.document.off('mousedown', autoDispose);

            attached = false;
            disposed = true;
        }

        /**
         * 判断当前Popup是否关联在指定元素上。
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
        $.document.on('mousedown', autoDispose);

        return $.spawn({
            dom: content[0],
            attachTo: attachTo,
            dispose: dispose,
            isAttachedTo: isAttachedTo,
            canUse: {
                get: function() {
                    return !disposed;
                }
            }
        });
    }

    // 同一时间只允许有一个Popup出现
    var current = null;

    /**
     * 向插件系统请求一个Popup。
     * Popup是一个小型的弹出层，可以容纳一定的内容，并与一个元素关联。
     * 在与元素关联时，Popup会计算自己最适合出现的位置，随后会保持与元素的相对位置不变。
     * 默认情况下，系统同一时间只允许一个Popup存在，如果有新的申请Popup的请求，则将先前的一个销毁。
     * 对于Popup的实例个数，随着系统的发展可能会有所变更。
     *
     * @returns {object} 一个Popup对象。
     */
    requestPopup = function() {
        if (current) {
            current.dispose(true);
        }

        current = create();
        return current;
    };

    /**
     * 向插件系统请求与指定元素关联的Popup。
     *
     * @param {Element} 判断关联目标的DOM元素。
     * @returns {object} 如果有Popup且与指定的元素存在关联则返回该Popup对象，否则返回null
     */
    requestAttachedPopupFor = function(element) {
        var available = current;
        if (available && available.canUse && available.isAttachedTo(element)) {
            return available;
        }
        else {
            return null;
        }
    };
}());