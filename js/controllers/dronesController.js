/**
 * @module cros-admin
 * @submodule controllers
 */

/**
 * This will create a new controller for a list of drones
 * @class DronesController
 * @namespace App
 * @constructor
 * @extends App.ListSuperController
 */
App.DronesController = App.ListSuperController.extend({

    /**
     * List representing the columns in the table
     *
     * @property columns
     * @property columns.label - Title of the column
     * @property columns.value - Representing name for rest objects
     * @property columns.sortable - expresses if the column is sortable for that parameter
     */
    columns : [{label:'#', value:"id", sortable:1},
                {label:'Name', value: "name", sortable:1},
                {label:'Status', value:"status", sortable:1},
                {label:'Emergency', sortable:0},
                {label:'Actions', sortable:0}
    ],

    /**
     * Type of the elements
     *
     * @property {string} element
     */
    element : "drone",

    /**List of the possible parameters where a user can search on*/
    searchFields : ["name"],

    total: null, // is still used?

    actions:{
        /**
         * Perform an emergency call to the drone with the given id
         * @param {number} id - id of the drone
         */
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

/**
 * This will create a new controller editing a drone
 * @class TypeController
 * @namespace App
 * @constructor
 * @extends Ember.ObjectController
 */
App.DroneEditController = Ember.Controller.extend({
    needs: 'drones',
    index: Ember.computed.alias("controllers.drones"),
    /**
     * the error message concerning the name
     * @public
     * @property nameError {String}
     */
	nameError: "",
    /**
     * the error message concerning the address
     * @public
     * @property addressError {String}
     */
	addressError: "",
    /**
     * the error message concerning the type
     * @public
     * @property typeError {String}
     */
	typeError: "",
    /**
     * the error message concerning the weight
     * @public
     * @property weightError {String}
     */
	weightError: "",
    /**
     * Whether there is currently an error concerning the name
     * @public
     * @property hasNameError {boolean}
     */
    hasNameError : function() {
        return this.get('nameError') !== "";
    }.property('nameError'),
    /**
     * Whether there is currently an error concerning the address
     * @public
     * @property hasAddressError {boolean}
     */
    hasAddressError : function() {
        return this.get('addressError') !== "";
    }.property('addressError'),
    /**
     * Whether there is currently an error concerning the type
     * @public
     * @property hasTypeError {boolean}
     */
    hasTypeError : function() {
        return this.get('typeError') !== "";
    }.property('typeError'),
    /**
     * Whether there is currently an error concerning the weight
     * @public
     * @property hasWeightError {boolean}
     */
    hasWeightError : function() {
        return this.get('weightError') !== "";
    }.property('weightError'),

    /**
     * This function will be called when the REST call succeeds
     *
     * @private
     * @method success
     * @param id the id of the new drone
     */
	success: function(id) {
		this.transitionToRoute('drone', id);
	},

    /**
     * Whether the current state is "AVAILABLE"
     *
     * @public
     * @property isAvailableState
     */
    isAvailableState : function() {
        return this.get("model.status") == "AVAILABLE";
    }.property("model.status"),

    /**
     * Whether the current state is "CHARGING"
     *
     * @public
     * @property isChargingState
     */
    isChargingState : function() {
        return this.get("model.status") == "CHARGING";
    }.property("model.status"),

    /**
     * Whether the current state is "INACTIVE"
     *
     * @public
     * @property isInactiveState
     */
    isInactiveState : function() {
        return this.get("model.status") == "INACTIVE";
    }.property("model.status"),

    /**
     * Whether the current state is "RETIRED"
     *
     * @public
     * @property isRetiredState
     */
    isRetiredState : function() {
        return this.get("model.status") == "RETIRED";
    }.property("model.status"),

    /**
     * Whether the current state is "MANUAL_CONTROL"
     *
     * @public
     * @property isManualState
     */
    isManualState : function() {
        return this.get("model.status") == "MANUAL_CONTROL";
    }.property("model.status"),

    /**
     * This function will update the status of the local model.
     * @public
     * @property updateSelected
     */
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

    /**
     * This function will handle errors from the ajax calls.
     *
     * @private
     * @method failure
     * @param data the errordata
     */
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
            Ember.set(jsonObject.drone, "status", jsonObject.drone.status || "AVAILABLE");
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