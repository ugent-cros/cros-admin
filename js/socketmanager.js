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