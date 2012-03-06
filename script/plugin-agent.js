(function() {
    var root = document.getElementById('root');

    function getValidContainer(element) {
        var container = element;
        while (!container.classList.contains('key') && !container.classList.contains('value')) {
            if (container === root) {
                return null;
            }
            container = container.parentNode;
        }
        return container;
    }

    function getPropertyElement(element) {
        /*
         * 有以下情况：
         *   1. 当前元素是对象中的某属性的键，离它最近的一个{.value|.key}元素的class为key
         *      1.1 向上一级找到{.property}元素，为属性的容器元素
         *   2. 当前元素是对象中的某属性的值，离它最近的一个{.value|.key}元素的class为value
         *      该分支包含了{.object-content}、{.object-start}、{.object-end}、{.array-content}、{.array-start}、{.array-end}等辅助元素
         *      2.1 找到最近的{.value}元素，为值的容器元素
         *      2.2 向上一级找到{.property}元素，为属性的容器元素
         *   3. 当前元素是数组中的一项，离它最近的一个{.value}的父元素有{.array-content}
         *   4. 当前元素本身就是一个属性元素，自身有{.property}
         */
        // 先找到最近的.key或.value元素
        var container = getValidContainer(element);

        if (!container) {
            return null;
        }

        // 如果有.key，则当前元素是键，按分支1查找
        if (container.classList.contains('key')) {
            return container.parentNode;
        }
        // 如果有.value，继续判断是对象属性，还是数组的项
        else if (container.classList.contains('value')) {
            var parent = container.parentNode;
            // 是对象的属性，按分支2查找
            if (parent.classList.contains('property')) {
                return parent;
            }
            // 是数组中的项，按分支3查找
            else if (parent.classList.contains('array-content')) {
                return container;
            }
        }
        // 如果有.property，则当前元素是属性本身，按分支4
        else if (container.classList.contains('property')) {
            return container;
        }

        // TODO: 验证函数稳定后移除
        throw new Error('Constructure Error');
    }

    function getPropertyName(propertyElement) {
        /*
         * 有以下情况：
         *   1. 自己有{.property}，则是对象的属性，查找子元素中的{.key}获得属性名称
         *   2. 自己有{.value}，则是数组中的项，根据自己在父元素中的位置获得索引
         */
        if (propertyElement.classList.contains('property')) {
            var children = propertyElement.children;
            var length = children.length;
            for (var i = 0; i < length; i++) {
                var element = children[i];
                if (element.classList.contains('key')) {
                    return element.textContent.trim();
                }
            }
        }
        else if (propertyElement.classList.contains('value')) {
            var i = 0;
            var cursor = propertyElement.previousSibling;
            while (cursor) {
                i++;
                cursor = cursor.previousSibling;
            }
            return i;
        }

        // TODO: 验证函数稳定后移除
        throw new Error('Constructure Error');
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

    /**
     * 获取一个特定类型区块的代理。
     * 代理作为插件的基础对象，提供了对整个JSONEditor特地部分的操作能力。
     *
     * @param {string} [targetSection=*] 代理需要处理的区块类型，可取值key、value或*，分别表示代理键、值和所有区块，默认为*
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
                    // 判断区域
                    if (targetSection !== '*') {
                        if (!container.classList.contains(targetSection)) {
                            return;
                        }
                    }
                    // 判断类型
                    if (targetType !== '*') {
                        var propertyElement = getPropertyElement(container);
                        if (!propertyElement.classList.contains('type-' + targetType)) {
                            return;
                        }
                    }

                    handler.call(this, e);
                }

                $('#root').on(type, selector, fn);
            }
        });
    };
}());