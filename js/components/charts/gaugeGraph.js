App.GaugeGraphComponent = Ember.Component.extend({
    start : 1,
    x : 0,

    previousTime : undefined,
    previousValue : undefined,

	show: function() {
        var chart = $('#gauge')
            .epoch({
                type: 'time.gauge',
                value: 0.0,
                tickOffset: 20,
                domain: [0,10]
        });
        var self = this;
        this.socketManager.register("locationChanged", this.get("drone"), "gaugegraph", function(data) {
            var timestamp = Date.now() / 1000 | 0;
            var previousValue = self.get('previousValue');
            var previousTime = self.get('previousTime');
            if(self.get('previousTime') && self.get('previousValue')){
                var x = self.calculateDistance(data.longitude, data.latitude, previousValue.longitude, previousValue.latitude);
                var t = (timestamp - previousTime)/1000;
                var s = 0;
                if(t) {
                    s = x / t;
                }
                chart.update(s);
            }else{
                self.set('previousTime', timestamp);
                self.set('previousValue', data);
            }
        });
	}.on('didInsertElement'),

    calculateDistance: function(lon1, lat1, lon2, lat2){
        var R = 6371000; // metres
        var phi1 = this.toRadians(lat1);
        var phi2 = this.toRadians(lat2);
        var deltaPhi = this.toRadians(lat2-lat1);
        var deltaLambda = this.toRadians(lon2-lon1);

        var a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        var d = R * c;
        return d;
    },

    toRadians : function(deg) {
        return deg * (Math.PI/180)
    }
});