App.AssignmentsController = App.ListSuperController.extend({
    columns : ['#','Priority','Creator','Drone','Actions'],
    element : "assignment",
    searchFields : ["creator","drone"]
});