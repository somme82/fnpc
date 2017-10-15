(function() {
  var app = angular.module('stats', ['chart.js']);
  app.controller('StatsController', function($scope, $http, $rootScope, $timeout, $modal, Upload) {    
    
    var matchdays = [];
    var players = [];
    $scope.colors = [];


    for(var score in $scope.totalScore)
    {
      if (!$scope.totalScore[score].ignoreOnTotalScore){
        players.push($scope.totalScore[score].player);
      }
    }
    console.log(players);
    var totalResults = {};
    for(var score in $scope.totalScore){
      if (!$scope.totalScore[score].ignoreOnTotalScore){
        totalResults[$scope.totalScore[score].player] = [];
      }
    }
    //console.log(totalResults);
    for(var matchday in $rootScope.matchdays[$rootScope.currentYear]){
      matchdays.push("#" + matchday);
      var results = $scope.setTotalScore($scope.setScoreDictionary(matchday));
      //console.log(results);
      for(var result in results){
        if (totalResults.hasOwnProperty(results[result].player)){
          totalResults[results[result].player].push(results[result].realRank);
        }
      }
      
    }
    console.log(totalResults);
    $scope.data = []
    for (var totalresult in totalResults){
      $scope.data.push(totalResults[totalresult]);
    }

    $scope.labels = matchdays;
    $scope.series = players;
    

  });

})();