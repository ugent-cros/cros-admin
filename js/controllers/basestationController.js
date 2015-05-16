/**
 * @module cros-admin
 * @submodule controllers
 */

/**
 * This will create a new controller for a basestation object
 * @class BasestationController
 * @constructor
 * @extends Controller
 */
App.BasestationController = Ember.Controller.extend({

    basestationLocation : function() {
        var loc = this.get('model').location;
        return Ember.Object.create({lat : loc.latitude, lon : loc.longitude});
    }.property('model')

});