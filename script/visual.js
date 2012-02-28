var tabWidth = 4;

(function() {
    function visualize(text, addHistoryEntry) {
        try {
            var o = JSON.parse(text);

            var root = document.getElementById('root');
            root.innerHTML = '';
            for (var key in o) {
                generatePropertySection(key, o[key], root);
            }

            $('#page').hide();
            $('#root').show();

            if (addHistoryEntry) {
                history.replaceState(text, 'JSON Visualizer', 'home');
                history.pushState(text, 'JSON Visualizer', 'visual');
            }
        }
        catch (syntaxError) {
            notify('error', 'JSON格式错误', ['输入JSON格式无法通过<code>JSON.parse</code>解析，以下为错误信息：', syntaxError.message].join('<br />'));
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

    var glyphWidth = (function() {
        var tester = document.createElement('span');
        tester.innerHTML = '0';
        tester.style.position = 'absolute';
        tester.style.visibility = 'hidden';
        document.body.appendChild(tester);
        var width = tester.offsetWidth;
        document.body.removeChild(tester);
        return width;
    }());
    var rules = (function() {
        var sheet = [].filter.call(document.styleSheets, function(s) { return s.href && s.href.indexOf('visual') >= 0; })[0];
        var result = [];

        if (!sheet.cssRules) {
            return result;
        }

        for (var i = 0; i < sheet.cssRules.length; i++) {
            var rule = sheet.cssRules[i];
            if (rule.selectorText === '.array-content, .object-content') {
                result.push({ rule: rule, extra: 2 }); // tab的宽外加key的前缀
            }
            if (rule.selectorText === '.value.object > .object-content' || rule.selectorText === '.object.value > .object-content') {
                result.push({ rule: rule, extra: 0 }); // 没有key
            }
        }
        return result;
    }());

    for (var i = 0; i < rules.length; i++) {
        var item = rules[i];
        item.rule.style.paddingLeft = (glyphWidth * (tabWidth + item.extra)) + 'px';
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