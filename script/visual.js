var editingObject = {
    original: {},
    modified: {}
};

(function() {
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
                update: function(value, valueElement) {
                    var span = valueElement.firstElementChild;
                    $(span).empty().text(value);
                },
                extensions: []
            };
        }
        types['string'] = {
            name: 'string',
            render: function(value, container) {
                simple('"' + value + '"', container);
            },
            update: function(value, valueElement) {
                var span = valueElement.firstElementChild;
                $(span).empty().text('"' + value + '"');
            },
            extensions: []
        };
        types['array'] = {
            name: 'array',
            render: function(array, container, visualizer) {
                var start = createElement('span', 'array-start', '[');
                container.appendChild(start);

                var content = createElement('div', 'array-content');
                container.appendChild(content);
                types['array'].update(array, container, visualizer);

                var end = createElement('span', 'array-end', ']');
                container.appendChild(end);
            },
            update: function(array, container, visualizer) {
                var content = container.querySelector('.array-content');
                $(content).empty();

                for (var i = 0; i < array.length; i++) {
                    var item = array[i];
                    var type = getTypeConfig(item);
                    var className = 'type-' + type.name;
                    if (type.baseType) {
                        className += ' type-' + type.baseType;
                    }
                    var wrapper = createElement('div', 'value ' + className, '');
                    type.render(item, wrapper, visualizer);

                    if (visualizer.dispatchEvent) {
                        var e = {
                            type: 'renderproperty',
                            target: wrapper,
                            propertyType: type.baseType ? [type.name, type.baseType] : [type.name],
                            key: i,
                            value: item
                        };
                        visualizer.dispatchVisualizingEvent(e);
                    }

                    content.appendChild(wrapper);
                }
            },
            extensions: []
        };
        types['object'] = {
            name: 'object',
            render: function(o, container, visualizer) {
                var start = createElement('span', 'object-start', '{');
                container.appendChild(start);

                var content = createElement('div', 'object-content', '');
                container.appendChild(content);
                types['object'].update(o, container, visualizer);

                var end = createElement('span', 'object-end', '}');
                container.appendChild(end);
            },
            update: function(o, container, visualizer) {
                var content = container.querySelector('.object-content');
                for (var key in o) {
                    var value = o[key];
                    visualizer.generatePropertySection(key, value, content, visualizer);
                }
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
    window.getTypeConfig = getTypeConfig;

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

    // Visualize事件
    var events = {};
    function addVisualizingEventListener(type, targetPropertyType, handle) {
        var pool = this === window ? events : (this.events || events);
        if (!handle) {
            handle = targetPropertyType;
            targetPropertyType = undefined;
        }

        var handlers = pool[type] || (pool[type] = []);
        handlers.push({ targetPropertyType: targetPropertyType, handle: handle });
    }
    window.addVisualizingEventListener = addVisualizingEventListener;

    function Visualizer(dispatchEvent) {
        this.dispatchEvent = dispatchEvent || false;
        Object.defineProperty(this, 'events', { value: {} });
    }

    Visualizer.prototype.visualizeTo = function(o, element) {
        element = element || document.getElementById('root');

        $(element).empty();

        for (var key in o) {
            this.generatePropertySection(key, o[key], element, this);
        }
    };

    Visualizer.prototype.generatePropertySection = function(key, value, container) {
        var type = getTypeConfig(value);
        var className = 'type-' + type.name;
        if (type.baseType) {
            className += ' type-' + type.baseType;
        }
        var wrapper = createElement('div', 'property ' + className);

        this.fillPropertyElement(key, value, wrapper);

        container.insertBefore(wrapper);
    };

    Visualizer.prototype.fillPropertyElement = function(key, value, propertyElement) {
        var type = getTypeConfig(value);
        var keyElement = createElement('span', 'key', key);
        propertyElement.appendChild(keyElement);

        var valueElement = createElement('div', 'value');
        type.render(value, valueElement, this);
        propertyElement.appendChild(valueElement);

        if (this.dispatchEvent) {
            var e = {
                type: 'renderproperty',
                target: propertyElement,
                propertyType: type.baseType ? [type.name, type.baseType] : [type.name],
                key: key,
                value: value
            };
            this.dispatchVisualizingEvent(e);
        }
    };

    Visualizer.prototype.updateProperty = function(oldProperty, newProperty, propertyElement) {
        var oldType = getTypeConfig(oldProperty.value);
        var newType = getTypeConfig(newProperty.value);


        if (newType === oldType) {
            if (oldProperty.key !== newProperty.key) {
                var keyElement = propertyElement.querySelector('.key');
                keyElement.appendChild(document.createTextNode(newProperty.key));
            }
            var valueElement = propertyElement.querySelector('.value');
            newType.update(newProperty.value, valueElement, this);
        }
        else {
            // 删除原来的类型信息
            for (var i = 0; i < propertyElement.classList.length; i++) {
                var className = propertyElement.classList[i];
                if (className.indexOf('type-') === 0) {
                    propertyElement.classList.remove(className);
                }
            }
            // 添加现有类型信息
            propertyElement.classList.add('type-' + newType.name);
            if (newType.baseType) {
                propertyElement.classList.add('type-' + newType.baseType);
            }
            // 完全替换内容
            $(propertyElement).empty();
            this.fillPropertyElement(newProperty.key, newProperty.value, propertyElement);
        }
    };

    Visualizer.prototype.addVisualizingEventListener = addVisualizingEventListener;

    Visualizer.prototype.dispatchVisualizingEvent = function(e) {
        function processEventHandlers(handlers) {
            if (!handlers) {
                return;
            }
            for (var i = 0; i < handlers.length; i++) {
                var handler = handlers[i];
                if (!handler.targetPropertyType || e.propertyType.indexOf(handler.targetPropertyType) >= 0) {
                    handler.handle.call(e.target, e);
                }
            }
        }

        // 私有事件
        if (this.events && this.events !== events) {
            processEventHandlers(this.events[e.type]);
        }
        // 全局事件
        processEventHandlers(events[e.type]);
    };

    window.Visualizer = Visualizer;

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

        var visualizer = new Visualizer(true);
        visualizer.visualizeTo(o);
        $('#page').hide();
        $('#root').show();

        if (addHistoryEntry) {
            history.replaceState(text, 'JSON Visualizer', 'home');
            history.pushState(text, 'JSON Visualizer', 'visual');
        }

        editingObject.original = editingObject.modified = o;
    }
    window.visualize = visualize;
}());