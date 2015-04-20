App.LiveGraphComponent = Ember.Component.extend({
	show: function() {

  var data = new RealTimeData(2);

   var chart = $('#lineChart')
   .epoch({
        type: 'time.gauge',
		value: 0.5,
		tickOffset: 20
    });
    window.setInterval(function() { var x = Math.random(); console.log(x); chart.update(x); }, 1000);
	}.on('didInsertElement'),
});