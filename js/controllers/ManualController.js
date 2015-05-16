/**
 * @module cros-admin
 * @submodule controllers
 */

App.ManualController = Ember.ObjectController.extend({

    battery : "N/A",
    altitude : -1,
    location : [0,0],
    speedvalue : 1,
    flying : false,
    currentFrame : "",
    videoPrefix : "data:image/jpeg;base64, ",

    _originalDroneStatus : null,
    originalDroneStatus : function(key, value, previousValue) {
        if (arguments.length > 1) {
            this.set("_originalDroneStatus", value);
            if (value)
                $.cookie("originalDroneStatus", value);
            else
                $.removeCookie("originalDroneStatus");
        }

        if (!this.get("_originalDroneStatus"))
            this.set("_originalDroneStatus", $.cookie("originalDroneStatus"));
        return this.get("_originalDroneStatus");
    }.property("_originalDroneStatus"),

    initialization : function() {
        var self = this;

        // fetch initial data
        this.adapter.find("drone", this.get("model.id"), "battery").then(function(data) {
            self.set("battery", data.battery);
        });
        this.adapter.find("drone", this.get("model.id"), "location").then(function(data) {
            self.set("location", Ember.Object.create({lat : data.location.latitude, lon: data.location.longitude}));
        });

        if (!this.get("originalDroneStatus"))
            this.set("originalDroneStatus", this.get("model.status"));

        this.adapter.find("drone", this.get("model.id"), ["commands", "manual"]).fail(function(data) {
            if (data.responseJSON.reason)
                self.set("controlError", data.responseJSON.reason);
            else
                self.set("controlError", data.responseJSON);
        });

        this.socketManager.register("batteryPercentageChanged", this.get("model.id"), "drone", function(data) {
            self.set('battery', data.percent);
            $('.batteryStatus').css('width', data.percent + '%');
            if(data.percent < 25)
                $('.batteryStatus').css('background-color', '#F00');
            else
                $('.batteryStatus').css('background-color', '#0A0');
        });

        this.socketManager.register("locationChanged", this.get("model.id"), "drone", function(data) {
            self.set('location',Ember.Object.create({lat : data.latitude, lon : data.longitude}));
            // todo: do something with gpsheight...?
        });

        this.socketManager.register("droneStatusChanged", this.get("model.id"), "drone", function(data) {
            self.set('model.status',data.newStatus);
        });
    }.observes("model"),

    beforeClose : function() {
        if (this.get("flying")) {
            this.set("controlError", "You need to land the drone before closing.");
            return false;
        }

        if (this.get("model.status") !== this.get("model.originalDroneStatus")) {
            this.adapter.find("drone", this.get("model.id"), ["commands", "status"], {query : { status: this.get("originalDroneStatus")}}).fail(function(data) {
                // TODO: if this happens, it will fail, because the transition will allready be done.
                if (data.responseJSON.reason)
                    self.set("controlError", data.responseJSON.reason);
                else
                    self.set("controlError", data.responseJSON);
            });
        }

        if (this.get("controller.streamingVideo"))
            this.get("controller").closeStream();

        this.set("originalDroneStatus", undefined);
        return true;
    },

    speedString : function() {
        return parseFloat(this.get("speedvalue")).toFixed(2);
    }.property("speedvalue"),

    controlError : "",
    hasControlError : function() {
        return this.get("controlError") !== "";
    }.property("controlError"),

    streamingVideo : function() {
        if (this.get("videoSocket")) {
            return this.get("videoSocket.connection");
        } else {
            return false;
        }
    }.property("videoSocket.connection"),

    videoProperty : function() {
        $("#videoStream").attr('src', this.get("videoPrefix").concat(this.get("currentFrame")));
    }.observes("currentFrame"),

    /**
     * This function will close the active videowebsocket.
     * If no video websocket is active, this will do nothing.
     */
    closeStream : function() {
        if (this.get("streamingVideo")) {
            var socket = this.get("videoSocket");
            socket.disconnect();
            this.set("videoSocket", null);
        }
    },

    actions: {
        initVideo : function() {
            var self = this;
            this.adapter.find("drone", this.get("model.id"), "initVideo").then(function () {
                self.adapter.resolveLink("drone", self.get("model.id"), "videoSocket").then(function (url) {
                    var socket = window.SocketManager.create({defaultUrl: url.url, authManager:self.authManager });
                    self.set("videoSocket", socket);
                    socket.initConnection();

                    socket.register("JPEGFrameChanged", 0, "droneController", function(message) {
                        self.set("currentFrame", message.imageData);
                        self.videoProperty();
                    });
                });
            }, function (data) {
                if (data.responseJSON.reason)
                    self.set("controlError", data.responseJSON.reason);
                else
                    self.set("controlError", data.responseJSON);
            });
        },

        click : function(state) {
            this.set("flying", state);
        },

        closeStreamAction : function() {
            this.closeStream();
        },

        emergency: function(id){
            this.adapter.find('drone',id,"emergency").then(function(data){
                console.log(data);
            });
        }
    }

});