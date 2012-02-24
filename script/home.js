function notify(type, title, message) {
    var dialog = document.querySelector('#dialog');
    var modal = document.querySelector('#modal');
    var header = dialog.querySelector('h3');
    var content = dialog.querySelector('p');

    dialog.className = type;
    header.innerHTML = title;
    content.innerHTML = message;

    modal.style.display = 'block';
    dialog.style.display = 'block';

    var width = dialog.offsetWidth;
    var height = dialog.offsetHeight;
    dialog.style.marginLeft = -Math.round(width / 2) + 'px';
    dialog.style.marginTop = -Math.round(height / 2) + 'px';
}

window.addEventListener(
    'popstate',
    function(e) {
        var pathname = document.location.pathname;
        var text = e.state;

        if (pathname.indexOf('visual') >= 0 && text) {
            visualize(text, false);
        }
        else {
            history.replaceState(text, 'JSON Visualizer', 'home');
            document.querySelector('#json').value = text;
            document.querySelector('#page').style.display = '';
            document.querySelector('#root').style.display = 'none';
        }
    },
    false
);

document.querySelector('#modal').addEventListener(
    'mousedown',
    function(e) {
        e.stopPropagation();

        document.querySelector('#modal').style.display = 'none';
        document.querySelector('#dialog').style.display = 'none';
    },
    false
);

if (!/webkit/i.test(navigator.userAgent)) {
    var tip = document.createElement('div');
    tip.innerHTML = '<p>这个布局似乎只有webkit支持较好，所以你懂的^-^</p>';
    tip.style.position = 'fixed';
    tip.style.top = 0;
    tip.style.width = '100%';
    tip.style.backgroundColor = '#fbb412';
    tip.style.fontWeight = 'bold';
    tip.style.textAlign = 'center';
    document.body.appendChild(tip);

    setTimeout(function() { document.body.removeChild(tip); }, 10 * 1000);
}