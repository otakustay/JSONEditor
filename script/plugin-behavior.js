(function() {
    var behavior = window.behavior = {};

    behavior.createNew = function(name) {
        var events = {};

        return $.spawn({
            name: name,
            attach: {
                value: function(agent) {  
                    if (this.agent) {
                        return;
                    }
                    Object.defineProperty(this, 'agent', { value: agent });
                    this.enable();
                }, 
                writable: true 
            },
            enable: { value: function() {}, writable: true },
            on: function(type, handle) {
                var pool = events[type] || (events[type] = []);
                if (pool.indexOf(handle) < 0) {
                    pool.push(handle);
                }
            },
            off: function(type, handle) {
                if (arguments.length === 0) {
                    events = {};
                    return;
                }

                if (!handle) {
                    delete events[type];
                }

                var pool = events[type];
                if (pool) {
                    var index = pool.indexOf(handle);
                    if (index >= 0) {
                        pool.splice(index, 1);
                    }
                }
            },
            trigger: function(e) {
                var pool = events[e.type];
                if (pool) {
                    for (var i = 0; i < pool.length; i++) {
                        pool[i].call(this, e);
                    }
                }
            }
        });
    };
}());

// Popup
(function() {
    function showPopup(e) {
        var target = e.target;
        var popup = requestPopup();

        if (!popup) {
            return;
        }

        this.trigger({ type: 'fill', popup: popup, domEvent: e });

        popup.attachTo(target);
        return false;
    }

    behavior.popup = function(eventType) {
        var instance = behavior.createNew('popup');
        instance.enable = function() {
            this.agent.on(eventType || 'mousedown', showPopup.bind(this));
        };

        return instance;
    };
}());