/**
 * @module cros-admin
 * @submodule components
 */

/**
 * This component will display maps using openstreetmaps.
 * It is possbile to display markers with specific icons on it.
 * It uses leaflet.js for the map functionality.
 *
 * @class MyMapComponent
 * @namespace App
 * @constructor
 * @extends Ember.Component
 */
App.MyMapComponent = Ember.Component.extend({
    layoutName : 'components/my-map',

    /**
     * This object is either an array of Leaflet icons or just one.
     * It contains all markers that should be displayed on the map.
     *
     * @protected
     * @property marker {Object|Array}
     */
    marker : null,
    /**
     * This object is the leaflet map.
     *
     * @protected
     * @property map {L.Map}
     */
    map : null,
    /**
     * This is the default icon for a marker
     *
     * @protected
     * @property defaultIcon {L.Icon}
     */
    defaultIcon : L.icon({
        iconUrl: 'img/marker-icon.png',
        shadowUrl: 'img/marker-shadow.png',

        iconSize:     [25, 41], // size of the icon
        shadowSize:   [41, 41], // size of the shadow
        iconAnchor:   [12, 41], // point of the icon which will correspond to marker's location
        shadowAnchor: [12, 41],  // the same for the shadow
        popupAnchor:  [0, -41] // point from which the popup should open relative to the iconAnchor
    }),
    /**
     * Whether the map should be centered on the markers.
     *
     * @public
     * @property centered {boolean}
     */
    centered : true,

    /**
     * This method will return the icon used for markers. If an icon has been set, this will be returned.
     * If no icon has been set, the {{#crossLink "MyMapComponent/defaultIcon:property"}}{{/crossLink}} will be used.
     *
     * @public
     * @method currentIcon
     * @returns {L.Icon}
     */
    currentIcon : function() {
        var i = this.get('icon');
        if (!i) {
            i = this.get('defaultIcon');
        }
        return i;
    },

    /**
     * This function will create a new marker object.
     *
     * @protected
     * @method createMarker
     * @param location The gps location of this marker.
     * @param i A unique id to identify this marker.
     * @returns {L.Marker} The new marker
     */
    createMarker : function(location, i) {
        return L.marker(location, {id: i, icon: this.currentIcon()}).addTo(this.get('map'));
    },

    /**
     * This function will update all current markers. This will be done based on the current Locations available.
     * If new locations are added, new markers will be created.
     * If locations are removed, markers will also be removed.
     * Locations that were changed, will result in updated marker locations.
     *
     * @protected
     * @method updateMarker
     */
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

    /**
     * This function will update the viewpoint of the map. This can be done according to all available markers.
     *
     * @protected
     * @method updateMap
     * @param updateZoom whether to update the zoomlevel of the map
     */
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

    /**
     * This function will initialize the map and it's markers.
     *
     * @protected
     * @method initialization
     */
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

        // Set up listeners for changes
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

/**
 * This class represents the button on a map to center on the current markers.
 *
 * @class Center
 * @namespace Control
 * @constructor
 * @extends L.Control
 */
L.Control.Center = L.Control.extend({
    options: {
        position: 'bottomleft'
    },

    /**
     * This is the html element which contains the button.
     *
     * @private
     * @property controlUI {html}
     */
    controlUI : undefined,

    /**
     * This sets whether or not the map should be centering on the markers.
     *
     * @public
     * @method setCenter
     * @param value boolean value whether or not to center.
     */
    setCenter : function(value) {
        this.options.centered = typeof(value) === "undefined" ? !this.options.centered : value;
        this.options.update(this.options.centered);
        this.controlUI.className = 'leaflet-control-center-interior' + (this.options.centered ? " leaflet-control-center-active" : "");
    },

    /**
     * This method will initiate the functionality to set the centering.
     *
     * @public
     * @method onAdd
     * @param map The current map
     * @returns {div} The html element which contains the button
     */
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
