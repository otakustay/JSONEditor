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

    function markTransformer(e) {

        var popup = requestAttachedPopupFor(e.target);
        if (popup) {
            // 小范围内移动视为不选择任何转换功能
            if (Math.abs(e.offsetX) <= tolerance && Math.abs(e.offsetY) <= tolerance) {
                $(popup.dom.firstElementChild).children().removeClass('active');
                return;
            }

            // direction是从1开始的
            var index = directionMapping[e.direction - 1];
            var transformer = popup.dom.firstElementChild.children[index];
            transformer.classList.add('active');
            $(transformer).siblings().removeClass('active');
        }
    }

    function applyTransformer(e) {
        var popup = requestAttachedPopupFor(e.target);
        if (popup) {
            var transformer = popup.dom.firstElementChild.querySelector('.active');
            if (transformer) {
                var transformType = transformer.getAttribute('data-method');
                var accessor = e.accessor;
                accessor.value = methods[transformType](accessor.value);
                transformer.classList.remove('active');
            }
        }
    }

    var agent = getAgentFor('value').ofType('string');
    var popup = behavior.popup();
    popup.on('fill', createEditor);
    agent.addBehavior(popup);
    var slide = behavior.slide(8, -Math.PI / 8); // 分8块，向逆时针偏移22.5度为起始点
    slide.on('directionchange', markTransformer);
    slide.on('end', applyTransformer)
    agent.addBehavior(slide);
}());