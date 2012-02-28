(function() {
    var editorTemplate = 
        '<div class="boolean-editor">' + 
            '<span class="true">true</span>' + 
            '<span class="false">false</span>' + 
        '</div>';

    function setValue(value, element) {
        element.innerHTML = value;

        var popup = plugin.requestAttachedPopupFor(element);
        if (popup) {
            var current = $(popup.dom).find('.' + value);
            current.siblings().removeClass('current');
            current.addClass('current');
        }
    }

    // 初始化boolean-editor
    // CTRL+单击取反
    $('#root').on(
        'click',
        '.boolean>.value>span, .value.boolean>span',
        function(e) {
            var target = e.target;
            var currentValue = target.innerHTML.trim() === 'true' ? true : false;

            // 如果按着CTRL则取反
            if (e.ctrlKey) {
                setValue(!currentValue, target);
            }
            // 否则显示编辑器
            else {
                var popup = plugin.requestPopup();
                popup.dom.innerHTML = editorTemplate;
                $(popup.dom).find('.' + currentValue).addClass('current');
                popup.attachTo(target);

                // 选择true/false值
                $(popup.dom.firstElementChild).on(
                    'click',
                    '.true, .false',
                    function(e) {
                        var value = e.target.innerHTML.trim() === 'true' ? true : false;

                        setValue(value, target);
                    }
                );
            }

            return false;
        }
    );
}());