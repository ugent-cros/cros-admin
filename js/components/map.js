App.MyMapComponent = Ember.Component.extend({
    layoutName : 'components/my-map',

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
    centered : true,

    currentIcon : function() {
        var i = this.get('icon');
        if (!i) {
            i = this.get('defaultIcon');
        }
        return i;
    },

    createMarker : function(location, i) {
        return L.marker(location, {id: i, icon: this.currentIcon()}).addTo(this.get('map'));
    },

    updateMarker : function() {
        var loc = this.get('location');
        var markers = this.get('marker') || [];
        var map = this.get("map");
        var self = this;

        if (!loc) {
            // remove existing markers
            $.each(markers, function(index,data) {
                map.removeLayer(data);
            });
            this.set('marker', []);
        } else if(loc instanceof Array) {
            // multiple locations
            if (markers.length <= loc.length) {
                $.each(markers, function(index,m) { // update location of allready existing markers
                    m.setLatLng(loc[index]);
                });
                $.each(loc.slice(markers.length,loc.length), function(index,data) { // add new markers
                    markers.push(self.createMarker(data, index));
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
                this.set('marker', [self.createMarker(loc, 0)]);
            } else { // multiple markers
                this.set('marker', markers.splice(0,1)); // only keep the first marker
                $.each(markers, function(index,data) {
                    self.get('map').removeLayer(data);
                });
                this.get('marker')[0].setLatLng(loc);
            }
        }
    },

    updateMap : function(updateZoom) {
        if (!this.get("centered"))
            return;

        var loc = this.get('location');
        var map = this.get('map');
        updateZoom = typeof(updateZoom) === "boolean" ? updateZoom : false;

        if (map) {
            var zoomLevel = updateZoom || typeof(map.getZoom()) !== "number" ? 13 : map.getZoom();
            if (! loc)
                map.fitBounds([{lat:51.051045, lon:3.706872},
                    {lat:51.020118,lon:3.740603}], {padding:[50,50]});
            else if (loc instanceof Array)
                map.fitBounds(loc, {padding:[50,50]});
            else
                map.setView(loc,zoomLevel);
        }
    },

    initialization : function(){
        this._super();
        var self = this;

        // init map
        var map = L.map(self.mapName);
        var control = L.control.center({centered : this.get("centered"), update : function(value) {
            self.set("centered", value);
            if (value)
                self.updateMap(true);
        }});
        map.on('dragstart', function(e) {
            self.set("centered", false);
            control.setCenter(false);
        });
        control.addTo(map);

        self.set('map',map);
        self.updateMap();

        L.tileLayer('http://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery � <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 18
        }).addTo(map);

        // init markers
        self.updateMarker();

        self.addObserver('location.@each.lon',self,self.updateMarker);
        self.addObserver('location.@each.lat',self,self.updateMarker);
        self.addObserver('location.@each.lon',self,self.updateMap);
        self.addObserver('location.@each.lat',self,self.updateMap);
    },

    didInsertElement : function() {
        this._super();

        this.initialization();
    }

});

L.Control.Center = L.Control.extend({
    options: {
        position: 'bottomleft'
    },

    controlUI : undefined,

    setCenter : function(value) {
        this.options.centered = typeof(value) === "undefined" ? !this.options.centered : value;
        this.options.update(this.options.centered);
        this.controlUI.className = 'leaflet-control-center-interior' + (this.options.centered ? " leaflet-control-center-active" : "");
    },

    onAdd: function (map) {
        var self = this;
        var controlDiv = L.DomUtil.create('div', 'leaflet-control-center');
        this.controlUI = L.DomUtil.create('div', 'leaflet-control-center-interior' + (this.options.centered ? " leaflet-control-center-active" : ""), controlDiv);
        L.DomUtil.create('i', 'fa fa-location-arrow fa-2x',this.controlUI);

        L.DomEvent
            .addListener(controlDiv, 'click', L.DomEvent.stopPropagation)
            .addListener(controlDiv, 'click', L.DomEvent.preventDefault)
            .addListener(controlDiv, 'click', function () {
                self.setCenter();
            });

        this.controlUI.title = 'Map Commands';
        return controlDiv;
    }
});

L.control.center = function(options) {
    return new L.Control.Center(options);
}
