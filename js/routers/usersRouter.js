/**
 * Created by matthias on 11/04/2015.
 */

App.UsersRoute = App.AuthRoute.extend({
    model: function() {
        /*return this.fetch({store:'user', options : {pageSize : 2, page : 0, total:true}, callback: function(data) {
            return data;
        }});*/
    }
});

App.UserRoute = App.PopupRoute.extend({
    model: function(params) {
        return this.fetch({store:'user', id: params.user_id });
    },
    renderTemplate: function() {
        this._super('user', 'users');
    }
});

App.UserEditRoute = App.PopupRoute.extend({
    model: function(params) {
        if(params.user_id)
            return this.fetch({store:'user', id: params.user_id });
        else
            return new Object();
    },
    renderTemplate: function() {
        this._super('user-edit', 'users');
    }
});

App.UsersAddRoute = App.UserEditRoute.extend({
    controllerName: 'user-edit'
});