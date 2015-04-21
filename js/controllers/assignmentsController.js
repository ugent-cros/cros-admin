App.AssignmentsController = App.ListSuperController.extend({
    columns : [{label:'#', value:"id", sortable:1},
        {label:'Priority', value: "priority", sortable:1},
        {label:'Creator', value:"creator", sortable:1},
        {label:'Drone', value: "assignedDrone", sortable:1},
        {label:'Actions', sortable:0}
    ],
    element : "assignment",
    searchFields : ["creator","drone"]
});

App.AssignmentsAddController = Ember.ArrayController.extend({
    needs: 'assignments',
    index: Ember.computed.alias("controllers.assignments"),

	selected: null,	
	checkpoints: Ember.A([
		{ id: 0,  latitude: null, longitude: null, altitude: null, waitingTime: null }
	]),

    locations : function(k,v) {
        // setter
        if (arguments.length > 1) {
            var checkpoints = this.get("checkpoints");
            $.each(v, function(i, location) {
                if (!checkpoints[i])
                    checkpoints.pushObject(Ember.Object.create({}));

                Ember.set(checkpoints[i], 'id', i);
                Ember.set(checkpoints[i], 'latitude', location.lat);
                Ember.set(checkpoints[i], 'longitude', location.lon);
            });
        }

        // getter
        var result = [];
        $.each(this.get("checkpoints"), function() {
            if (this.latitude && this.longitude)
                result.push(Ember.Object.create({ lat : this.latitude, lon : this.longitude}));
        });
        if (result.length > 0)
            return Ember.A(result);
        else
            return null;
    }.property("checkpoints.@each.longitude", "checkpoints.@each.latitude"),
	
	// ACTIONS
	actions: {
		reset: function() {
			this._super();
			this.checkpoints.clear();
			this.checkpoints.pushObject({ id: 0,  latitude: null, longitude: null, altitude: null, waitingTime: null });
			this.priority = '';
		},
		
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
			var result = this.adapter.post('assignment', jsonObject);
			var self = this;
			result.then(
				function(data) {
                    self.success(data.assignment.id);
                    self.get('index').refresh();
                },
				function(data) {
                    self.failure(data);
                    self.get('index').refresh();
                }
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
				this.adapter.find('basestation', this.selected).then(function(data){
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
	},
	
	/*
	 * Called on an successful save to the server. 
	 */
	success: function(id) {
		this.priority = '';
		this.transitionToRoute('assignment', id);
		
	},
	
	/*
	 * Called on a failed save to the server.
	 */
	failure: function(data) {
		if (data.status == 400) {
			if(!$('#assignmentAlert')[0]) {
				$('#assignmentAddAlert')
					.append($('<div>')
						.attr('id', 'assignmentAlert')
						.attr('class', 'alert alert-danger alert-dismissible')
						.attr('role', 'alert')
					);
			}
			$('#assignmentAlert').text('');
			if(data.responseJSON.route)
				$('#assignmentAlert').append($('<p>').text('Route: at least one checkpoint (latitude, longitude and altitude) is required'));
			if(data.responseJSON.priority)
				$('#droneAlert').append($('<p>').text('Priority: ' + data.responseJSON.priority));
		}
	}
});