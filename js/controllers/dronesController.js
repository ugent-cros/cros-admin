/**
 * Created by Eveline on 25/03/2015.
 */
App.DronesController = Ember.Controller.extend({
    columns : ['#','Name','Status','Actions'],

    //Actions
    actions: {
        delete: function (id) {
            this.customAdapter.remove("drone", id);
        },

        getPage: function (search, page, perPage){
            console.log(search);
            var self = this;
            this.customAdapter.find('drone', null, null, {name: search, pageSize : perPage, page : (page-1), total: true}).then(function(data){
                self.set('model',data);
                return data;
            });
        }
    }
});