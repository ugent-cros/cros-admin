App.MyMapComponent = Ember.Component.extend({
	marker : null,
    map : null,
    defaultIcon : L.icon({
        iconUrl: 'img/marker-icon.png',
        shadowUrl: 'img/marker-shadow.png',

        iconSize:     [25, 41], // size of the icon
        shadowSize:   [41, 41], // size of the shadow
        iconAnchor:   [12, 41], // point of the icon which will correspond to marker's location
        shadowAnchor: [12, 41],  // the same for the shadow
        popupAnchor:  [0, -41] // point from which the popup should open relative to the iconAnchor
    }),

    currentIcon : function() {
        var i = this.get('icon');
        if (!i) {
            i = this.get('defaultIcon');
        }
        return i;
    },

    updateMarker : function() {
        var loc = this.get('location');
        var markers = this.get('marker');
        if (!markers)
            return;

        if (!loc) {
            // remove existing markers
            $.each(markers, function(index,data) {
                this.get('map').removeLayer(data);
            });
            this.set('marker', []);
        } else if(loc[0] instanceof Array) {
            // multiple locations
            if (markers.length < loc.length) {
                $.each(markers, function(index,data) { // update location of allready existing markers
                    data.setLatLng(loc[index]);
                });
                $.each(loc.slice(markers.length,loc.length), function(index,data) { // add new markers
                    var marker = L.marker(data, {icon: this.currentIcon()}).addTo(this.get('map'));
                    markers.push(marker);
                });
                this.set('marker', markers);
            } else {
                this.set('marker', markers.splice(0,markers.length-loc.length)); // only keep several markers
                var map = this.get('map');
                $.each(markers, function(index,data) { // remove other markers
                    map.removeLayer(data);
                });
                $.each(this.get('marker'), function(index,data) { // update location of remaining markers
                    data.setLatLng(loc[index]);
                });
            }
        } else {
            // only one location
            if (markers.length < 1) {  // no markers
                var marker = L.marker(loc, {icon: this.currentIcon()}).addTo(this.get('map'));
                this.set('marker', [marker]);
            } else { // multiple markers
                this.set('marker', markers.splice(0,1)); // only keep the first marker
                $.each(markers, function(index,data) {
                    this.get('map').removeLayer(data);
                });
                this.get('marker')[0].setLatLng(loc);
            }
        }
    },

    updateMap : function() {
        var loc = this.get('location');
        var map = this.get('map');
        if (map)
            if (! loc)
                map.setView([0,0],1);
            else if (loc[0] instanceof Array)
                map.fitBounds(loc, {padding:[50,50]});
            else
                map.setView(loc, 13);
    },

    didInsertElement : function(){
        this._super();

        var self = this;

        $('.modal').on('shown.bs.modal', function (e) {

            // init map
            var map = L.map(self.mapName);
            self.set('map',map);
            self.updateMap();

            L.tileLayer('http://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery � <a href="http://mapbox.com">Mapbox</a>',
                maxZoom: 18
            }).addTo(map);

            // init markers
            var loc = self.get('location');
            if (!loc) {
                self.set('marker', []);
            } else if (loc[0] instanceof Array) {
                var markerArray = [];
                var iconToUse = self.currentIcon();
                $.each(loc, function() {
                    var marker = L.marker(this, {icon: iconToUse}).addTo(map);
                    markerArray.push(marker);
                });
                self.set('marker',markerArray);
            } else {
                var marker = L.marker(loc, {icon: self.currentIcon()}).addTo(map);
                self.set('marker',[marker]);
            }

            self.addObserver('location',self,self.updateMarker);
            self.addObserver('location',self,self.updateMap);
            // TODO: fix ugly hack
            /*setTimeout(function() {
                map.invalidateSize();
                self.updateMap();
            }, 500);*/

        })
    }
});