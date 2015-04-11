App.AssignmentsController = App.ListSuperController.extend({
    columns : ['#','Priority','Creator','Drone','Actions'],
    element : "assignment",
    searchFields : ["creator","drone"]
});

App.AssignmentsAddController = Ember.ArrayController.extend({
	selected: null,	
	checkpoints: Ember.A([
		{ id: 0,  latitude: null, longitude: null, altitude: null, waitingTime: null }
	]),
	
	// ACTIONS
	actions: {
		/*
		 * Save the assignment in the database
		 */
		save: function(){
			var checkpoints = this.get('checkpoints');
			// Get all the checkpoints defining the route
			route = [];
            for (i = 0; i < checkpoints.length; ++i) {
                if(checkpoints[i].latitude != null && checkpoints[i].longitude != null && checkpoints[i].altitude != null) {
                    var location = new Object();
                    location.longitude = checkpoints[i].longitude;
                    location.latitude = checkpoints[i].latitude;
                    location.altitude = checkpoints[i].altitude;
                    var checkpoint = new Object();
                    checkpoint.location = location;
                    if(checkpoints[i].value != null)
                        checkpoint.waitingTime = checkpoints[i].waitingTime;
                    route.push(checkpoint);
                }
            }
			// Create an json object
			var assignment = new Object();
			assignment.route = route;
			assignment.priority = this.priority;
			var jsonObject = new Object();
			jsonObject.assignment = assignment;
			// Send the object to the server for saving
			var result = this.customAdapter.post('assignment', jsonObject);
			var self = this;
			result.then(
				function(data) { self.success(data.assignment.id); },
				function(data) { self.failure(data); }
			);
		},
		
		/*
		 * Add an checkpoint or a basestation (based on the selection
		 * made by the user). Adding a checkpoint results in appending
		 * a extra row to the form (cfr. RENDERING).
		 * Adding an basestation results in filling in the coordinates
		 * of that basestation into an empty row.
		 */
		add: function() {
			var checkpoints = this.get('checkpoints');
			if(this.selected != null) {
				var self = this;
				this.customAdapter.find('basestation', this.selected).then(function(data){					
					$("select option").filter(function() {
						return $(this).text() == 'Checkpoint'; 
					}).prop('selected', true);
					self.set('selected', null);
					
					var addRow = true;
					for (i = 0; i < checkpoints.length; ++i) {
						if(checkpoints[i].latitude == null && checkpoints[i].longitude == null && checkpoints[i].altitude == null) {
							Ember.set(checkpoints[i], 'latitude', data.location.latitude);
							Ember.set(checkpoints[i], 'longitude', data.location.longitude);
							Ember.set(checkpoints[i], 'altitude', data.location.altitude);
							Ember.set(checkpoints[i], 'waitingTime', data.location.waitingTime);
							addRow = false;
							break;
						}
					}
					if(addRow) 
						checkpoints.pushObject({ id: checkpoints.length,  latitude: data.location.latitude, longitude: data.location.longitude, altitude: data.location.altitude, waitingTime: data.location.waitingTime });
				});
			}
			else
				checkpoints.pushObject({ id: checkpoints.length,  latitude: null, longitude: null, altitude: null, waitingTime: null });
		},
		
		swap: function(nextID) {
			var checkpoints = this.get('checkpoints');
			var prevID = nextID - 1;
			var prevLongitude = checkpoints[prevID].longitude;
			var prevLatitude = checkpoints[prevID].latitude;
			var prevAltitude = checkpoints[prevID].altitude;
			var prevWaitingTime = checkpoints[prevID].waitingTime;
			Ember.set(checkpoints[prevID], 'latitude', checkpoints[nextID].latitude);
			Ember.set(checkpoints[prevID], 'longitude', checkpoints[nextID].longitude);
			Ember.set(checkpoints[prevID], 'altitude', checkpoints[nextID].altitude);
			Ember.set(checkpoints[prevID], 'waitingTime', checkpoints[nextID].waitingTime);
			Ember.set(checkpoints[nextID], 'latitude', prevLatitude);
			Ember.set(checkpoints[nextID], 'longitude', prevLongitude);
			Ember.set(checkpoints[nextID], 'altitude', prevAltitude);
			Ember.set(checkpoints[nextID], 'waitingTime', prevWaitingTime);
		}
	}
});