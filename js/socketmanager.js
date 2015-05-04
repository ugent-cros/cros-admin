window.SocketManager = Ember.Object.extend({

	listeners : {},
	socket : null,
    connection : false,
    reconnect : false,
    timer : null,
    defaultUrl : null,

    initConnection : function() {
        this.set("reconnect", true);
        this.connect();
    },
	
	connect : function() {
        if (this.get('connection') || !this.get("reconnect"))
            return;

        var self = this;

        var url = this.get("defaultUrl") || this.adapter.linkLibrary["datasocket"];
        url = url.replace(/https?/, "ws");

        this.set('connection', true);
        var s = new WebSocket(url + "?authToken=" + this.authManager.token());
        self.set("socket", s);

        /*if (s.readyState == 2 || s.readyState == 3) {
            this.onClose(self); // Close socket immediately if connection failed
            return;
        }*/

        s.onclose = function() { self.onClose(self) };
        s.onopen = function() { self.onOpen(self); };
        s.onmessage = function(event) {self.onMessage(event,self);};
    }.observes("connection"),

    onClose : function(self) {
        self.onMessage({data:'{"type": "notification","value": {"message" : "lost connection with server. Trying to reconnect..."}}'},this);

        setTimeout(function() {
            self.set('connection', false);
        }, 1000);
    },

    onOpen : function(self) {
        self.onMessage({data:'{"type": "notification","value": {"action" : "clear"}}'},self);

        /*self.set('timer', setInterval(function() {
            var s = self.get('socket');
            if (s.readyState == 2 || s.readyState == 3) {
                s.onclose();
            }
        }, 1000));*/
    },

    disconnect : function() {
        clearInterval(this.get('timer'));
        this.get("socket").close();
        this.set("reconnect", false);
        this.set("connection", false);
    },
	
	onMessage : function(event, self) {
        console.log(event.data);
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
	},

    unregister : function(type, id, controllerName) {
        var controllerCallbacks = this.listeners[type];
        delete controllerCallbacks[controllerName];
        this.listeners[type] = controllerCallbacks;
    }

});