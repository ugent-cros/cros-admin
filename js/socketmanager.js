App.SocketManager = Ember.Object.extend({

	listeners : {},

	init : function() {
		this._super();
		
		var url = this.get('url');
		var adaptedUrl = url.replace(/https?/, "ws");
		
		var self = this;
		var socket = new WebSocket(adaptedUrl);
		socket.onmessage = function(event) {
			self.onMessage(event,self);
		}
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