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
        var offset = target.offset();
        // TODO: 考虑视窗边界情况
        element
            .css('top', offset.top - element.outerHeight() - (anchor.outerHeight() / 2))
            .css('left', offset.left + (target.outerWidth() / 2) - (element.outerWidth() / 2))
            .appendTo(body)
            .stop(true, true)
            .fadeIn();

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