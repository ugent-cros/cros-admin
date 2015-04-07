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

App.DroneEditController = Ember.Controller.extend({	
	success: function(id) {
		this.set('name', '');
		this.set('address', '');
		this.set('weightLimitation', '');
		this.set('type', '');
		this.set('versionNumber', '');
		this.transitionToRoute('drone', id);
		
	},
	
	failure: function(data) {
		if (data.status == 400) {
			if(!$('#droneAlert')[0]) {
				$('#droneAddAlert')
					.append($('<div>')
						.attr('id', 'droneAlert')
						.attr('class', 'alert alert-danger alert-dismissible')
						.attr('role', 'alert')
					);
			}
			$('#droneAlert').text('');
			if(data.responseJSON.name)
				$('#droneAlert').append($('<p>').text('Name: ' + data.responseJSON.name));
			if(data.responseJSON.address)
				$('#droneAlert').append($('<p>').text('Address: ' + data.responseJSON.address));
			if(data.responseJSON.droneType)
				$('#droneAlert').append($('<p>').text('Drone type and version: ' + data.responseJSON.droneType));
			if(data.responseJSON.weightLimitation)
				$('#droneAlert').append($('<p>').text('Weight limitation: ' + data.responseJSON.weightLimitation));
		}
	},
	
	actions: {
		save: function(){
			var jsonObject = { drone: this.model };
			if(this.model.id)
				var result = this.customAdapter.edit('drone', this.model.id, jsonObject);
			else
				var result = this.customAdapter.post('drone', jsonObject);
			var self = this;
			result.then(
				function(data) { self.success(data.drone.id); },
				function(data) { self.failure(data); }
			);
		}
	}
});