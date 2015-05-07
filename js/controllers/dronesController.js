/**
 * Created by Eveline on 25/03/2015.
 */
App.DronesController = App.ListSuperController.extend({
    columns : [{label:'#', value:"id", sortable:1},
                {label:'Name', value: "name", sortable:1},
                {label:'Status', value:"status", sortable:1},
                {label:'Emergency', sortable:0},
                {label:'Actions', sortable:0}
    ],
    element : "drone",
    searchFields : ["name"],
    total: null,

    actions:{
        emergency: function(id){
            this.adapter.find('drone',id,"emergency").then(function(data){
                console.log(data);
            });
        }
    }
});

App.TypeController = Ember.ObjectController.extend({
    isSelected: function() {
        return this.get("selected");
    }.property()
});

App.DroneEditController = Ember.Controller.extend({
    needs: 'drones',
    index: Ember.computed.alias("controllers.drones"),
	nameError: "",
	addressError: "",
	typeError: "",
	weightError: "",
    hasNameError : function() {
        return this.get('nameError') !== "";
    }.property('nameError'),
    hasAddressError : function() {
        return this.get('addressError') !== "";
    }.property('addressError'),
    hasTypeError : function() {
        return this.get('typeError') !== "";
    }.property('typeError'),
    hasWeightError : function() {
        return this.get('weightError') !== "";
    }.property('weightError'),

	success: function(id) {
		this.transitionToRoute('drone', id);
	},

    isAvailableState : function() {
        return this.get("model.status") == "AVAILABLE";
    }.property("model.status"),

    isChargingState : function() {
        return this.get("model.status") == "CHARGING";
    }.property("model.status"),

    isInactiveState : function() {
        return this.get("model.status") == "INACTIVE";
    }.property("model.status"),

    isRetiredState : function() {
        return this.get("model.status") == "RETIRED";
    }.property("model.status"),

    isManualState : function() {
        return this.get("model.status") == "MANUAL_CONTROL";
    }.property("model.status"),

    updateSelected : function() {
        var self = this;
        var types = this.get("types") || [];
        var noneSelected = true;
        $.each(types, function() {
            var condition = this.type === self.get("model.droneType").type;
            noneSelected = noneSelected && !condition;
            this.set("selected", condition);
        });
        if (noneSelected && types[0]) {
            Ember.set(this.get("model"), "droneType", types[0]);
        }
    }.observes("types", "model.droneType"),

	failure: function(data) {
        if(typeof data.responseJSON === 'string' || data.responseJSON.reason) {
			if(!$('#droneAlert')[0]) {
				$('#droneAddAlert')
					.append($('<div>')
						.attr('id', 'droneAlert')
						.attr('class', 'alert alert-danger alert-dismissible')
						.attr('role', 'alert')
					);
			}
			$('#droneAlert').text('');
			if (typeof data.responseJSON === 'string')
				$('#droneAlert').append($('<p>').text(data.responseJSON));
			if (data.responseJSON.reason)
				$('#droneAlert').append($('<p>').text(data.responseJSON.reason));
		}
		this.set('nameError', data.responseJSON.name || "");
		this.set('addressError', data.responseJSON.address || "");
		this.set('typeError', data.responseJSON.droneType || "");
		this.set('weightError', data.responseJSON.weightLimitation || "");
	},
	
	actions: {
		save: function(){
			var jsonObject = { drone: this.model };
            jsonObject.drone.status = jsonObject.drone.status || "AVAILABLE";
			if(this.model.id)
				var result = this.adapter.edit('drone', this.model.id, jsonObject);
			else
				var result = this.adapter.post('drone', jsonObject);
			var self = this;
			result.then(
				function(data) {
                    self.success(data.drone.id);
                    self.get('index').refresh();
                },
				function(data) {
                    self.failure(data);
                    self.get('index').refresh();
                }
			);
		},

        updateType : function(type) {
            var typeString = $("#typeSelector select option:selected").text();
            var type = typeString.split(" (")[0];
            var version = typeString.split(" (")[1].slice(0,-1);
            var selectedType = this.get("types").filter(function(t) {
                return t.type === type && t.versionNumber === version;
            });
            this.set("model.droneType", selectedType[0]);
        },

        setState : function(state) {
            this.set("model.status", state);
        }
	}
});