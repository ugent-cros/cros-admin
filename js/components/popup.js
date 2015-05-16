App.PopupWindowComponent = Ember.Component.extend({

    sizeStyle: function(){
        return "width: " + this.get("size");
    }.property("size"),

	closing: false,	
	
	actions: {
		ok: function() {
			this.sendAction('ok');
		}
	},

	show: function() {
		var self = this;
		this.$('.modal').modal({
			backdrop: 'static',
			keyboard: true,
			show: true
		});

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