/**
 * Created by Eveline on 25/03/2015.
 */
App.DronesController = Ember.ObjectController.extend({
    columns : ['#','Name','Status','Actions'],
    getStatusClass: function(){
        if (status == 'AVAILABLE'){
            return 'label-success'
        }
    }.property(status)
});