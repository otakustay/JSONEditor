(function() {
    var root = document.getElementById('root');

    function hasClass(element, matches) {
        for (var i = 1; i < arguments.length; i++) {
            if (element.classList.contains(arguments[i])) {
                return true;
            }
        }
        return false;
    }

    function getValidContainer(element) {
        var container = element;
        while (!hasClass(container, 'key', 'value', 'property')) {
            if (container === root) {
                return null;
            }
            container = container.parentNode;
        }
        return container;
    }

    function getPropertyElement(element) {
        // 先找到最近的.key或.value元素
        var container = getValidContainer(element);

        if (!container) {
            return null;
        }

        return hasClass(container, 'property') ? container : container.parentNode;
    }

    function getPropertyName(propertyElement) {
        var children = propertyElement.children;
        var length = children.length;
        for (var i = 0; i < length; i++) {
            var element = children[i];
            if (hasClass(element, 'key')) {
                return element.textContent.trim();
            }
        }
    }

    function getPropertyTypes(propertyElement) {
        // 从classList中提取
        var nativeTypes = ['number', 'string', 'boolean', 'null', 'undefined'];
        var types = [].filter.call(
            propertyElement.classList,
            function(t) { return t.indexOf('type-') === 0; }
        );

        // TODO: 稳定后移除
        if (!matchedTypes.length) {
            throw new Error('Type Extract Error');
        }

        return types.map(function(t) { return t.substring(5); });
    }

    function getPath(element) {
        var path = [];
        var propertyElement = getPropertyElement(element);
        while (propertyElement) {
            var propertyName = getPropertyName(propertyElement);
            path.unshift(propertyName);
            propertyElement = getPropertyElement(propertyElement.parentNode);
        }
        return path;
    }

    function access(o, path) {
        var current = o;
        for (var i = 0; i < path.length; i++) {
            current = current[path[i]];
        }
        return current;
    }

    /**
     * 获取一个属性访问器。
     * 属性访问器负责读取一个属性的值、修改属性的值、修改属性的键或移动属性的位置等一系列操作的封装，并保持对象与DOM的同步。
     */
    window.getAccessor = function(element) {
        var path = getPath(element); // JSON路径
        var dom = getPropertyElement(element); // 对应的属性的DOM元素
        var key = getPropertyName(dom); // 键名
        var context = access(editingObject.modified, path.slice(0, -1)); // 该属性所在的对象

        return $.spawn({
            path: path,
            dom: dom,
            key: {
                get: function() { return key; },
                set: function(newKey) {
                    context[newKey] = context[key];
                    delete context[key];
                    key = newKey;
                    var keyElement = dom.querySelector('.key');
                    $(keyElement).empty().text(newKey);
                }
            },
            value: {
                get: function() { return context[key]; },
                set: function(newValue) {
                    var oldValue = context[key];
                    context[key] = newValue;

                    var visualizer = new Visualizer(true);
                    visualizer.updateProperty(
                        { key: key, value: oldValue },
                        { key: key, value: newValue },
                        dom
                    );
                }
            }
        });
    }

    /**
     * 获取一个特定类型区块的代理。
     * 代理作为插件的基础对象，提供了对整个JSONEditor特地部分的操作能力。
     *
     * @param {string} [targetSection=*] 代理需要处理的区块类型，可取值key、value、property或*，分别表示代理键、值、属性（除去键和值对应元素以外）和所有区块，默认为*
     * @return {object} 一个代理对象
     */
    window.getAgentFor = function(targetSection) {
        targetSection = targetSection || '*';
        var targetType = '*';
        var behaviors = [];

        return $.spawn({
            /**
             * 指定代理的属性类型。
             *
             * @param {string} value 指定的属性类型，可以为number、string、array等
             * @return {object} 添加了属性类型后的当前代理对象
             */
            ofType: function(value) {
                targetType = value;
                return this;
            },

            /**
             * 添加一个行为。
             *
             * @param {object} 需要添加的行为
             */
            addBehavior: function(behavior) {
                behaviors.push(behavior);
                behavior.attach(this);
            },

            /**
             * 监听一个事件。
             *
             * @param {string} 事件类型
             * @param {selector} 响应事件的元素的选择器
             * @param {handler} 处理事件的函数
             */
            on: function(type, selector, handler) {
                if (arguments.length === 2) {
                    handler = selector;
                    selector = undefined;
                }

                function fn(e) {
                    var container = getValidContainer(e.target);
                    if (!container) {
                        return;
                    }
                    // 判断区域
                    if (targetSection !== '*') {
                        // 直接点在.value或.key上不算，必须点在其内部的span等内联元素上
                        if (e.target === container || !hasClass(container, targetSection)) {
                            return;
                        }
                    }
                    // 判断类型
                    if (targetType !== '*') {
                        var propertyElement = getPropertyElement(container);
                        if (!hasClass(propertyElement, 'type-' + targetType)) {
                            return;
                        }
                    }

                    e.calculatedTarget = container;
                    e.agent = this;
                    e.accessor = getAccessor(e.target);
                    handler.call(this, e);
                }

                $('#root').on(type, selector, fn);
            }
        });
    };
}());