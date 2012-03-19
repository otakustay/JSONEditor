$.body = $('body');
$.window = $(window);
$.document = $(document);

$.defineProperty = function(o, name, value) {
    // Property Descriptor
    if (typeof value === 'object' &&
        ('value' in value || 'get' in value || 'set' in value)) {
        Object.defineProperty(o, name, value);
    }
    // Direct Value
    else {
        Object.defineProperty(o, name, { value: value });
    }
};

$.spawn = function(properties) {
    var o = {};
    for (var key in properties) {
        if (properties.hasOwnProperty(key)) {
            var value = properties[key];
            $.defineProperty(o, key, value);
        }
    }
    return o;
};

$.formatTempalte = function(template, data) {
    return template.replace(/\{(\w+)\}/g, function(match, name) { return data[name]; });
};

function isInVisualMode() {
    return location.href.indexOf('/visual') >= 0;
}