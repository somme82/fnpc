(function() {
  var app = angular.module('slider', ['rzModule', 'ui.bootstrap', 'ngFileUpload']);



  app.controller('SliderController', function($scope, $http, $rootScope, $timeout, $modal, Upload) {
    
      $scope.newUser = "";
      $scope.rebuyUser = $rootScope.selectedUser;
      

      $scope.oldPassword = "";
      $scope.newPassword = "";
      $scope.repeatNewPassword = "";

      $scope.totalValue = 0;
      $scope.cards = 0;
      if ($scope.matchdayResults.hasOwnProperty($scope.getMatchdayIdByIndex($rootScope.currentMatchDay))){
        if ($scope.matchdayResults[$scope.getMatchdayIdByIndex($rootScope.currentMatchDay)].hasOwnProperty($rootScope.selectedUser)){
          $scope.totalValue = parseFloat($scope.matchdayResults[$scope.getMatchdayIdByIndex($rootScope.currentMatchDay)][$rootScope.selectedUser].scores[0].CHIPCOUNT);
         $scope.cards = parseFloat($scope.matchdayResults[$scope.getMatchdayIdByIndex($rootScope.currentMatchDay)][$rootScope.selectedUser].scores[0].NUMBER);
        }
        
      }
      //console.log($scope.matchdayResults[$scope.getMatchdayIdByIndex($rootScope.currentMatchDay)]);
      //console.log($scope.matchdayResults[$scope.getMatchdayIdByIndex($rootScope.currentMatchDay)][$rootScope.selectedUser].scores[0]);

      $scope.redValue = {
        start: 0,
        change: 0,
        end: 0
      };
      $scope.greenValue = {
        start: 0,
        change: 0,
        end: 0
      };
      $scope.blueValue = {
        start: 0,
        change: 0,
        end: 0
      };
      $scope.blackValue = {
        start: 0,
        change: 0,
        end: 0
      };
      $scope.whiteValue = {
        start: 0,
        change: 0,
        end: 0
      };


      $scope.changeTotalValue = function(){
        $scope.totalValue = parseFloat(
          (
          parseFloat($scope.redValue.change) + 
          parseFloat($scope.greenValue.change) + 
          parseFloat($scope.blueValue.change) + 
          parseFloat($scope.blackValue.change) + 
          parseFloat($scope.whiteValue.change)
          )/100);
      }

      $scope.addChips = function(isRebuy) {
        $rootScope.startBlockUi();
        var rebuy = 0;
        if (isRebuy){
          rebuy = 1;
          $rootScope.selectedUser = $scope.rebuyUser;
          chipCount = $scope.rebuyValue;
        } else{
          chipCount = $scope.totalValue;
        }
        // Posting data to php file
        addChipsPost(rebuy, chipCount);
        addCardsPost();
      };
      

      $scope.addUser = function(file, newUser){
        $rootScope.startBlockUi();
        $http({
          method  : 'POST',
          url     : 'ajax/addUser.php',
          data    : {
                      username: newUser
                    },
          headers : {'Content-Type': 'application/x-www-form-urlencoded'} 
         }).success(function(data) {
            if (data.errors) {
            } else {

              $scope.saveProfile(file, newUser);
              $scope.initializeApplication($scope.matchDayVenue, $rootScope.currentMatchDay, true);

              //$scope.$apply();
            }
          });
    }

      function addCardsPost()
      {
        $http({
          method  : 'POST',
          url     : 'ajax/addCardsToMatchday.php',
          data    : {
                      username: $rootScope.selectedUser,
                      cards: $scope.cards,
                      matchdayId: $rootScope.matchdays[$rootScope.currentYear][$rootScope.currentMatchDay].ID
                    },
          headers : {'Content-Type': 'application/x-www-form-urlencoded'} 
         }).success(function(data) {
            if (data.errors) {
            } else {
              var user = $rootScope.selectedUser;
              $scope.initializeApplication(user, $rootScope.currentMatchDay, true);
              //$scope.$apply();
            }
          });
      }
      function addChipsPost(rebuy, chipCount, cards){
        $http({
          method  : 'POST',
          url     : 'ajax/addScoreToMatchday.php',
          data    : {
                      username: $rootScope.selectedUser,
                      chipcount: chipCount,
                      isRebuy: rebuy,
                      matchdayId: $rootScope.matchdays[$rootScope.currentYear][$rootScope.currentMatchDay].ID
                    },
          headers : {'Content-Type': 'application/x-www-form-urlencoded'} 
         }).success(function(data) {
            if (data.errors) {
            } else {
              var user = $rootScope.selectedUser;
              $scope.initializeApplication(user, $rootScope.currentMatchDay, true);

              //$scope.$apply();
            }
          });
      }

    $scope.red = {
      value: 0,
      options: {
        id: 'slider-red',
        floor: 0,
        ceil: 100,
        step: 1,
        getPointerColor: function(value){
          return 'red';
        },
        onChange: function(id, newValue) {
          $scope.redValue.change = newValue * 10;
          $scope.changeTotalValue();
        },
        onEnd: function(id, newValue) {
          $scope.redValue.end = newValue * 10;
        }
      }
    };

   $scope.green = {
      value: 0,
      options: {
        floor: 0,
        ceil: 100,
        step: 1,
        getPointerColor: function(value){
          return 'green';
        },
        onChange: function(id, newValue) {
          $scope.greenValue.change = newValue * 20;
          $scope.changeTotalValue();
        }
      }
    };

    $scope.blue = {
      value: 0,
      options: {
        floor: 0,
        ceil: 100,
        step: 1,
        getPointerColor: function(value){
          return 'blue';
        },
        onChange: function(id, newValue) {
          $scope.blueValue.change = newValue * 50;
          $scope.changeTotalValue();
        }
      }
    };
    $scope.black = {
      value: 0,
      options: {
        floor: 0,
        ceil: 100,
        step: 1,
        getPointerColor: function(value){
          return 'black';
        },
        onChange: function(id, newValue) {
          $scope.blackValue.change = newValue * 100;
          $scope.changeTotalValue();
        }
      }
    };

    $scope.white = {
      value: 0,
      options: {
        floor: 0,
        ceil: 10,
        step: 1,
        showTicks: true,
        getPointerColor: function(value){
          return '#D2CCCC';
        },
        onChange: function(id, newValue) {
          $scope.whiteValue.change = newValue * 1000;
          $scope.changeTotalValue();
        }
      }
    };

    
  });
})();