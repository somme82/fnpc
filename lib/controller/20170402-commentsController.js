(function() {
  var app = angular.module('comments', ['chart.js']);
  app.controller('CommentsController', function($scope, $http, $rootScope, $timeout, $modal, Upload) {    
    
    
  console.log("COMMENTS");
  $scope.commentText = "";

  $scope.getComments = function(){ 
      $http({
        method: 'GET',
        url: 'ajax/getComments.php?matchdayId=' + $rootScope.currentMatchDay,
      }).then(function successCallback(response) {
        $scope.comments = response.data;   
      });
      
    };

  $scope.SaveComment = function(){
        $rootScope.startBlockUi();
        $http({
            method  : 'POST',
            url     : 'ajax/saveComment.php',
            data    : { 
                        articleText: $scope.commentText,
                        matchdayid: $rootScope.currentMatchDay,
                        user: $rootScope.loggedInUser.username
                      },
            headers : {'Content-Type': 'application/x-www-form-urlencoded'} 
           }).success(function(data) {
              $scope.getComments();
              if (data.errors) {
              } else {
                $.unblockUI();
              }
            });
    }



    $scope.getComments();

    
    

  });

})();