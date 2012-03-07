(function() {
    var editorTemplate = 
        '<div class="boolean-editor">' + 
            '<span class="true">true</span>' + 
            '<span class="false">false</span>' + 
        '</div>';

    function setValue(value, element) {
        element.innerHTML = value;

        var popup = requestAttachedPopupFor(element);
        if (popup) {
            var current = $(popup.dom).find('.' + value);
            current.siblings().removeClass('current');
            current.addClass('current');
        }
    }

    function createEditor(e) {
        var dom = $(e.popup.dom);
        var target = e.domEvent.target;
        var currentValue = target.textContent.trim();
        dom.html(editorTemplate);
        dom.find('.' + currentValue).addClass('current');

        // 选择true/false值
        dom.on(
            'click',
            '.true, .false',
            function(e) {
                var value = e.target.innerHTML.trim() === 'true' ? true : false;

                setValue(value, target);
            }
        );
    }

    var agent = getAgentFor('value').ofType('boolean');
    var popup = behavior.popup();
    popup.on('fill', createEditor);
    agent.addBehavior(popup);
}());