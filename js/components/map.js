App.MyMapComponent = Ember.Component.extend({
	marker : null,
    map : null,

    updateMarker : function() {
        var loc = this.get('location');
        this.get('marker').setLatLng(loc);
    }.observes('location'),

    updateMap : function() {
        var loc = this.get('location');
        this.get('map').setView(loc);
    }.observes('location'),

    didInsertElement : function(){
        var self = this;
        var map = L.map(self.mapName).setView(this.get('location'), 13);

        L.tileLayer('http://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery � <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 18
        }).addTo(map);

        this.set('map',map);

        var customIcon = L.icon({
            iconUrl: 'img/marker-icon.png',
            shadowUrl: 'img/marker-shadow.png',

            iconSize:     [25, 41], // size of the icon
            shadowSize:   [41, 41], // size of the shadow
            iconAnchor:   [12, 41], // point of the icon which will correspond to marker's location
            shadowAnchor: [12, 41],  // the same for the shadow
            popupAnchor:  [0, -41] // point from which the popup should open relative to the iconAnchor
        });

        var marker = L.marker(this.get('location'), {icon: customIcon}).addTo(map);
        marker.bindPopup("<b>Hello world!</b><br>I am a popup.");
        this.set('marker',marker);

        // TODO: fix ugly hack
        setTimeout(function() {
           map.invalidateSize();
        }, 500);
    }
});