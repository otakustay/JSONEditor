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
        dom.firstElementChild.on(
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

    var agent = getAgentFor('value').ofType('boolean');
    var popup = behavior.popup();
    popup.on('fill', createEditor);
    agent.addBehavior(popup);
}());