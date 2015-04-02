App.PopupWindowComponent = Ember.Component.extend({
  /*actions: {
    ok: function() {
      this.$('.modal').modal('hide');
      this.sendAction('ok');
    }
  },*/

    sizeStyle: function(){
        return "width: " + this.get("size");
    }.property("size"),

	show: function() {
		this.$('.modal').modal('show');
		this.$('.modal').on('hide.bs.modal', function(e) {
			$('#closeModal').click();
		});
	}.on('didInsertElement'),
	hide: function() {
		this.$('.modal').modal('hide');
	}.on('willDestroyElement')
});