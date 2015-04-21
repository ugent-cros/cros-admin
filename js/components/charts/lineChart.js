/**
 * Created by Eveline on 21/04/2015.
 */
App.LineGraphComponent = Ember.Component.extend({

    draw: function(){
        var data = [{ label: 'A', values: [] }];
        var chart = $('#lineChart').epoch({
            type: 'time.line',
            data: data,
            className : "category10",
            axes: ['right', 'bottom']
        });
        this.set('chart',chart);

        this.socketManager.register("altitudeChanged", this.get("drone"), "drone", function(data) {
            var entry = [];
            var timestamp = Date.now() / 1000 | 0;
            entry.push({ time: timestamp, y: data.altitude.toFixed(2) });
            //console.log('DATA: ' + timestamp + " " + data.altitude.toFixed(2));
            chart.push(entry);
        });
    }.on('didInsertElement')

});

