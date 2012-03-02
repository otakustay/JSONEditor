(function() {
    function visualizeTo(o, element) {
        element = element || document.getElementById('root');

        for (var key in o) {
            generatePropertySection(key, o[key], element);
        }
    }
    window.visualizeTo = visualizeTo;

    function visualize(text, addHistoryEntry) {
        var o = {};
        try {
            o = JSON.parse(text);
        }
        catch (syntaxError) {
            notify(
                'error', 
                'JSON格式错误', 
                ['输入JSON格式无法通过<code>JSON.parse</code>解析，以下为错误信息：', syntaxError.message].join('<br />')
            );
            return;
        }

        visualizeTo(o);
        $('#page').hide();
        $('#root').show();

        if (addHistoryEntry) {
            history.replaceState(text, 'JSON Visualizer', 'home');
            history.pushState(text, 'JSON Visualizer', 'visual');
        }
    }
    window.visualize = visualize;

    function createElement(nodeName, className, textContent) {
        var element = document.createElement(nodeName);
        if (className) {
            element.className = className;
        }
        if (textContent != null) {
            element.appendChild(document.createTextNode(textContent));
        }
        return element;
    }

    function generatePropertySection(key, value, container) {
        var type = getType(value);
        var wrapper = createElement('div', 'property ' + type);

        var keyElement = createElement('span', 'key', key);
        wrapper.appendChild(keyElement);

        var valueElement = createElement('div', 'value');
        blockGenerator[type](value, valueElement);
        wrapper.appendChild(valueElement);

        container.appendChild(wrapper);
    }

    var blockGenerator = {
        simple: function(value, container) {
            var span = createElement('span', '', value)
            container.appendChild(span);
        },

        null: function(value, container) {
            blockGenerator.simple('null', container);
        },

        undefined: function(value, container) {
            blockGenerator.simple('undefined', container);
        },

        boolean: function(value, container) {
            blockGenerator.simple(value, container);
        },

        number: function(value, container) {
            blockGenerator.simple(value, container);
        },

        string: function(value, container) {
            blockGenerator.simple('"' + value + '"', container);
        },

        array: function(array, container) {
            var start = createElement('span', 'array-start', '[');
            container.appendChild(start);

            var content = createElement('div', 'array-content');
            for (var i = 0; i < array.length; i++) {
                var item = array[i];
                var type = getType(item);
                var wrapper = createElement('div', 'value ' + type, '');
                blockGenerator[type](item, wrapper);
                content.appendChild(wrapper);
            }
            container.appendChild(content);

            var end = createElement('span', 'array-end', ']');
            container.appendChild(end);
        },

        object: function(o, container) {
            var start = createElement('span', 'object-start', '{');
            container.appendChild(start);

            var content = createElement('div', 'object-content', '');
            for (var key in o) {
                var value = o[key];
                generatePropertySection(key, value, content);
            }
            container.appendChild(content);

            var end = createElement('span', 'object-end', '}');
            container.appendChild(end);
        }
    };

    function getType(o) {
        return Object.prototype.toString.call(o).slice(8, -1).toLowerCase();
    }
}());

$(document).on(
    'mousedown',
    '.object>.key, .array>.key',
    function(e) {
        var target = $(e.target);
        target.parent().toggleClass('collapsed');
    }
);