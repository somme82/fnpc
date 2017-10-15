(function() {
  function byId(id) {
    return document.getElementById(id);
  }

  function formatTens(n) {
    return (n < 10) ? '0'+n : ''+n;
  }
  
  for (var key in countdown) {
    if (countdown.hasOwnProperty(key)) {
      var unit = byId('units-'+key.toLowerCase());
      if (unit) {
        unit.value = countdown[key];
        unit.checked = countdown[key] & countdown.DEFAULTS;
      }
    }
  }

  function update() {
    var units = ~countdown.ALL,
      chx = byId('units').getElementsByTagName('input')

    for (var i=0, count=chx.length; i<count; i++) {
      if (chx[i].checked) {
        units |= +(chx[i].value);
      }
    }

    var start = new Date(2016, 6, 15, 9, 0, 0, 0),
        ts = countdown(start, null, units, 11, 0);
    var counter = byId('counter');
    var msg = ts.toHTML('strong');
    counter.innerHTML = msg;

    requestAnimationFrame(update, timespan.parentNode);
  }
  update();
})();