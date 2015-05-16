/**
 * @module cros-admin
 * @submodule controllers
 */

/**
 * This will create a new controller for a checkpoint object
 * @class CheckpointController
 * @namespace App
 * @constructor
 * @extends ObjectController
 */
App.CheckpointController = Ember.ObjectController.extend({
	isFirstCheckpoint: function() {
		return this.get('id') < 1;
	}.property('id')
});