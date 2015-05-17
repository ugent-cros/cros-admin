/**
 * @module cros-admin
 * @submodule components
 */

/**
 * This will create a new pie chart component
 * @class LineGraphComponent
 * @namespace App
 * @constructor
 * @extends Component
 */
App.PieChartComponent = Ember.Component.extend({
    /**
     * @property statuses
     * @property statuses.<NAME> - one for each state a drone can have
     * @property statuses.<NAME>.value - number of drone in that state
     * @property statuses.<NAME>.label - css style for corresponding label color
     */
    statuses :{ INACTIVE: { value: 0, label: 'label-inactive' }, FLYING: { value: 0, label: 'label-inflight' },
				AVAILABLE: { value: 0, label: 'label-available' }, CHARGING: { value: 0, label: 'label-charging' }, 
				MANUAL_CONTROL: { value: 0, label: 'label-manual' }, EMERGENCY: { value: 0, label: 'label-emergency' },
				ERROR: { value: 0 , label: 'label-error' }, UNREACHABLE: { value: 0, label: 'label-unreachable' }, 
				UNKNOWN: { value: 0, label: 'label-unknown' } },

    /**
     * Total number of elements shown in the chart
     *
     * @property total
     */
    total : 0,

    /**
     * The chart object
     *
     * @property chart
     */
    chart: undefined,

    /**
     * Boolean to know if the chart is registered as listener or not
     *
     * @property {Boolean} registered
     */
	registered: false,

    /**
     * This function draws the piechart
     *
     * @method
     */
    draw: function() {	
		var self = this;
		this.adapter.find("drone", null, null).then(function(data) {
			self.set('total', data.resource.length);
			if(self.get('total') != 0) {
				var statuses = self.get('statuses');
				$.each(statuses, function(s) { 
					statuses[s].value = 0
				});
				$.each(data.resource,function(i,d) {
					var status = d.status;
					statuses[status].value = statuses[status].value + 1;
				});
				var legend = [];
				$.each(statuses, function(s) { 
					if(statuses[s].value !== 0) 
						legend.push({ text: s, label: statuses[s].label});
				});
				self.set('legend', legend);
                self.set('statuses', statuses);
				var pieData = [];
				for(var key in statuses){
					var l = statuses[key].value !== 0 ? statuses[key].value + '' :  '';
					pieData.push({label: l, value: statuses[key].value});
				}
				$('#pie').epoch({
					type: 'pie',
					data: pieData
				});
				self.socketManager.register("droneStatusChanged", 0, "piechart", function(data) {
					var status = data.newStatus;
					var old = data.oldStatus;
					var statuses = self.get('statuses');
					statuses[status].value = statuses[status].value + 1;
					statuses[old].value = statuses[old].value - 1;
					self.set('statuses', statuses);
				});
				self.set('registered', true);
			}
		});
    }.on('didInsertElement').observes('showChart'),

    /**
     * This function will unregister the piechart for droneStatusChanged messages
     *
     * @method
     */
    unregister: function(){
		if(this.get('registered')) {
			this.socketManager.unregister("droneStatusChanged", 0, "piechart");
			this.set('registered', false);
		}
    }.on('willDestroyElement'),


    /**
     * Function to determine if the chart have to be shown or not
     *
     * @method
     * @return {Boolean} True if total is not 0
     */
	showChart: function() {
		return this.get('total') !== 0;
	}.property('total'),

    /**
     * Function to update the pie chart with the new data
     *
     * @method
     */
    update: function() {
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