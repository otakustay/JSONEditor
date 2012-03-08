(function() {
    var editorTemplate = 
        '<ul class="string-editor">' + 
            '<li data-method="upper" title="全大写">BAD APPLE</li>' +
            '<li data-method="lower" title="全小写">bad apple</li>' +
            '<li data-method="captalize" title="首字母大写">Bad Apple</li>' +
            '<li data-method="html" title="HTML编码">bad<mark>&amp;nbsp;</mark>apple</li>' +
            '<li class="indicator">拖动鼠标或单击选择</li>' + 
            '<li data-method="uri" title="URL编码">bad<mark>%20</mark>apple</li>' +
            '<li data-method="underscore" title="下划线分隔">bad_apple</li>' +
            '<li data-method="hyphen" title="横线分隔">bad-apple</li>' +
            '<li data-method="comma" title="逗号分隔">bad,apple</li>' +
        '</ul>';
    var methods = {
        upper: function(s) {
            return s.toUpperCase();
        },
        lower: function(s) {
            return s.toLowerCase();
        },
        captalize: function(s) {
            return s.split(' ')
                .map(function(s) { return s.charAt(0).toUpperCase() + s.substring(1); })
                .join(' ');
        },
        html: function(s) {
            var entities = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                ' ': '&nbsp;'
            };
            return s.replace(/[&<> ]/g, function(match) { return entities[match]; });
        },
        uri: function(s) {
            return encodeURI(s);
        },
        underscore: function(s) {
            return s.split(/\s+/).join('_');
        },
        hyphen: function(s) {
            return s.split(/\s+/).join('-');
        },
        comma: function(s) {
            return s.split(/\s+/).join(',');
        }
    };
    // 鼠标滑动方向和元素索引的映射关系
    var directionMapping = [1, 2, 5, 8, 7, 6, 3, 0];
    // 鼠标偏移幅度小于该数值则不选中任何内容
    var tolerance = 20;

    /*
     * 在鼠标按下时创建编辑面板。
     * String-Editor编辑面板是个9宫格，周边8个格子分别表示8种字符串变换。
     * 单击对应的变换后，字符串值会发生变化
     */
    function createEditor(e) {
        var dom = $(e.popup.dom);
        var target = e.domEvent.target;
        var accessor = e.domEvent.accessor;
        dom.html(editorTemplate);

        // 选择后变换字符串
        dom.children(':first').on(
            'click',
            function(e) {
                var transformType = e.target.getAttribute('data-method');
                if (!transformType) {
                    return;
                }

                accessor.value = methods[transformType](accessor.value);
            }
        );
    }

    /*
     * 滚动鼠标滑动。
     * 当鼠标滑动时，将运动分为8个方向，对应8个字符串变换。
     * 鼠标往特定方向滑动时，对应的变换高亮，此时放开鼠标则应用该变换。
     * 移动到鼠标开始运动的位置附近时，表示不采取任何变换。
     * 鼠标滑动过程中，界面上的字符串会暂时变成应用了变换后的值，如果取消变换，变回原值。
     */
    function startSlide(e) {
        // 保存初始值，以便不选择任何转换的时候恢复原值
        var originalValue = e.accessor.value;
        var previousDirection = -1;

        function markTransformer(e) {
            var popup = requestAttachedPopupFor(e.target);
            var accessor = e.accessor;
            if (popup) {
                var container = popup.dom.firstElementChild;
                $(container).children().removeClass('active');

                // direction是从1开始的
                var index = directionMapping[e.direction - 1];
                var transformer = container.children[index];
                if (transformer) {
                    transformer.classList.add('active');
                    var transformType = transformer.getAttribute('data-method');
                    accessor.value = methods[transformType](originalValue);
                }
                // 移到中间是e.direction为0，不高亮任何
                else {
                    accessor.value = originalValue;
                }
            }
        }

        function applyTransformer(e) {
            var popup = requestAttachedPopupFor(e.target);
            var accessor = e.accessor;
            if (popup) {
                var transformer = popup.dom.firstElementChild.querySelector('.active');
                if (transformer) {
                    var transformType = transformer.getAttribute('data-method');
                    accessor.value = methods[transformType](originalValue);
                    transformer.classList.remove('active');
                }
                else {
                    accessor.value = originalValue;
                }
            }

            this.off('directionchange');
            this.off('end');
        }

        this.on('directionchange', markTransformer);
        this.on('end', applyTransformer);
    }

    var agent = getAgentFor('value').ofType('string');

    // 鼠标按下时显示Popup，用createEditor创建面板
    var popup = behavior.popup();
    popup.on('fill', createEditor);
    agent.addBehavior(popup);

    // 鼠标按下交滑动时触发一系列事件，通过方向来判断使用的字符串变换
    var slide = behavior.slide(8, -Math.PI / 8, 20); // 分8块，向逆时针偏移22.5度为起始点，移动偏移20以内不算
    slide.on('start', startSlide);
    agent.addBehavior(slide);
}());