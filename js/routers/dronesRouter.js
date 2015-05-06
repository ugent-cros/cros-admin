/**
 * Created by matthias on 11/04/2015.
 */

App.DronesRoute = App.AuthRoute.extend({
    model: function() {
        /*return this.fetch({store:'drone', options : {pageSize : 2, page : 0, total:true}, callback: function(data) {
            return data;
        }});*/
    }
});

App.DroneRoute = App.PopupRoute.extend({
    model: function(params) {
        var self = this;
        return this.fetch({store:'drone', id: params.drone_id});
    },

    setupController: function(controller, model) {
        this._super(controller,model);
    },

    renderTemplate: function() {
        this._super('drone', 'drones');
    },

    actions : {
        willTransition : function() {
            if (this.get("currentModel.status") !== this.get("controller.originalDroneStatus")) {
                this.set("currentModel.status", this.get("controller.originalDroneStatus"));
                this.adapter.edit('drone', this.get("currentModel.id"), {drone : this.get("currentModel")});
            }

            this.set("controller.originalDroneStatus", undefined);
        }
    }
});

App.DroneEditRoute = App.PopupRoute.extend({
    setupController: function(controller, model) {
        this._super(controller,model);
        this.adapter.find("drone", null, "types").then(function(data) {
            controller.set("types", data.droneType.map(function(t) { return Ember.Object.create(t);}));
        });
    },

    model: function(params) {
        if(params.drone_id)
            return this.fetch({store:'drone', id: params.drone_id});
        else
            return { droneType: new Object() };
    },
    renderTemplate: function() {
        this._super('drone-edit', 'drones');
    }
});

App.DronesAddRoute = App.DroneEditRoute.extend({
    controllerName: 'drone-edit'
});
