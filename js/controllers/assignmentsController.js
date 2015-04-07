App.AssignmentsController = Ember.Controller.extend({
    columns : ['#','Priority','Creator','Drone','Actions']
});

App.AssignmentsAddController = Ember.Controller.extend({	
	count: 1,
	selected: null,
	
	// ACTIONS
	
	actions: {
		/*
		 * Save the assignment in the database
		 */
		save: function(){
			// Get all the checkpoints defining the route
			route = [];
            for (i = 0; i < $('.altitude').length; ++i) {
                if($('.longitude')[i].value != '' && $('.latitude')[i].value != '' && $('.altitude')[i].value != '') {
                    var location = new Object();
                    location.longitude = parseInt($('.longitude')[i].value);
                    location.latitude = parseInt($('.latitude')[i].value);
                    location.altitude = parseInt($('.altitude')[i].value);
                    var checkpoint = new Object();
                    checkpoint.location = location;
                    if($('.waitingTime')[i].value != '')
                        checkpoint.waitingTime = parseInt($('.waitingTime')[i].value);
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
			// A basestation is added
			if(this.selected != null) {
				var self = this;
				this.customAdapter.find('basestation', this.selected).then(function(data){					
					$("select option").filter(function() {
						return $(this).text() == 'Checkpoint'; 
					}).prop('selected', true);
					self.set('selected', null);
					
					var extraRowRequired = true;
					var i = 0;
					for (; i < $('.altitude').length; ++i) {
						if($('.longitude')[i].value == '' && $('.latitude')[i].value == '' && $('.altitude')[i].value == '') {
							$('.longitude')[i].value = data.location.longitude;
							$('.latitude')[i].value = data.location.latitude;
							$('.altitude')[i].value = data.location.altitude;
							extraRowRequired = false;
							break;
						}
					}
					if(extraRowRequired == true) {							
						self.appendRow();
						$('.longitude')[i].value = data.location.longitude;
						$('.latitude')[i].value = data.location.latitude;
						$('.altitude')[i].value = data.location.altitude;
					}
					var wellID = $('.longitude')[i].parentNode.parentNode.parentNode.id;
					self.prependBasestationLabel($('#' + wellID));
				});
			} else {
				this.appendRow();
			}
		}
	},
	
	// HELP FUNCTIONS
	
	/*
	 * Observer of the selected property of this controller.
	 * Adjusts the label of the add button based on the selected option.
	 */
	basestationSelected: function() {
		if(this.selected != null)
			$('#addButtonText').text('Add basestation');
		else
			$('#addButtonText').text('Add');
	}.observes('selected'),
	
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
	},
	
	/*
	 * Swap two rows of information.
	 */
	swap: function(evt) {
		var parent = evt.target.parentNode;
		// The font-awesome icon inside the button is clicked
		// resolve this issue by requesting the parent again
		if(parent.localName == 'button')
			parent = parent.parentNode;
		
		// Get the previous and next element and its children
		var prev = parent.previousElementSibling;
		var next = parent.nextElementSibling;
		var prevChildren = prev.children;
		var nextChildren = next.children;
		
		// Swap the basestation label if necessary
		if(prevChildren.length == nextChildren.length + 1)
			this.swapBasestationLabel($('#' + prev.id), $('#' + next.id));
		else if(nextChildren.length == prevChildren.length + 1)
			this.swapBasestationLabel($('#' + next.id), $('#' + prev.id));
		
		// Swap the values of the input fields
		prevChildren = prev.children[prev.children.length - 1].children;
		nextChildren = next.children[next.children.length - 1].children;
		for(i = 0; i < prevChildren.length; ++i) {
			var prevValue = prevChildren[i];
			var nextValue = nextChildren[i];
			if(prevValue.localName != 'div' || nextValue.localName != 'div')
				break; // should never happen, but just in case
			prevValue = prevValue.firstElementChild.value;	
			nextValue = nextValue.firstElementChild.value;
			prevChildren[i].firstElementChild.value = nextValue;
			nextChildren[i].firstElementChild.value = prevValue;
		}
	},
	
	/*
	 * Swap the basestation label (required if two rows are swapped,
	 * one containing a checkpoint and another containing a basestation).
	 */
	swapBasestationLabel: function(objectWithLabel, objectWithoutLabel) {
		this.removeBasestationLabel(objectWithLabel);
		this.prependBasestationLabel(objectWithoutLabel);
	},
	
	/*
	 * Prepend the basestation label.
	 */
	prependBasestationLabel: function(obj) { 
		obj.prepend($('<div>')
			.attr('class', 'text-right basestation')
			.append($('<span>')
				.attr('class', 'label label-default')
				.text('Basestation')
			)
		);
	},
	
	/*
	 * Remove the basestation label.
	 */
	removeBasestationLabel: function(obj) {
		obj.find('div.basestation').remove()
	},
	
	// RENDERING:
	
	/*
	 * Append an extra row to the form to allow the user 
	 * to define routes of more than one checkpoint
	 */
	appendRow: function() {
		$('#routesAssignment')
			.append($('<div>')
				.attr('class', 'row text-center')
				.append($('<button>')
					.attr('id', 'swap-' + this.count)
					.attr('class', 'btn btn-xs btn-swap')
					.append($('<i>')
						.attr('class', 'fa fa-arrows-v')
					)
				)
			)
			.append($('<div>')
				.attr('class', 'well route-well')
				.attr('id', 'well-' + this.count)
				.append($('<div>')
					.attr('class', 'row')
					.append($('<div>')
						.attr('class', 'col-sm-3')
						.append($('<input>')
							.attr('class', 'longitude form-control')
							.attr('placeholder', 'Longitude')
							.attr('type', 'number')
                            .attr('step', 'any')
						)
					)
					.append($('<div>')
						.attr('class', 'col-sm-3')
						.append($('<input>')
							.attr('class', 'latitude form-control')
							.attr('placeholder', 'Latitude')
							.attr('type', 'number')
                            .attr('step', 'any')
						)
					)
					.append($('<div>')
						.attr('class', 'col-sm-3')
						.append($('<input>')
							.attr('class', 'altitude form-control')
							.attr('placeholder', 'Altitude')
							.attr('type', 'number')
                            .attr('step', 'any')
						)
					)
					.append($('<div>')
						.attr('class', 'col-sm-3')
						.append($('<input>')
							.attr('class', 'waitingTime form-control')
							.attr('placeholder', 'Wait time')
							.attr('type', 'number')
                            .attr('step', 'any')
						)
					)
				)
			);
			var self = this;
			$('#swap-' + this.count).click(function(evt) {
				self.swap(evt);
			});
			this.count = this.count + 1;
	}
});