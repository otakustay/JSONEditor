function notify(type, title, message) {
    var dialog = $('#dialog');
    var modal = $('#modal');

    dialog.attr('class', type);
    dialog.children('h3').html(title);
    dialog.children('p').html(message);

    modal.show();
    dialog.show();

    dialog.css('margin-left', -Math.round(dialog.width() / 2)).css('margin-top', -Math.round(dialog.height() / 2));
}

$(window).on(
    'popstate',
    function(e) {
        var pathname = document.location.pathname;
        var text = e.originalEvent.state;

        if (pathname.indexOf('visual') >= 0 && text) {
            visualize(text, false);
        }
        else {
            history.replaceState(text, 'JSON Visualizer', 'home');
            $('#json').val(text);
            $('#page').show();
            $('#root').hide();
        }
    }
);

$('#modal').on(
    'mousedown',
    function(e) {
        e.stopPropagation();

        $('#modal, #dialog').hide();
    }
);

if (!$.browser.webkit) {
    var tip = $('<div />')
        .css('position', 'fixed')
        .css('top', 0)
        .css('width', '100%')
        .css('background-color', '#fbb412')
        .css('font-weight', 'bold')
        .css('text-align', 'center')
        .html('<p>这个布局似乎只有webkit支持较好，所以你懂的^-^</p>')
        .appendTo('body');

    setTimeout(function() { tip.remove(); }, 10 * 1000);
}