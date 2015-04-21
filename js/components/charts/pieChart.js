/**
 * Created by Eveline on 21/04/2015.
 */
App.PieChartComponent = Ember.Component.extend({

    draw: function(){
        var pieData = [
            { label: '10%', value: 10 },
            { label: '20%', value: 20 },
            { label: '40%', value: 40 },
            { label: '30%', value: 30 }
        ]
        $('#pie').epoch({
            type: 'pie',
            data: pieData
        });
    }.on('didInsertElement')
});