/**
 * @module cros-admin
 * @submodule controllers
 */

/**
 * This will create a new controller for a list of basestations
 * @class BasestationsController
 * @namespace App
 * @constructor
 * @extends App.ListSuperController
 */
App.BasestationsController = App.ListSuperController.extend({
    /**
     * List representing the columns in the table
     *
     * @public
     * @property columns {Array|Object}
    */
    /**
     * Title of the column
     *
     * @public
     * @property columns.label {String}
    */
    /**
     * Representing name for rest objects
     *
     * @public
     * @property columns.value {String}
    */
    /**
     * expresses if the column is sortable for that parameter
     *
     * @public
     * @property columns.sortable {Boolean}
     */
    columns : [{label:'#', value:"id", sortable:1},
        {label:'Name', value: "name", sortable:1},
        {label:'Actions', sortable:0}
    ],

    /**
     * Type of the elements
     *
     * @property {string} element
     */
    element : 'basestation',

    /**
     * List of the possible parameters where a user can search on
     *
     * @property searchFields
     */
    searchFields : ["name"]
});

/**
 * This will create a new controller for a editing a basestation.
 * @class BasestationEditController
 * @namespace App
 * @constructor
 * @extends Ember.Controller
 */
App.BasestationEditController = Ember.Controller.extend({
    needs: 'basestations',
    index: Ember.computed.alias("controllers.basestations"),

    /**
     * the error message concerning the name
     * @public
     * @property nameError {String}
     */
    nameError : "",
    /**
     * Whether there is currently an error concerning the name
     * @public
     * @property hasNameError {boolean}
     */
    hasNameError : function() {
        return this.get('nameError') !== "";
    }.property('nameError'),

    /**
     * The location of the basestation
     * @public
     * @property location {Object}
     */
    location : function(key,value,previousValue) {
        // setter
        if (arguments.length > 1) {
            if (value) {
                this.set('model.location.longitude', value.lon);
                this.set('model.location.latitude', value.lat);
            } else {
                this.set('model.location.longitude', null);
                this.set('model.location.latitude', null);
            }
        }

        // getter
        if (!this.get("model.location"))
            this.set("model.location", {});
        var lat = this.get("model.location.latitude");
        var lon = this.get("model.location.longitude");

        if (lon && lat)
            return Ember.Object.create({lat : lat, lon : lon});
        else
            return null
    }.property("model.location.longitude", "model.location.latitude"),
    /**
     * the error message concerning the location
     * @public
     * @property locationError {String}
     */
    locationError : "",
    /**
     * Whether there is currently an error concerning the location
     * @public
     * @property hasLocationError {boolean}
     */
    hasLocationError : function() {
        return this.get("locationError") !== "";
    }.property("locationError"),

    /**
     * the error message concerning the longitude
     * @public
     * @property longitudeError {String}
     */
    longitudeError : "",
    /**
     * Whether there is currently an error concerning the longitude
     * @public
     * @property hasLongitudeError {boolean}
     */
    hasLongitudeError : function() {
        return this.get("longitudeError") !== "";
    }.property("longitudeError"),

    /**
     * the error message concerning the latitude
     * @public
     * @property latitudeError {String}
     */
    latitudeError : "",
    /**
     * Whether there is currently an error concerning the latitude
     * @public
     * @property hasLatitudeError {boolean}
     */
    hasLatitudeError : function() {
        return this.get("latitudeError") !== "";
    }.property("latitudeError"),

    /**
     * the error message concerning the altitude
     * @public
     * @property altitudeError {String}
     */
    altitudeError : "",
    /**
     * Whether there is currently an error concerning the altitude
     * @public
     * @property hasAltitudeError {boolean}
     */
    hasAltitudeError : function() {
        return this.get("altitudeError") !== "";
    }.property("altitudeError"),

    /**
     * Whether there is currently an error concerning anything other than the other properties.
     * @public
     * @property hasSomeError {boolean}
     */
    hasSomeError : function() {
        return this.get("hasAltitudeError") || this.get("hasLatitudeError") || this.get("hasLongitudeError") || this.get("hasLocationError");
    }.property("hasAltitudeError", "hasLatitudeError", "hasLongitudeError", "hasLocationError"),

    /**
     * function called when save function fails
     * @private
     * @method failure
     * @param result The error data
     */
    failure : function(result) {
        this.set('nameError', result.responseJSON.name || "");
        this.set('locationError', result.responseJSON.location || "");
        this.set('longitudeError', result.responseJSON["location.longitude"] || "");
        this.set('latitudeError', result.responseJSON["location.latitude"] || "");
        this.set('altitudeError', result.responseJSON["location.altitude"] || "");
    },

    /**
     * function called when save call succeeds
     *
     * @private
     * @method success
     * @param result the result from the save call
     */
    success : function(result) {
        this.transitionToRoute('basestation', result.basestation.id);
    },

    actions : {
        /**
         * function to save the new basestation.
         *
         * @public
         * @method save
         */
        save: function(){

            var jsonObject = {
                basestation : this.get("model")
            };

            if (this.get("model.id"))
                var result = this.adapter.edit('basestation', this.get("model.id"), jsonObject);
            else
                var result = this.adapter.post('basestation', jsonObject);
            var self = this;
            result.then(
                function(data) {
                    self.success(data);
                    self.get('index').refresh();
                },
                function(data) {
                    self.failure(data);
                    self.get('index').refresh();
                }
            );
        }
    }
});