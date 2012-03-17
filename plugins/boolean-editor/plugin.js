(function() {
    var editorTemplate = 
        '<div class="boolean-editor">' + 
            '<span class="true">true</span>' + 
            '<span class="false">false</span>' + 
        '</div>';

    function createEditor(e) {
        var dom = $(e.popup.dom);
        var target = e.domEvent.target;
        var accessor = e.domEvent.accessor;
        dom.html(editorTemplate);
        dom.find('.' + accessor.value).addClass('current');

        // 选择true/false值
        dom.children(':first').on(
            'click',
            '.true, .false',
            function(e) {
                var value = e.target.innerHTML.trim() === 'true' ? true : false;

                accessor.value = value;
                var popup = requestAttachedPopupFor(target);
                if (popup) {
                    var current = $(popup.dom).find('.' + value);
                    current.siblings().removeClass('current');
                    current.addClass('current');
                }
            }
        );
    }


    function startSlide(e) {
        var originalValue = e.accessor.value;
        // 如果鼠标在20px范围内，不设置值，将原值高亮，否则向左是false，向右是true
        var directionMapping = [originalValue, 'false', 'true'];

        function markValue(e) {
            var popup = requestAttachedPopupFor(e.target);
            var accessor = e.accessor;
            if (popup) {
                var container = popup.dom.firstElementChild;
                $(container).children().removeClass('current');

                var value = directionMapping[e.direction];
                container.querySelector('.' + value).classList.add('current');
            }
        }

        function applyValue(e) {
            var popup = requestAttachedPopupFor(e.target);
            var accessor = e.accessor;
            if (popup) {
                var text = popup.dom.firstElementChild.querySelector('.current').textContent.trim();
                accessor.value = text === 'true' ? true : false;
            }

            this.off('directionchange');
            this.off('end');
        }

        this.on('directionchange', markValue);
        this.on('end', applyValue);
    }

    var agent = getAgentFor('value').ofType('boolean');

    var popup = behavior.popup();
    popup.on('fill', createEditor);
    agent.addBehavior(popup);

    var slide = behavior.slide(2, 0); // 分左右2个方向
    slide.on('start', startSlide);
    agent.addBehavior(slide);
}());