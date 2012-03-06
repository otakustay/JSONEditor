(function() {
    function visualizeTo(o, element) {
        element = element || document.getElementById('root');

        $(element).empty();

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
        var type = getTypeConfig(value);
        var className = 'type-' + type.name;
        if (type.baseType) {
            className += ' type-' + type.baseType;
        }
        var wrapper = createElement('div', 'property ' + className);

        var keyElement = createElement('span', 'key', key);
        wrapper.appendChild(keyElement);

        var valueElement = createElement('div', 'value');
        type.render(value, valueElement);
        wrapper.appendChild(valueElement);

        container.appendChild(wrapper);
    }


    // 不同类型键/值的渲染
    var types = {};
    (function() {
        function simple(value, container) {
            var span = createElement('span', '', value + '')
            container.appendChild(span);
        };

        var simpleTypes = ['null', 'undefined', 'boolean', 'number'];
        for (var i = 0; i < simpleTypes.length; i++) {
            var type = simpleTypes[i];
            types[type] = {
                name: type,
                render: simple,
                extensions: []
            };
        }
        types['string'] = {
            name: 'string',
            render: function(value, container) {
                simple('"' + value + '"', container);
            },
            extensions: []
        };
        types['array'] = {
            name: 'array',
            render: function(array, container) {
                var start = createElement('span', 'array-start', '[');
                container.appendChild(start);

                var content = createElement('div', 'array-content');
                for (var i = 0; i < array.length; i++) {
                    var item = array[i];
                    var type = getTypeConfig(item);
                    var className = 'valuetype-' + type.name;
                    if (type.baseType) {
                        className += ' type-' + type.baseType;
                    }
                    var wrapper = createElement('div', 'value ' + className, '');
                    type.render(item, wrapper);
                    content.appendChild(wrapper);
                }
                container.appendChild(content);

                var end = createElement('span', 'array-end', ']');
                container.appendChild(end);
            },
            extensions: []
        };
        types['object'] = {
            name: 'object',
            render: function(o, container) {
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
            },
            extensions: []
        };
    }());

    function getTypeConfig(o) {
        var baseType = {}.toString.call(o).slice(8, -1).toLowerCase();
        var baseTypeConfig = types[baseType];
        for (var i = 0; i < baseTypeConfig.extensions.length; i++) {
            var extension = baseTypeConfig.extensions[i];
            var isMatch = typeof extension.matches === 'function' ? extension.matches(o) : extension.matches.test(o);
            if (isMatch) {
                baseTypeConfig = extension;
                break;
            }
        }

        return baseTypeConfig;
    }

    function registerTypeExtension(typeName, baseType, matches, render) {
        var config = {
            name: typeName,
            baseType: baseType,
            matches: matches || function() { return false; },
            render: render || types[baseType].render
        };
        types[baseType].extensions.push(config);
    }
    window.registerTypeExtension = registerTypeExtension;
}());

$(document).on(
    'mousedown',
    '.object>.key, .array>.key',
    function(e) {
        var target = $(e.target);
        target.parent().toggleClass('collapsed');
    }
);