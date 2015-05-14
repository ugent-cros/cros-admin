/**
 * @module cros-admin
 */

/**
 * This class will manage the connection with a socketmanager and the incomming data.
 * For now this socketManager does not support sending data over the websocket to the server. Data can only be received.
 * The socketmanager will connect to the websocket, it will try to reconnect to the socket automatically.
 * It will also inform listeners of new messages arriving.
 *
 * @class SocketManager
 * @constructor
 * @extends Ember.Object
 */
window.SocketManager = Ember.Object.extend({

    /**
     * This object will keep track of all registered listeners. When a message arrives, the correct listeners will be notified.
     *
     * @private
     * @property listeners {Object}
     */
	listeners : {},
    /**
     * This object is the websocket that is currently in use.
     *
     * @private
     * @property socket {Object}
     */
	socket : null,
    /**
     * This boolean will be true is the connection with the server is open. If not, it is false.
     *
     * @public
     * @readOnly
     * @property connection {boolean}
     */
    connection : false,
    /**
     * This boolean will represents whether the socketManager will try to reconnect when connection is lost.
     *
     * @public
     * @property reconnect {boolean}
     */
    reconnect : false,
    /**
     * If this property is set, the socketmanager will try to connect to a websocket on this url.
     * If this property is not set, it will fetch the url from the adapter using the key "datasocket".
     *
     * @public
     * @property defaultUrl {String}
     */
    defaultUrl : null,

    /**
     * This method will initiate the connection with the server.
     *
     * @public
     * @method initConnection
     */
    initConnection : function() {
        this.set("reconnect", true);
        this.connect();
    },

    /**
     * This method will setup the connection with the socket. Note that it will first check if any connection is already setup.
     * If no connection is setup (and {{#crossLink "SocketManager/reconnect:property"}}{{/crossLink}} is set to true), the connection will be setup.
     *
     * First of all, the url is fetched, either from {{#crossLink "SocketManager/defaultUrl:property"}}{{/crossLink}} or from the available adapter.
     * This function will also change the protocol of the url from http(s) to ws, if necessary.
     *
     * Connection will be setup with the websocket using the authentication token from {{#crossLink "AuthManager"}}{{/crossLink}}. If connection is set up,
     * the mechanisms to notify listeners are set.
     *
     * @private
     * @method connect
     */
	connect : function() {
        if (this.get('connection') || !this.get("reconnect"))
            return;

        var self = this;

        var urlPromise;
        var url = this.get("defaultUrl");
        if (url)
            urlPromise = $.Deferred(function(defer) { defer.resolveWith(this,[ {url: url} ]); });
        else
            urlPromise = this.adapter.resolveLink("datasocket");

        urlPromise.then(function(urlObj) {
            var url = urlObj.url.replace(/https?/, "ws");

            self.set('connection', true);
            var s = new WebSocket(url + "?authToken=" + self.authManager.token());
            self.set("socket", s);

            /*if (s.readyState == 2 || s.readyState == 3) {
             this.onClose(self); // Close socket immediately if connection failed
             return;
             }*/

            s.onclose = function() { self.onClose(self) };
            s.onopen = function() { self.onOpen(self); };
            s.onmessage = function(event) {self.onMessage(event,self);};
        });
    }.observes("connection"),

    /**
     * This method will handle the loss of connection.
     * It will send a notification message to listeners with the information that the connection has been lost.
     *
     * Also, after a delay of 1 second, it set the {{#crossLink "SocketManager/connection:property"}}{{/crossLink}} property to false. This will automatically  initiate the
     * {{#crossLink "SocketManager/connect:method"}}{{/crossLink}} method. (Note that this will not reconnect the socket if {{#crossLink "SocketManager/reconnect:property"}}{{/crossLink}} has not been set).
     *
     * @private
     * @method onClose
     * @param self the SocketManager itself
     */
    onClose : function(self) {
        self.onMessage({data:'{"type": "notification","value": {"message" : "lost connection with server. Trying to reconnect..."}}'},this);

        setTimeout(function() {
            self.set('connection', false);
        }, 1000);
    },

    /**
     * This method will do the correct action if the websocket has been opened.
     * In this implementation it will only send a notification to the correct listeners.
     *
     * @private
     * @method onOpen
     * @param self the SocketManager itself
     */
    onOpen : function(self) {
        self.onMessage({data:'{"type": "notification","value": {"action" : "clear"}}'},self);
    },

    /**
     * This function will close the socket connection. It will automatically set {{#crossLink "SocketManager/reconnect:property"}}{{/crossLink}} to false.
     *
     * @public
     * @method disconnect
     */
    disconnect : function() {
        this.get("socket").close();
        this.set("reconnect", false);
        this.set("connection", false);
    },

    /**
     * This method will handle an incoming message from the server.
     * This mainly involves notifying the correct listeners.
     *
     * @private
     * @method onMessage
     * @param event
     * @param self
     */
	onMessage : function(event, self) {
        //console.log(event.data);
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

    /**
     * If an object wants to receive a particular message from the websocket, it can register itself here.
     * Therefore several parameters should be set. First of which is off course the type of message. Each message has a type which is a string.
     * Next, an id can be set. If one is only interested in the messages of one specific entity this can be set via the id. However if this is not set (or set to 0), messages of all entities will be received.
     * Note also, that all messages contain the id of the entity (even if the listener is registered with id 0).
     * The following parameter "controllerName" is an identification of the listener. This can be any unique string. It is used to avoid having duplicate listeners.
     *
     * Lastly an callback method should be set. Whenever a message arrives, this specific method will be called.
     *
     * @public
     * @method register
     * @param type The type of message that you want to receive
     * @param id the id of the entity that you are interessted in
     * @param controllerName the controllerName of the caller
     * @param callback the method to execute when a message arrived
     */
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

    /**
     * If you are registered for a message and no longer want to receive any messages for it, you can unregister with this method.
     * If you are regstered with id 0, it is not possible to unregister for any specific id.
     * If you are not registered and call this function, nothing will happen.
     *
     * @public
     * @method unregister
     * @param type The type of message that you no longer want to receive.
     * @param id The id of the entity you no longer need
     * @param controllerName The controllerName of the caller
     */
    unregister : function(type, id, controllerName) {
        var controllerCallbacks = this.listeners[type];
        delete controllerCallbacks[controllerName];
        this.listeners[type] = controllerCallbacks;
    }

});