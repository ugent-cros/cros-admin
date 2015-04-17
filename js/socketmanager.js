window.SocketManager = Ember.Object.extend({

	listeners : {},
	socket : null,
    connection : false,
    reconnect : false,
    timer : null,

    initConnection : function() {
        this.set("reconnect", true);
        this.connect();
    },
	
	connect : function() {
        if (this.get('connection') || !this.get("reconnect"))
            return;

        var self = this;

        var url = this.adapter.linkLibrary["datasocket"];
        url = url.replace(/https?/, "ws");

        var s = new WebSocket(url + "?authToken=" + this.authManager.token());
        this.set('socket', s);
        this.set('connection', true);

        if (s.readyState == 3 || s.readyState == 4) {
            this.onClose(); // Close socket immediately if connection failed
            return;
        } else {
            self.onMessage({data:'{"type": "notification","value": {"action" : "clear"}}'},self);
        }

        s.onClose = this.onClose;
        s.onmessage = function(event) {self.onMessage(event,self);};

        this.set('timer', setInterval(function() {
            var s = self.get('socket');
            if (s.readyState == 3 || s.readyState == 4) {
                s.onClose();
            }
        }, 1000));
    }.observes("connection"),

    onClose : function() {
        this.onMessage({data:'{"type": "notification","value": {"message" : "lost connection with server. Trying to reconnect..."}}'},this);

        var timer = this.get('time');
        if (timer) {
            clearInterval(timer);
        }
        this.set('connection', false);
    },

    disconnect : function() {
        clearInterval(this.get('timer'));
        this.get("socket").close();
        this.set("reconnect", false);
        this.set("connection", false);
    },
	
	onMessage : function(event, self) {
		var jsonData = $.parseJSON(event.data);
		if (self.listeners[jsonData.type]) {
			var listeners = self.listeners[jsonData.type];
			$.each(listeners, function(index, listener) {
				if(jsonData.id && (listener.id == 0 || jsonData.id == listener.id)) {
					listener.callback(jsonData.value, jsonData.id);
				}
			});
		}
	},
	
	register : function(type, id, controllerName, callback) {		
		if (!id) {
			id = 0;
		}
		
		var controllerCallbacks = this.listeners[type];
		if(!controllerCallbacks) {
			controllerCallbacks = {};
		}
		controllerCallbacks[controllerName] = {callback: callback, id: id};
		this.listeners[type] = controllerCallbacks;
	}

});