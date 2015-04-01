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

    //Paging
    privateTotalElements: 0,

    totalElements: function() {
        this.fetchTotalElements();
        return this.get("privateTotalElements");
    }.property('privateTotalElements'),

    fetchTotalElements: function() {
        var self = this;
        this.customAdapter.find("drone", null, "total").then(function(data){
            self.set("privateTotalElements", data.total);
        });
    },

    //Actions
    actions: {
        delete: function (id) {
            this.customAdapter.remove("drone", id);
        },

        getPage: function (page, perPage){
            var self = this;
            this.customAdapter.find('drone', null, null, {pageSize : perPage, page : (page-1)}).then(function(data){
                self.set('model',data.resource);
                return data.resource;
            });
        }
    }
});