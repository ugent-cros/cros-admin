App.MyMapComponent = Ember.Component.extend({
	didInsertElement : function(){
        var self = this;
        //Ember.run.next(function(){
            var map = L.map(self.mapName).setView([51.505, -0.09], 13);
			
			L.tileLayer('http://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
				maxZoom: 18
			}).addTo(map);
        //});
    }
});