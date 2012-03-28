function reportError(result) {
    var error = result.error;
    var text = result.file + ': line ' + error.line;
    if (error.character >= 0) {
        text += ', col ' + error.character;
    }
    text += ', ' + error.reason;
    console.log(text);
}

module.exports = {
    reporter: function(results, data) {
        for (var i = 0; i < data.length; i++) {
            var item = data[i];

            if (!item.unused) {
                continue;
            }
            
            for (var j = 0; j < item.unused.length; j++) {
                var unused = item.unused[j];
                var context = {
                    file: item.file,
                    error: {
                        line: unused.line,
                        character: -1,
                        reason: 'unused variable ' + unused.name
                    }
                };
                if (unused['function'] !== '"anonymous"') {
                    context.error.reason += ' in function ' + unused['function'];
                }
                reportError(context);
            }
        }
    }
}