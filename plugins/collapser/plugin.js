(function() {
    function isCollapsible(types) {
        return types.indexOf('object') >= 0 || 
            types.indexOf('array') >= 0;
    }
    addVisualizingEventListener(
        'renderproperty',
        function(e) {
            var span = document.createElement('span');
            var text = isCollapsible(e.propertyType) ? '-\u00A0' : '\u2022\u00A0';
            span.className = 'property-hint';
            span.appendChild(document.createTextNode(text));
            e.target.insertBefore(span, e.target.firstChild);
        }
    );

    var agent = getAgentFor('*');
    agent.on(
        'mousedown',
        '.property-hint',
        function(e) {
            var text = e.target.textContent.trim();
            if (text.indexOf('+') >= 0) {
                e.target.parentNode.classList.remove('collapsed');
                e.target.innerHTML = '-\u00A0';
            }
            else if (text.indexOf('-') >= 0) {
                e.target.parentNode.classList.add('collapsed');
                e.target.innerHTML = '+\u00A0';
            }
        }
    );
}());