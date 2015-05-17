/**
 * @module cros-admin
 * @submodule controllers
 */

/**
 * This will create a new controller for controlling a drone manually
 * @class ManualController
 * @namespace App
 * @constructor
 * @extends Ember.ObjectController
 */
App.ManualController = Ember.ObjectController.extend({

    /**
     * The current battery status of the drone
     * @public
     * @property battery {String}
     */
    battery : "N/A",
    /**
     * The current altitude of the drone
     * @public
     * @property altitude {integer}
     */
    altitude : -1,
    /**
     * The current location of the drone
     * @public
     * @property location {Object}
     */
    location : [0,0],
    /**
     * The current speed of the drone
     * @public
     * @property speedvalue {double}
     */
    speedvalue : 1,
    /**
     * Whether or not the drone is currently flying
     * @public
     * @property flying {boolean}
     */
    flying : false,
    /**
     * The current video frame from the videowebsocket
     * @public
     * @property currentFrame {String}
     */
    currentFrame : "",
    /**
     * The prefix for displaying image data base 64 in html
     * @private
     * @final
     * @property videoPrefix {String}
     */
    videoPrefix : "data:image/jpeg;base64, ",

    _originalDroneStatus : null,
    /**
     * The original status of the drone before taking manual control
     * This will also make sure a copy of this value is in the cookies so it is not lost on refresh.
     *
     * @public
     * @property originalDroneStatus {String}
     */
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

    /**
     * Functionality that should be executed before closing this controller.
     * @public
     * @method beforeClose
     * @returns {boolean} Whether the controller is ready to be closed
    */
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

    /**
     * The string to print for the speed
     * @public
     * @property speedString {String}
     */
    speedString : function() {
        return parseFloat(this.get("speedvalue")).toFixed(2);
    }.property("speedvalue"),

    /**
     * the error message concerning the manual controls
     * @public
     * @property controlError {String}
     */
    controlError : "",
    /**
     * Whether there is currently an error concerning the manual controls
     * @public
     * @property hasControlError {boolean}
     */
    hasControlError : function() {
        return this.get("controlError") !== "";
    }.property("controlError"),

    /**
     * Whether or not there is currently a video stream setup.
     * @public
     * @property streamingVideo {boolean}
     */
    streamingVideo : function() {
        if (this.get("videoSocket")) {
            return this.get("videoSocket.connection");
        } else {
            return false;
        }
    }.property("videoSocket.connection"),

    /**
     * This function will update the image that is currently visible in the video
     * @public
     * @method videoProperty
     */
    videoProperty : function() {
        $("#videoStream").attr('src', this.get("videoPrefix").concat(this.get("currentFrame")));
    }.observes("currentFrame"),

    /**
     * This function will close the active videowebsocket.
     * If no video websocket is active, this will do nothing.
     *
     * @public
     * @method closeStream
     */
    closeStream : function() {
        if (this.get("streamingVideo")) {
            var socket = this.get("videoSocket");
            socket.disconnect();
            this.set("videoSocket", null);
        }
    },

    actions: {
        /**
         * This will initialize the videosocket and make sure incoming frames are displayed on the videowindow.
         * @public
         * @method initVideo
         */
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