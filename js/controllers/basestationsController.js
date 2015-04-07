App.BasestationsController = App.ListSuperController.extend({
    columns : ['#','Name','Actions'],
    element : 'basestation',
    searchField : "name"
});