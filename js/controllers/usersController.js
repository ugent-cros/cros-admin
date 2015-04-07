App.UsersController = App.ListSuperController.extend({
    columns : ['#','Name','E-mail','Role','Actions'],
    element : 'user',
    searchFields : ["firstName", "lastName"]
});