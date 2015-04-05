/**
 * Created by Eveline on 5/04/2015.
 */
App.ListSuperController = Ember.Controller.extend({
    //Actions
    actions: {
        delete: function (id) {
            var el = this.get('element');
            this.customAdapter.remove(el, id);
        },

        getPage: function (search, page, perPage){
            var self = this;
            var element = self.get('element');
            this.customAdapter.find(element, null, null, {name: search, pageSize : perPage, page : (page-1), total: true}).then(function(data){
                self.set('model',data);
                return data;
            });
        }
    }
});