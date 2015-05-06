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
                tickOffset: 15,
                domain: [0,10]
        });
        var self = this;
        this.socketManager.register("speedChanged", this.get("drone"), "gaugegraph", function(data) {
            var x = data.speedX;
            var y = data.speedY;
			console.log("Speed: " + x + " " + y);
            var s = Math.sqrt(Math.pow(x,2) + Math.pow(y,2));
            var value = Math.min(s,30);
            chart.update(value);
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