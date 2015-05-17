/**
 * @module cros-admin
 * @submodule controllers
 */

/**
 * This will create a new controller for a basestation object
 * @class BasestationController
 * @namespace App
 * @constructor
 * @extends Ember.Controller
 */
App.BasestationController = Ember.Controller.extend({

    /**
     * This is the current location of the basestation.
     *
     * @public
     * @property basestationLocation
     */
    basestationLocation : function() {
        var loc = this.get('model').location;
        return Ember.Object.create({lat : loc.latitude, lon : loc.longitude});
    }.property('model')

});