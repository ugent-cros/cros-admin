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
                domain: [0,30]
        });
        var self = this;
        this.socketManager.register("speedChanged", this.get("drone"), "gaugegraph", function(data) {
            var x = data.speedX;
            var y = data.speedY;
            var s = Math.sqrt(Math.pow(x,2) + Math.pow(y,2));
            var value = Math.min(s,30);
            chart.update(value);
        });
	}.on('didInsertElement')
});