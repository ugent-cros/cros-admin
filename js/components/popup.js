App.MyPopupComponent = Ember.Component.extend({
  /*actions: {
    ok: function() {
      this.$('.modal').modal('hide');
      this.sendAction('ok');
    }
  },*/
	show: function() {
		this.$('.modal').modal('show');
	}.on('didInsertElement'),
	hide: function() {
		this.$('.modal').modal('hide');
	}.on('willDestroyElement')
});