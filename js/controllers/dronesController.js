/**
 * Created by Eveline on 25/03/2015.
 */
App.DronesController = App.ListSuperController.extend({
    columns : ['#','Name','Status','Actions'],
    element : "drone",
    searchField : "name"
});