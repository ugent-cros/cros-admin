/**
 * Created by matthias on 25/04/2015.
 */

App.Keyboard = Ember.Object.create({

    listeners : {},

    registerListener : function(keycode, id, handler, releaseHandler) {
        var arr = this.get("listeners")[keycode] || [];
        arr.pushObject({id : id, handler: handler, releaseHandler: releaseHandler});
        this.get("listeners")[keycode] = arr;
    },

    unregisterListener : function(keycode, id) {
        if (keycode) {
            var arr = this.get("listeners")[keycode].filter(function(handlerObj) {return handlerObj.id === id;});
            if (arr.length > 0) {
                this.get("listeners")[keycode].removeObject(arr[0]);
            }
        }
    },

    handler : function(event) {
        var keyPressed = String.fromCharCode(event.keyCode);

        var handlers = this.get("listeners")[keyPressed] || [];
        $.each(handlers, function() {
            if (this.handler)
                this.handler();
        });
    },

    release : function(event) {
        var keyPressed = String.fromCharCode(event.keyCode);

        var handlers = this.get("listeners")[keyPressed] || [];
        $.each(handlers, function() {
            if (this.releaseHandler)
                this.releaseHandler();
        });
    },

    init : function() {
        var self = this;
        document.addEventListener("keydown", function(event) {self.handler(event);}, false);
        document.addEventListener("keyup", function(event) {self.release(event);}, false);
    }

});


App.ManualControlComponent = Ember.Component.extend({

    tagName: 'a',
    classNames : ["btn", "btn-default"],
    attributeBindings: ['type'],
    href: "button",
    action : "click",

    title : "",
    command : "",
    key : null,

    didInsertElement : function() {
        var self = this;
        this.$().on('click', function() {
            self.send("click");
        });

        if (this.get("key")) {
            App.Keyboard.registerListener(this.get("key"), "control-"+this.get("key"), function() {
                self.$().addClass("controlButtonActive");
                self.send("click");
            }, function() {
                self.$().removeClass("controlButtonActive");
            });
        }
    },

    willDestroyElement : function() {
        App.Keyboard.unregisterListener(this.get("key"), "control-"+this.get("key"));
    },

    actions: {
        click : function() {
            var self = this;
            var params = {data: {speed: parseFloat($("#speed").val())}};
            this.adapter.find("drone",this.get("currentId"), ["commands", this.get("command")], params).then(function() {
                if (self.get("command") === "takeOff")
                    self.sendAction('action', true);
                if (self.get("command") === "land")
                    self.sendAction('action', false);
                self.set("error", "");
            }).fail(function(data) {
                if (typeof data.responseJSON === "string")
                    self.set("error", data.responseJSON);
                else
                    self.set("error", data.responseJSON.reason);
            });
        }
    }

});