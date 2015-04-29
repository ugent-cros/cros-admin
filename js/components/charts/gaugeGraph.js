App.GaugeGraphComponent = Ember.Component.extend({
    start : 1,
    x : 0,

	show: function() {
        var data = new RealTimeData(2);

        var chart = $('#gauge')
            .epoch({
                type: 'time.gauge',
                value: 1.0,
                tickOffset: 20
        });
        var self = this;
        this.socketManager.register("batteryPercentageChanged", this.get("drone"), "gaugegraph", function(data) {
            chart.update((data.percent/100));
        });
	}.on('didInsertElement')
});