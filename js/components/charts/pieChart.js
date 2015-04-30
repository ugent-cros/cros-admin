/**
 * Created by Eveline on 21/04/2015.
 */
App.PieChartComponent = Ember.Component.extend({

    chart: undefined,

    draw: function(){
        var pieData = [];
        var statuses = this.get('data');
        for(var key in statuses){
            pieData.push({label: '', value: statuses[key]});
        }
        $('#pie').epoch({
            type: 'pie',
            data: pieData
        });
        var self = this;
        this.socketManager.register("droneStatusChanged", this.get("drone"), "gaugegraph", function(data) {
            var status = data.newStatus;
            var old = data.oldStatus;
            var statuses = self.get('data');
            statuses[status] = statuses[status] + 1;
            statuses[old] = statuses[old] - 1;
            self.set('data', statuses);
            self.update();
        });
    }.on('didInsertElement'),

    update: function(){
        console.log("update pie");
        var pieData = [];
        var statuses = this.get('data');
        for(var key in statuses){
            pieData.push({label: '', value: statuses[key]});
        }
        var chart = this.get('chart');
        console.log(pieData);
        chart.update(pieData);
    }.observes('data')
});