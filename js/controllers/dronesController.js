/**
 * Created by Eveline on 25/03/2015.
 */
App.DronesController = Ember.Controller.extend({
    columns : ['#','Name','Status','Actions'],
    getStatusClass: function(){
        if (status == 'AVAILABLE'){
            return 'label-success'
        }
    }.property(status)
});

App.DronesAddController = Ember.Controller.extend({
	actions: {
		save: function(){
			var jsonObject = new Object();
			jsonObject.name = this.name;
			jsonObject.type = this.type;
			jsonObject.version = this.version;
			jsonObject.weightLimitation = this.weightLimitation;
			console.log(JSON.stringify(jsonObject));
		}
	}
});