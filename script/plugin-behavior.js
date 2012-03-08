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

// Slide
(function() {
    var tolerance = 10;

    function computeAngle(x, y) {
        // 第一区间
        if (x >= 0 && y >= 0) {
            return Math.atan(x / y);
        }
        // 第二区间
        else if (x >=0 && y <= 0) {
            return Math.PI / 2 + Math.atan(-y / x);
        }
        // 第三区间
        else if (x <= 0 && y <= 0) {
            return Math.PI + Math.atan(-x / -y);
        }
        // 第四区间
        else {
            return Math.PI + Math.PI / 2 + Math.atan(y / -x);
        }
    }

    behavior.slide = function(directionCount, directionStartAngle, directionTolerance) {
        directionCount = directionCount || 0;
        directionStartAngle = directionStartAngle || 0;
        directionTolerance = directionTolerance || 0;

        function createEvent(type, domEvent, validTarget, originX, originY, agent, accessor) {
            var currentX = domEvent.pageX;
            var currentY = domEvent.pageY;
            var offsetX = currentX - originX;
            var offsetY = currentY - originY;
            var angle = computeAngle(offsetX, -offsetY);

            var e = {
                type: type,
                domEvent: domEvent,
                target: validTarget,
                originX: originX,
                originY: originY,
                currentX: currentX,
                currentY: currentY,
                offsetX: offsetX,
                offsetY: offsetY,
                angle: angle,
                agent: agent,
                accessor: accessor
            };
            if (directionCount > 0) {
                if (Math.abs(offsetX) <= directionTolerance && Math.abs(offsetY) <= directionTolerance) {
                    e.direction = 0;
                }
                else {
                    var perDirectionAngle = Math.PI * 2 / directionCount;
                    e.direction = Math.ceil((angle - directionStartAngle) / perDirectionAngle) % (directionCount + 1);
                }
            }

            return e;
        }

        function startSlide(e) {
            var slider = this;
            var validTarget = e.target;
            var originX = e.pageX;
            var originY = e.pageY;
            var previousDirection = -1;
            var agent = e.agent;
            var accessor = e.accessor;
            var started = false;

            function move(e) {
                // 已经开始了滑动行为，触发move和directionchange事件
                if (started) {
                    var moveEvent = createEvent('move', e, validTarget, originX, originY, agent, accessor);
                    slider.trigger(moveEvent);

                    // TODO: 追查为何direction会是负数
                    if (moveEvent.direction >= 0 && moveEvent.direction !== previousDirection) {
                        previousDirection = moveEvent.direction;
                        var directionChangeEvent = createEvent('directionchange', e, validTarget, originX, originY, agent, accessor);
                        slider.trigger(directionChangeEvent);
                    }
                }
                // 前次移动鼠标偏差还在可允许范围内，计算鼠标偏差来确定是否开始
                else {
                    var startEvent = createEvent('start', e, validTarget, originX, originY, agent, accessor);
                    if (Math.abs(startEvent.offsetX) <= tolerance && Math.abs(startEvent.offsetY) <= tolerance) {
                        return;
                    }

                    slider.trigger(startEvent);

                    // 放弃本次滑动行为
                    if (startEvent.cancel) {
                        $.document.off('mousemove', move).off('mouseup', release);
                    }
                    else {
                        started = true;
                    }
                }
            }

            function release(e) {
                var endEvent = createEvent('end', e, validTarget, originX, originY, agent, accessor);
                slider.trigger(endEvent);

                $.document.off('mousemove', move).off('mouseup', release);
            }

            $.document.on('mousemove', move).on('mouseup', release);
        }

        var instance = behavior.createNew('slide');
        instance.enable = function() {
            this.agent.on('mousedown', startSlide.bind(this));
        }

        return instance;
    }
}());