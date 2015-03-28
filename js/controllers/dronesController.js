/**
 * Created by Eveline on 25/03/2015.
 */
App.DronesController = Ember.Controller.extend({
    columns : ['#','Name','Status','Actions'],
    getStatusClass: function(){
        if (status == 'AVAILABLE'){
            return 'label-success'
        }
    }.property(status),

    actions: {
        delete: function (id) {
            console.log("deleting: " + id);
            this.customAdapter.remove("drones", id);
            //TODO: refresh page or refresh table
        }
    }
});