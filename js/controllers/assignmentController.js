/**
 * Created by matthias on 4/04/2015.
 */

/**
 * Created by matthias on 3/04/2015.
 */

App.AssignmentController = Ember.Controller.extend({

    checkpointLocations : function() {
        var route = this.get('model').route;
        var result = [];
        $.each(route, function(index,data) {
            result.push([data.location.latitude,data.location.longitude]);
        });
        return result;
    }.property('model')

});