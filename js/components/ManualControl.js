/**
 * Created by matthias on 25/04/2015.
 */

App.Keyboard = Ember.Object.create({

    listeners : {},

    registerListener : function(keycode, handler, releaseHandler) {
        var arr = this.get("listeners")[keycode] || [];
        arr.pushObject({handler: handler, releaseHandler: releaseHandler});
        this.get("listeners")[keycode] = arr;
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
            self.adapter.find("drone",self.get("currentId"), ["commands", self.get("command")]).fail(function(data) {
                if (data.responseJSON instanceof String)
                    self.set("error", data.responseJSON);
                else
                    self.set("error", data.responseJSON.reason);
            });
        });

        if (this.get("key")) {
            App.Keyboard.registerListener(this.get("key"), function() {
                self.$().addClass("controlButtonActive");
                self.send("click");
            }, function() {
                self.$().removeClass("controlButtonActive");
            });
        }
    },

    actions: {
        click : function() {
            var self = this;
            this.adapter.find("drone",this.get("currentId"), ["commands", this.get("command")]).fail(function(data) {
                if (typeof data.responseJSON === "string")
                    self.set("error", data.responseJSON);
                else
                    self.set("error", data.responseJSON.reason);
            });
        }
    }

});