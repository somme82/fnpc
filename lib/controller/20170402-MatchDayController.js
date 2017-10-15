(function() {
  var app = angular.module('matchday', ['ui.bootstrap']);

  matchDayArticleText = "muha";
  app.controller('MatchDayController', function($scope, $http, $rootScope, $timeout, $modal, Upload) {

      $scope.matchdaysDesc = sortObjectByDate($rootScope.matchdays[$rootScope.currentYear]);

      $scope.getMatchDayWins = function(){
        $scope.matchDayWins = {};
        for(var matchday in $rootScope.matchdays[$rootScope.currentYear]){
          console.log("getMatchDayWins");
          $scope.getScoreOfMatchday(matchday, "");

          if ($scope.scoreOfMatchday.length > 0)
          {
            if ($scope.matchDayWins.hasOwnProperty($scope.scoreOfMatchday[0].username)){
              $scope.matchDayWins[$scope.scoreOfMatchday[0].username] += 1
            }else {
              $scope.matchDayWins[$scope.scoreOfMatchday[0].username] = 1;
            }
          }
        }
      }

      //$scope.getMatchDayWins();

      $scope.goToMatchday = function(matchdayId){
        $rootScope.currentMatchDay = parseInt($scope.getMatchdayIndexById(matchdayId));
        window.location = "/#/matchday";
      }

      $scope.saveArticle = function(){
        var editors = textboxio.get('#textbox');
        var editor = editors[0];
        var articleText = editor.content.get();
        $rootScope.startBlockUi();
        $http({
            method  : 'POST',
            url     : 'ajax/saveArticle.php',
            data    : { 
                        articleText: articleText,
                        matchdayid: $rootScope.matchdays[$rootScope.currentYear][$rootScope.currentMatchDay].ID,
                        matchdayIndex: parseInt($scope.getMatchdayIndexById($rootScope.matchdays[$rootScope.currentYear][$rootScope.currentMatchDay].ID)),
                        user: $scope.scoreOfMatchday[0].username
                      },
            headers : {'Content-Type': 'application/x-www-form-urlencoded'} 
           }).success(function(data) {
              console.log(data);
              if (data.errors) {
              } else {
                $.unblockUI();
                $scope.initializeApplication($rootScope.selectedUser, $rootScope.currentMatchDay, true);
              }
            });
    }



    function sortObjectByDate(obj) {
        var arr = [];
        var prop;
        for (prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                arr.push({
                    'key': obj[prop].ID,
                    'date': Date.parse(obj[prop].DATE)
                });
            }
        }
        arr.sort(function(a, b) {
            return b.date - a.date;
        });
        return arr;
    }


  });

})();