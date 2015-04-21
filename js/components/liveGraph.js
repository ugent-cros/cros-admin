App.LiveGraphComponent = Ember.Component.extend({
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
        window.setInterval(function() {
            var x = self.get('x')+0.1;
            if(x >= 1.0){//reset
                self.set('x', 0);
            }else {
                self.set('x', x);
            }
            var y = self.get('start')-x;

            chart.update(y);
        }, 1000)
	}.on('didInsertElement')
});