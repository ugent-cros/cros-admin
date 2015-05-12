/**
 * This will create a new gauge graph component
 * @class GaugeGraphComponent
 * @constructor
 * @extends Component
 */
App.GaugeGraphComponent = Ember.Component.extend({

    /**
     * This function draws the piechart
     *
     * @method
     */
	draw: function() {
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
            var s = Math.sqrt(Math.pow(x,2) + Math.pow(y,2));
            var value = Math.min(s,30);
            chart.update(value);
        });
	}.on('didInsertElement')
});