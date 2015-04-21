/**
 * Created by Eveline on 21/04/2015.
 */
App.PieChartComponent = Ember.Component.extend({

    draw: function(){
        var pieData = [
            { label: 'Unavailable', value: 10 },
            { label: 'In flight', value: 20 },
            { label: 'Available', value: 40 },
            { label: 'Charging', value: 30 }
        ]
        $('#pie').epoch({
            type: 'pie',
            data: pieData
        });
    }.on('didInsertElement')
});