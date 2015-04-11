App.CheckpointController = Ember.ObjectController.extend({
	isFirstCheckpoint: function() {
		return this.get('id') < 1;
	}.property('id')
});