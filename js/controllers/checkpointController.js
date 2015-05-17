/**
 * @module cros-admin
 * @submodule controllers
 */

/**
 * This will create a new controller for a checkpoint object
 * @class CheckpointController
 * @namespace App
 * @constructor
 * @extends Ember.ObjectController
 */
App.CheckpointController = Ember.ObjectController.extend({
    /**
     * Whether this checkpoint is the first in the list.
     * @public
     * @property isFirstCheckpoint {boolean}
     */
	isFirstCheckpoint: function() {
		return this.get('id') < 1;
	}.property('id')
});