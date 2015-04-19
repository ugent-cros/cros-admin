/**
 * Created by matthias on 3/04/2015.
 */

App.BasestationController = Ember.Controller.extend({

    basestationLocation : function() {
        var loc = this.get('model').location;
        return [loc.latitude, loc.longitude];
    }.property('model')

});