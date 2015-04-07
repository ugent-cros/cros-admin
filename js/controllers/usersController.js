App.UsersController = App.ListSuperController.extend({
    columns : ['#','Name','E-mail','Role','Actions'],
    element : 'user',
    searchField : "firstName"
});