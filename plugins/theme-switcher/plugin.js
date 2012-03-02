(function() {
    var previewObject = {
        id: 10086,
        name: 'Bad apple!!',
        album: {
            name: '幺樂団の歴史1',
            artist: '上海アリス幻樂団',
            publishDate: null
        },
        rating: undefined,
        canDownload: true,
        isFree: false,
        price: 12.8,
        formats: ['mp3', 'wav'],
    };

    var themes = [
        { name: 'default', text: '默认' },
        { name: 'light', text: '白色' },
        { name: 'twilight', text: '黄昏' },
        { name: 'violet', text: '紫罗兰' },
        { name: 'fireworks', text: '花火' },
        { name: 'lazy', text: '慵懒' },
        { name: 'space', text: '宇宙' }
    ];
    var currentTheme = localStorage.getItem('currentTheme') || 'default';
    var wrapper = $('<div />').addClass('theme-switcher');

    // 初始化主题预览面板
    for (var i = 0; i < themes.length; i++) {
        if (i % 3 === 0) {
            $('<div />').appendTo(wrapper);
        }
        var theme = themes[i];

        var container = $('<div />').addClass('theme-preview').attr('data-name', theme.name);
        var content = $('<div />').addClass('visual-root').attr('data-theme', theme.name).appendTo(container);
        var label = $('<span />').text(theme.text).appendTo(container);
        visualizeTo(previewObject, content[0]);

        container.appendTo(wrapper.children(':last'));

        $('<link />').attr('rel', 'stylesheet').attr('href', 'plugins/theme-switcher/' + theme.name + '.css').appendTo('head');
    }

    wrapper.on(
        'click',
        function(e) {
            var target = $(e.target).closest('.theme-preview');
            if (!target.length) {
                return false;
            }

            var name = target.attr('data-name');
            if (name !== currentTheme) {
                enableTheme(name);
            }
        }
    );
    // 取消收缩/展开对象及数组功能
    wrapper.on('mousedown', function() { return false; });


    function enableTheme(name) {
        var theme = themes.filter(function(t) { return t.name === name; })[0];
        if (!theme) {
            return;
        }

        var previews = wrapper.find('.theme-preview');
        previews.removeClass('active');
        previews.filter('[data-name="' + theme.name + '"]').addClass('active');

        $('#root').attr('data-theme', theme.name);

        currentTheme = theme.name;
        localStorage.setItem('currentTheme', currentTheme);
    }

    // 设置默认主题
    enableTheme(currentTheme);

    plugin.addToolbarItem({
        name: 'switch-theme',
        text: '更换皮肤',
        click: function() {
            var frame = plugin.requestModalFrame();
            frame.hideAction = 'detach'; // 内容可复用
            wrapper.appendTo(frame.dom);
            frame.show();
        }
    });
}());