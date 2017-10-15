(function() {
  var app = angular.module('countdown', []);
  app.controller('countdownController', function($scope, $http, $rootScope) {

    
    for (var key in countdown) {
      if (countdown.hasOwnProperty(key)) {
        var unit = byId('units-'+key.toLowerCase());
        if (unit) {
          unit.value = countdown[key];
          unit.checked = countdown[key] & countdown.DEFAULTS;
        }
      }
    }

    function byId(id) {
      return document.getElementById(id);
    }

    function formatTens(n) {
      return (n < 10) ? '0'+n : ''+n;
    }
    
    function update() {
      var units = ~countdown.ALL,
        chx = byId('units').getElementsByTagName('input')

      for (var i=0, count=chx.length; i<count; i++) {
        if (chx[i].checked) {
          units |= +(chx[i].value);
        }
      }
      countdown.setLabels(
        ' Millisekunde| Sekunde| Minute| Stunde| Tag| Woche| Monat| Jahr| década| século| milênio',
        ' Millisekunden| Sekunden| Minuten| Stunden| Tage| Wochen| Monate| Jahre| décadas| séculos| milênios',
        ' <div> ',
        ' <div> ',
        'agora');
      
      ts = countdown($scope.deadline, null, units, 11, 0);
      var counter = byId('counter');
      var msg = ts.toHTML('strong');
      counter.innerHTML = msg;

      requestAnimationFrame(update, timespan.parentNode);
    }
    update();
  });






})();