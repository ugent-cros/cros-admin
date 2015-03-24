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
			self.onMessage({data:'{"type": "notifications","value": "lost connection with server. Trying to reconnect..."}'},self);
		
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
		var jsonData = $.parseJSON(event.data);
		if (self.listeners[jsonData.type]) {
			$.each(self.listeners[jsonData.type], function(index, callback) {
				callback(jsonData.value);
			});
		}
	},
	
	register : function(type, callback) {
		var a = this.listeners[type] || [];
		a.push(callback);
		this.listeners[type] = a;
	}

});