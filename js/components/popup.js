App.PopupWindowComponent = Ember.Component.extend({
	closing: false,	
	
	actions: {
		save: function() {
			this.sendAction('ok');
		}
	},
	
	show: function() {
		var self = this;
		this.$('.modal').modal('show');
		this.$('.modal').on('hide.bs.modal', function(e) {
			if(!self.closing) {
				$('#closeModal').click();
				self.closing = true;
			}
		});
	}.on('didInsertElement'),
	
	hide: function() {
		this.closing = true;
		this.$('.modal').modal('hide');
	}.on('willDestroyElement')
});