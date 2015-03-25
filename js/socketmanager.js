App.SocketManager = Ember.Object.extend({

	listeners : {},
	socket : null,

	init : function() {
		this._super();
		
		var url = this.get('url');
		this.connect(url.replace(/https?/, "ws"));
	},
	
	connect : function(url) {
		var self = this;
	
		var s = this.get('socket');
		var attempts = 10;
		while((!s || s.readyState == 2 || s.readyState == 3) && attempts > 0) {
			try {
				this.set('socket', new WebSocket(url));
			} catch(err) {
				console.log("connection with socket failed...  " + err);
			}
			s = this.get('socket');
			setTimeout(null,500);
			attempts--;
		}
		
		s.onmessage = function(event) {
			self.onMessage(event,self);
		}
		
		var timer;
		
		s.onClose = function() {
			self.onMessage({data:'{"type": "notification","value": {"message" : "lost connection with server. Trying to reconnect..."}}'},self);
		
			clearInterval(timer);
			var url = self.get('url');
			self.connect(url.replace(/https?/, "ws"));
		}
		
		timer = setInterval(function() {
			var s = self.get('socket');
			if (s.readyState == 3 || s.readyState == 4) {
				s.onClose();
			}
		}, 500);
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