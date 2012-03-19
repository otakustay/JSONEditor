(function() {
    var regex = /^\/Date\(\d+\+\d{4}\)\/$/;

    function pad(n) {
        return n < 10 ? '0' + n : n;
    }

    function render(value, container) {
        var ticks = parseInt(value.substring(6), 10);
        var date = new Date(ticks);
        var str = date.getFullYear() + '-' +
            pad(date.getMonth() + 1) + '-' +
            pad(date.getDate()) + ' ' +
            pad(date.getHours()) + ':' +
            pad(date.getMinutes()) + ':' +
            pad(date.getSeconds());
        if (date.getMilliseconds()) {
            str += '.' + date.getMilliseconds();
        }

        var span = document.createElement('span');
        span.appendChild(document.createTextNode(value));

        var hint = document.createElement('small');
        hint.className = 'date-hint';
        hint.appendChild(document.createTextNode(str));

        container.appendChild(span);
        container.appendChild(hint);
    }

    registerTypeExtension('date', 'string', regex, render);
}());