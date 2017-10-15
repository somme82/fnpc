(function() {
  var app = angular.module('logIn', []);



  app.controller('LogInController', function($scope, $http, $rootScope, $q) {
    
    $scope.logIn = function(username, password, $location){

      $http({
          method  : 'POST',
          url     : 'ajax/loginuser.php',
          data    : {
                      username: username,
                      password: password
                    },
          headers : {'Content-Type': 'application/x-www-form-urlencoded'} 
         }).success(function(data) {
            console.log(data);
            if (data == "invalidpassword") {
              alert("Das angegebene Passwort ist falsch");
            } else if (data == "nouserfound"){
              alert("Der angegebene Benutzer existiert  nicht");
            } else{
              $rootScope.loggedInUser.loggedIn = true;
              $rootScope.loggedInUser.admin = data[0].ADMIN == "1";
              window.location = "/#/totalscore";
            }
      });
    }
   
  });
})();