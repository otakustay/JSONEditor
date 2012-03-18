(function() {
    var infoSection = requestInfoSection(200, true);

    function displayPath(path) {
        infoSection.innerHTML = '//' + path.join('/');
    }

    var agent = getAgentFor('*');
    agent.on(
        'mouseover',
        function(e) {
            var target = e.calculatedTarget;
            while (!target.classList.contains('property')) {
                target = target.parentNode;
            }
            target.classList.add('highlight');

            if (infoSection) {
                displayPath(e.accessor.path);
            }
        }
    );
    agent.on(
        'mouseout',
        function(e) {
            var target = e.calculatedTarget;
            while (!target.classList.contains('property')) {
                target = target.parentNode;
            }
            target.classList.remove('highlight');
        }
    );
}());