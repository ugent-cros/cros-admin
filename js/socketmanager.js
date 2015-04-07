App.SocketManager = Ember.Object.extend({

	listeners : {},
	socket : null,
    connection : false,
    reconnect : false,
    timer : null,


	init : function() {
		this._super();
	},

    initConnection : function() {
        this.set("reconnect", true);
        this.connect();
    },
	
	connect : function() {
        if (this.get('connection') || !this.get("reconnect"))
            return;

        var self = this;

        var url = this.get('url');
        url = url.replace(/https?/, "ws");

        var s = new WebSocket(url + "?authToken=" + App.AuthManager.token());
        this.set('socket', s);
        this.set('connection', true);

        s.onClose = function() {
            self.onMessage({data:'{"type": "notification","value": {"message" : "lost connection with server. Trying to reconnect..."}}'},self);

            var timer = this.get('time');
            if (timer) {
                clearInterval(timer);
            }
            self.set('connection', false);
        };

        if (s.readyState == 3 || s.readyState == 4) {
            s.onClose(); // Close socket immediately if connection failed
            return;
        } else {
            self.onMessage({data:'{"type": "notification","value": {"action" : "clear"}}'},self);
        }

        s.onmessage = function(event) {
            self.onMessage(event,self);
        };

        this.set('timer', setInterval(function() {
            var s = self.get('socket');
            if (s.readyState == 3 || s.readyState == 4) {
                s.onClose();
            }
        }, 500));
    }.observes("connection"),

    disconnect : function() {
        clearInterval(this.get('timer'));
        this.get("socket").close();
        this.set("reconnect", false);
        this.set("connection", false);
    },
	
	onMessage : function(event, self) {
		var jsonData = $.parseJSON(event.data);
		if (self.listeners[jsonData.type]) {
			var callbacks = self.listeners[jsonData.type][0] || [];
			if (jsonData.id && self.listeners[jsonData.type][jsonData.id]) {
				callbacks.pushObjects(self.listeners[jsonData.type][jsonData.id]);
			}
			
			$.each(callbacks, function(index, callback) {
				callback(jsonData.value);
			});
		}
	},
	
	register : function(type, id, callback) {
		if (!id) {
			id = 0;
		}
		
		var typeCallbacks = this.listeners[type];
		if (typeCallbacks) {
			var idCallbacks = typeCallbacks[id] || [];
			idCallbacks.push(callback);
			typeCallbacks[id] = idCallbacks;
		} else {
			typeCallbacks = [];
			typeCallbacks[id] = [callback];
		}
		this.listeners[type] = typeCallbacks;
	}

});