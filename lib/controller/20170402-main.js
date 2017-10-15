(function() {
  var participanceBarrier = 3;
  function debug(content){
    var debug = false;
    if(debug){
      console.log(content);
    }
  }

  var totalPages = 4;
  var app = angular.module('Poker', [
    'ngRoute',
    'mobile-angular-ui',
    'mobile-angular-ui.gestures',
    'ngResource',
    'stats',
    'comments',
    'ngStorage',
    'countdown',
    'slider',
    'matchday',
    'logIn',
    'ngSanitize'
    ]);

  var navigation = {};
  navigation[1] = "";
  navigation[2] = "matchday";
  navigation[3] = "totalscore";
  navigation[4] = "administration";
  navigation[5] = "test";
  



  app.controller('MainController', function($scope, $http, $rootScope, $q, Upload, $localStorage) {

    var now = new Date();
    $rootScope.deadline = new Date(2017,5,30,9);
    $rootScope.showCountdown = now < $rootScope.deadline;

    $rootScope.initializeLoggedInUser = function(){
      $rootScope.loggedInUser = {
        username: "",
        password: "",
        loggedIn: false,
        admin: false
      }
    }    

    $rootScope.initializeLoggedInUser();



    $rootScope.startBlockUi = function(){
      if ($('.blockOverlay').length == 0){
        $.blockUI({ message: '<img src="./styles/images/wait.gif" width="40px;" />' });
      }
    }

    $scope.doesFileExist = function(username)
    {
      $http({
          method: 'GET',
          url: 'ajax/checkFileExists.php?username=' + username.toLowerCase()
        }).then(function successCallback(response) {
          if (response.data.fileExists != 1){
            $rootScope.allUser[username].avatar = '../uploads/avatar/empty.jpg';
          }
        });
    }

    $scope.changePage = function(page){
      if (navigation.hasOwnProperty($scope.page))
      {
        var target = navigation[page];
        window.location = "#/" + target;
      } else{
        window.location.replace("#/home"); 
      }
    };

    $scope.previous = function($event){
      //stopActions($event);
      if ($scope.page > 1){
        $scope.page -= 1;
      } else {
        $scope.page = Object.keys(navigation).length;
      }
      $scope.changePage($scope.page);
    };

    $scope.next = function($event){
      if ($scope.page < Object.keys(navigation).length){
        $scope.page += 1;
      } else {
        $scope.page = 1;
      }
      $scope.changePage($scope.page);
    };

    $scope.getAllUser = function(user, matchday, loadFromDatabase){ 
        if (loadFromDatabase){
          $rootScope.$storage.initialized = true;
        }
        $rootScope.allUser = {};
        debug("### FIRST STEP OF INIZIALIZATION");
        if(loadFromDatabase){
          $http({
            method: 'GET',
            url: 'ajax/getAllUser.php'
          }).then(function successCallback(response) {
            $rootScope.$storage.allUserResponse = response;
            setAllUser(response, user, matchday, loadFromDatabase);            
          });
        } else{
          setAllUser($rootScope.$storage.allUserResponse, user, matchday, loadFromDatabase);   
        }
        
        debug("END getAllUser")
      };

    function setAllUser(allUser, user, matchday, loadFromDatabase){

      var count = 0;
      allUser.data.forEach(function(entry) {
        var currentDate = new Date();
        var pic = "../uploads/avatar/" + entry.USERNAME.toLowerCase() + ".jpg?" 
                        + currentDate.getHours()
                        + currentDate.getMinutes()
                        + currentDate.getSeconds()
                        + currentDate.getMilliseconds();
        //var pic = "../uploads/empty.jpg";
        $rootScope.allUser[entry.USERNAME] = {};
        $rootScope.allUser[entry.USERNAME] = {
          id: count,
          username: entry.USERNAME,
          avatar: pic
        };
        count += 1;
      });
      

      $scope.matchDayVenue = $rootScope.allUser[allUser.data[0].USERNAME];
      if(loadFromDatabase){
        $http({
          method: 'GET',
          url: 'ajax/getAllMatchdays.php'
        }).then(function successCallback(response) {
            $rootScope.$storage.allMatchdaysResponse = response;
            setAllMatchdays(response, user, matchday, loadFromDatabase);
            
        }), function errorCallback(data) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        };
      } else {
        setAllMatchdays($rootScope.$storage.allMatchdaysResponse, user, matchday, loadFromDatabase);
      }
      

    }

    function setAllMatchdays(allMatchdays, user, matchday, loadFromDatabase){
      $rootScope.matchdays = {};
      var count=1;
       allMatchdays.data.forEach(function(entry) {
          var year = new Date(entry.DATE).getFullYear();
          if ($rootScope.matchdays.hasOwnProperty(year))
          {
            $rootScope.matchdays[year][Object.keys($rootScope.matchdays[year]).length + 1] = entry;
          }else{
            $rootScope.matchdays[year] = {};
            $rootScope.matchdays[year][1] = entry;
          }
          count+=1;
      });

      $scope.getMatchDayArticle(user, matchday, loadFromDatabase);
    }

    $scope.getScoreOfMatchday  = function(matchdayId, user) {
      debug("START getScoreOfMatchday");
      $scope.scoreOfMatchday = [];
      var id = $rootScope.matchdays[$rootScope.currentYear][matchdayId].ID;

      for(var player in $scope.matchdayResults[id]){
        var numberOfCards = 0;
        if ($scope.matchdayResults[id][player].scores[0].NUMBER != null){
          numberOfCards = $scope.matchdayResults[id][player].scores[0].NUMBER;
        }
        
        $scope.scoreOfMatchday.push({
          username: $scope.matchdayResults[id][player].scores[0].USER_NAME,
          chipcount: parseFloat($scope.matchdayResults[id][player].scores[0].CHIPCOUNT),
          totalscore: parseFloat($scope.matchdayResults[id][player].totalresult),
          inserttimestamp: $scope.matchdayResults[id][player].scores[0].INSERTTIMESTAMP,
          cards: numberOfCards,
          rebuys: 0,
        });
      }

      $scope.scoreOfMatchday.sort(function(a, b){
        return b.totalscore-a.totalscore
      });
      
      if (!$rootScope.applicationInitialized)
      {
        $scope.setTotalScoreUser();
      } else{
        if ((user == "" && $scope.scoreOfMatchday.length > 0)){
          $rootScope.selectedUser = $scope.scoreOfMatchday[0].username;
        } else if (user != "" && $scope.userPlayedMatchDay(user)){
          $rootScope.selectedUser = user;
        } else if ($scope.scoreOfMatchday.length == 0){
          $rootScope.selectedUser = $scope.allUser[Object.keys($scope.allUser)[0]].username;
        }
      }
    };

    $scope.userPlayedMatchDay = function(user){
      for(var score in $scope.scoreOfMatchday){
        if ($scope.scoreOfMatchday[score].username == user){
          return true;
        }
      }
      return false;
    }

    $scope.checkAvailableAvatars = function(){
      for (var user in $rootScope.allUser){
        $scope.doesFileExist($rootScope.allUser[user].username);
      }
       $rootScope.applicationInitialized = true;       
    } 

    $scope.getScoreOfAllMatchdays  = function(user, matchday, loadFromDatabase) {
      
      if(loadFromDatabase){
        $http({
          method: 'GET',
          url: 'ajax/getScoreOfAllMatchdays.php'
        }).then(function successCallback(response) {
            $rootScope.$storage.allScoreOfAllMatchdaysResponse = response;
            setScoreOfAllMatchdays(response, user, matchday);
          }, function errorCallback(data) {

        });
      } else {
        setScoreOfAllMatchdays($rootScope.$storage.allScoreOfAllMatchdaysResponse, user, matchday);
      }

      
      debug("END getScoreOfAllMatchdays");
    };

    function setScoreOfAllMatchdays(allScores, user, matchday){
      $rootScope.totalScoreDictionaryGroupedByYears = {};
      $scope.totalScore = [];
      for (var year in $rootScope.matchdays)
      {
        $rootScope.totalScoreDictionaryGroupedByYears[year] = {};
        $rootScope.totalScoreDictionaryGroupedByYears[year].MatchDayResults = {};
      }

      allScores.data.forEach(function(entry) {
          var year = new Date($scope.getMatchdayById(entry.MATCHDAY_ID).DATE).getFullYear();
          if (!$rootScope.totalScoreDictionaryGroupedByYears.hasOwnProperty(year))
          {
            $rootScope.totalScoreDictionaryGroupedByYears[year] = {};
            $rootScope.totalScoreDictionaryGroupedByYears[year].MatchDayResults = {};
            $rootScope.totalScoreDictionaryGroupedByYears[year].MatchDayResults[entry.MATCHDAY_ID] = {};
            $rootScope.totalScoreDictionaryGroupedByYears[year].MatchDayResults[entry.MATCHDAY_ID][entry.USER_NAME] = {
              scores: [],
              totalresult: 0
            };
            $rootScope.totalScoreDictionaryGroupedByYears[year].MatchDayResults[entry.MATCHDAY_ID][entry.USER_NAME].scores.push(entry);

          }else{
            if (!$rootScope.totalScoreDictionaryGroupedByYears[year].MatchDayResults.hasOwnProperty(entry.MATCHDAY_ID))
            {
              $rootScope.totalScoreDictionaryGroupedByYears[year].MatchDayResults[entry.MATCHDAY_ID] = {};
              $rootScope.totalScoreDictionaryGroupedByYears[year].MatchDayResults[entry.MATCHDAY_ID][entry.USER_NAME] = {
                scores: [],
                totalresult: 0
              };
              $rootScope.totalScoreDictionaryGroupedByYears[year].MatchDayResults[entry.MATCHDAY_ID][entry.USER_NAME].scores.push(entry);
            } else{
              if ($rootScope.totalScoreDictionaryGroupedByYears[year].MatchDayResults[entry.MATCHDAY_ID].hasOwnProperty(entry.USER_NAME)){
                $rootScope.totalScoreDictionaryGroupedByYears[year].MatchDayResults[entry.MATCHDAY_ID][entry.USER_NAME].scores.push(entry);
              } else{
                $rootScope.totalScoreDictionaryGroupedByYears[year].MatchDayResults[entry.MATCHDAY_ID][entry.USER_NAME] = {
                  scores:[],
                  totalresult: 0
                };
                $rootScope.totalScoreDictionaryGroupedByYears[year].MatchDayResults[entry.MATCHDAY_ID][entry.USER_NAME].scores.push(entry);
              }
            }
          }
        });
        
        if(isNaN(matchday)){
          $rootScope.currentMatchDay = Object.keys($rootScope.matchdays[$rootScope.currentYear]).length;
        }else{
          $rootScope.currentMatchDay = matchday;
        }

        $scope.setMatchDayResults(user, $rootScope.totalScoreDictionaryGroupedByYears[$rootScope.currentYear].MatchDayResults);
        $scope.getScoreOfMatchday($rootScope.currentMatchDay, user);
        $scope.getAllScoresOfMatchday();
        $scope.checkAvailableAvatars();
    }

    $scope.setMatchDayResults = function(user, matchDayResults) {
      $scope.matchdayResults = matchDayResults;
      $scope.totalScoreDictionary = {};

      for (var matchday in $scope.matchdayResults) {

        var matchDayBuyIn = 0;
        var matchDayTotalScore = 0;
        
        for(var player in $scope.matchdayResults[matchday]){
          var numberOfCards = 0;
          var numberOfCardsPenalty = 0;
          if ($scope.matchdayResults[matchday][player].scores[0].NUMBER != null)
          {
            numberOfCards = parseInt($scope.matchdayResults[matchday][player].scores[0].NUMBER);
          }
          if (numberOfCards > 0)
          {
            numberOfCardsPenalty = numberOfCards - 1;
          }

          var totalRebuyValue = 0;
          var count = 0;

          for(var score in $scope.matchdayResults[matchday][player].scores){
            if (parseInt($scope.matchdayResults[matchday][player].scores[count].ISREBUY) == 1){
              totalRebuyValue += parseFloat($scope.matchdayResults[matchday][player].scores[count].CHIPCOUNT)
            }
            count += 1;
          }

          $scope.matchdayResults[matchday][player].totalresult = parseFloat($scope.matchdayResults[matchday][player].scores[0].CHIPCOUNT) - totalRebuyValue;
          if(!$scope.totalScoreDictionary.hasOwnProperty(player)){
            $scope.totalScoreDictionary[player] = {
                      totalScore: parseFloat($scope.matchdayResults[matchday][player]
                          .scores[0].CHIPCOUNT) - totalRebuyValue,
                      totalRebuyValue: totalRebuyValue,
                      cards: numberOfCards,
                      cardsPenalty: numberOfCardsPenalty,
                      missedArticle: 0,
                      totalWin: parseFloat($scope.matchdayResults[matchday][player]
                          .scores[0].CHIPCOUNT),
                      participated: 1
                  }
          } else{
            $scope.totalScoreDictionary[player].participated += 1;
            $scope.totalScoreDictionary[player].totalScore = parseFloat($scope.totalScoreDictionary[player].totalScore) + 
                  (parseFloat($scope.matchdayResults[matchday][player].scores[0].CHIPCOUNT) - totalRebuyValue);
            $scope.totalScoreDictionary[player].totalRebuyValue = parseFloat($scope.totalScoreDictionary[player].totalRebuyValue) + 
                  totalRebuyValue;
            $scope.totalScoreDictionary[player].cards += numberOfCards,
            $scope.totalScoreDictionary[player].cardsPenalty += numberOfCardsPenalty,
            $scope.totalScoreDictionary[player].totalWin = parseFloat($scope.totalScoreDictionary[player].totalWin) + 
                  (parseFloat($scope.matchdayResults[matchday][player].scores[0].CHIPCOUNT));
          }

          matchDayBuyIn += parseFloat($scope.matchdayResults[matchday][player].scores[0].CHIPCOUNT) - parseFloat($scope.matchdayResults[matchday][player].totalresult);
          matchDayTotalScore += parseFloat($scope.matchdayResults[matchday][player].scores[0].CHIPCOUNT);

        }

        $scope.getMatchdayById(matchday).Winner = $scope.sortMatchdayByResult($scope.matchdayResults[matchday])[0].key;
        if(!$scope.matchDayArticle.hasOwnProperty(matchday))
        {
          $scope.totalScoreDictionary[$scope.getMatchdayById(matchday).Winner].missedArticle += 1;
        }
        $scope.getMatchdayById(matchday).TotalBuyIn = matchDayBuyIn;
        $scope.getMatchdayById(matchday).TotalScore = matchDayTotalScore;

      }

      $scope.allOverScore = 0.0;

      $scope.totalScore = $scope.setTotalScore($scope.totalScoreDictionary);
      return $scope.totalScore;
    }

    $scope.setScoreDictionary = function(matchdayId){
      var scoreDictionary = {};

      for(var score in $scope.totalScore){
          scoreDictionary[$scope.totalScore[score].player] = {
                totalScore: 0,
                totalRebuyValue: 0,
                cards: 0,
                cardsPenalty: 0,
                missedArticle: 0,
                totalWin: 0,
                participated: 0
        } 
      }
      

      for (var matchday in $scope.matchdayResults) {   

        if($scope.getMatchdayIndexById(matchday) <= matchdayId)
        {
          for(var player in $scope.matchdayResults[matchday]){
            var numberOfCards = 0;
            var numberOfCardsPenalty = 0;
            if ($scope.matchdayResults[matchday][player].scores[0].NUMBER != null)
            {
              numberOfCards = parseInt($scope.matchdayResults[matchday][player].scores[0].NUMBER);
            }
            if (numberOfCards > 0)
            {
              numberOfCardsPenalty = numberOfCards - 1;
            }
            var totalRebuyValue = 0;
            var count = 0;
            for(var score in $scope.matchdayResults[matchday][player].scores){
              if (parseInt($scope.matchdayResults[matchday][player].scores[count].ISREBUY) == 1){
                totalRebuyValue += parseFloat($scope.matchdayResults[matchday][player].scores[count].CHIPCOUNT)
              }
              count += 1;
            }

            
            scoreDictionary[player].participated += 1;
            scoreDictionary[player].totalScore = parseFloat(scoreDictionary[player].totalScore) + 
                  (parseFloat($scope.matchdayResults[matchday][player].scores[0].CHIPCOUNT) - totalRebuyValue);
            scoreDictionary[player].totalRebuyValue = parseFloat(scoreDictionary[player].totalRebuyValue) + 
                  totalRebuyValue;
            scoreDictionary[player].cards += numberOfCards,
            scoreDictionary[player].cardsPenalty += numberOfCardsPenalty,
            scoreDictionary[player].totalWin = parseFloat(scoreDictionary[player].totalWin) + 
                  (parseFloat($scope.matchdayResults[matchday][player].scores[0].CHIPCOUNT));
            
          }
        }

        
      }

      return scoreDictionary;
    
}

    $scope.setTotalScore = function (totalScoreDictionary)
    {

      var totalScoreTemp = [];
      for(var player in totalScoreDictionary){
        var cardsPenaltyAmount = totalScoreDictionary[player].cardsPenalty * 0.5;
        var missedArticlePenalty = totalScoreDictionary[player].missedArticle * 10;
        $scope.allOverScore += cardsPenaltyAmount + missedArticlePenalty;

        totalScoreTemp.push({
          "player": player,
          "result": totalScoreDictionary[player].totalScore,
          "rebuyValue": totalScoreDictionary[player].totalRebuyValue,
          "totalWin": totalScoreDictionary[player].totalWin,
          "participated": totalScoreDictionary[player].participated,
          "cards": totalScoreDictionary[player].cards,
          "cardsPenalty": totalScoreDictionary[player].cardsPenalty,
          "cardsPenaltyAmount": cardsPenaltyAmount,
          "ignoreOnTotalScore": ((totalScoreDictionary[player].participated < 
                  (Object.keys($scope.matchdayResults).length / participanceBarrier)) 
                  && Object.keys($scope.matchdayResults).length > 10) && parseInt($rootScope.currentYear) >= 2013,
          "missedArticle": totalScoreDictionary[player].missedArticle,
          "missedArticlePenalty": missedArticlePenalty,
          "totalPenalty": cardsPenaltyAmount + missedArticlePenalty,
          "allOverRank": 0,
          "realRank": 0
        });
      }

      totalScoreTemp.sort(function(a, b){
        return b.result-a.result
      });

      var rank = 1;
      var realRank = 1;
      for(var score in totalScoreTemp){
        totalScoreTemp[score].allOverRank = rank;
        if(!totalScoreTemp[score].ignoreOnTotalScore){
          totalScoreTemp[score].realRank = realRank;
          realRank ++;
        }
        rank ++;
      }
      return totalScoreTemp;
    }


    $scope.sortMatchdayByResult = function(obj) {
        var arr = [];
        var prop;
        for (prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                arr.push({
                    'key': prop,
                    'result': parseFloat(obj[prop].totalresult)
                });
            }
        }
        arr.sort(function(a, b) {
            return b.result - a.result;
        });
        return arr;
    }


    $scope.getMatchDayArticle = function(user, matchday, loadFromDatabase){ 
      
      if(loadFromDatabase){
        $http({
          method: 'GET',
          url: 'ajax/getMatchDayArticle.php'
        }).then(function successCallback(response, user, matchday) {
          $rootScope.$storage.matchDayArticleResponse = response;
          setAllMatchdayArticles(response, user, matchday, loadFromDatabase);
        });
      } else {
        setAllMatchdayArticles($rootScope.$storage.matchDayArticleResponse, user, matchday, loadFromDatabase);
      }
      
        
    };

    function setAllMatchdayArticles(allArticles, user, matchday, loadFromDatabase){
      $scope.matchDayArticle = {};
      allArticles.data.forEach(function(entry) {
        $scope.matchDayArticle[entry.matchday_id] = {
          user: entry.user_name,
          article: entry.text,
          timestamp: entry.inserttimestamp,
          title: entry.title
        }
      });

      var editors = textboxio.get('#textbox');
      var editor = editors[0];
      if (editor != undefined){
        if ($scope.matchDayArticle.hasOwnProperty($scope.getMatchdayIdByIndex($rootScope.currentMatchDay))){
          editor.content.set($scope.matchDayArticle[$scope.getMatchdayIdByIndex($rootScope.currentMatchDay)].article);
        }
      }
      
      $scope.getScoreOfAllMatchdays(user, matchday, loadFromDatabase);
    }

    $scope.initializeApplication = function(user, matchday, initialized) {
      debug("START initializeApplication");
      $rootScope.startBlockUi();
      $scope.matchdayResults = {};
      $scope.scoreOfMatchday = [];
      $scope.totalScore = [];
      $scope.getAllUser(user, matchday, initialized);
    };


    $scope.getMatchdayById = function(id){
      for (var year in $rootScope.matchdays) {
        for (var matchday in $rootScope.matchdays[year]) {
          if ($rootScope.matchdays[year][matchday].ID == id) {
            return $rootScope.matchdays[year][matchday];
          }
        }
      }
    }

    $scope.getMatchdayIdByIndex = function(index){
      for (var matchday in $rootScope.matchdays[$rootScope.currentYear]) {
        if (matchday == index) {
          return $rootScope.matchdays[$rootScope.currentYear][matchday].ID;
        }
      }
    }

    $scope.getMatchdayIndexById = function(id){
      for (var matchday in $rootScope.matchdays[$rootScope.currentYear]) {
        if ($rootScope.matchdays[$rootScope.currentYear][matchday].ID == id) {
          return matchday;
        }
      }
    }

    $rootScope.showOverAllScore = false;
    $scope.previousYear = function(){
      
      var newYear = $rootScope.currentYear;
      if(!$rootScope.showOverAllScore){
        newYear = parseInt($rootScope.currentYear) - 1;
      }

      if ($rootScope.matchdays.hasOwnProperty(newYear))
      {
        $rootScope.currentMatchDay = Object.keys($rootScope.matchdays[newYear]).length;
        $rootScope.currentYear = newYear;
        $scope.getScoreOfMatchday($rootScope.currentMatchDay, "");
        $scope.getAllScoresOfMatchday();
        $scope.setMatchDayResults("", $rootScope.totalScoreDictionaryGroupedByYears[$scope.currentYear].MatchDayResults);      
      } 
      $rootScope.showOverAllScore = false;
    };

    $scope.nextYear = function(){
      var newYear = parseInt($rootScope.currentYear) + 1;
      if ($rootScope.matchdays.hasOwnProperty(newYear))
      {
        $rootScope.currentMatchDay = Object.keys($rootScope.matchdays[newYear]).length;
        $rootScope.currentYear = newYear;
        $scope.getScoreOfMatchday($rootScope.currentMatchDay, "");
        $scope.getAllScoresOfMatchday();
        $scope.setMatchDayResults("", $rootScope.totalScoreDictionaryGroupedByYears[$scope.currentYear].MatchDayResults);      
      }else{
        $rootScope.showTotalScoreOfAllPlayers = false;
        $rootScope.showOverAllScore = true;
        $scope.totalScore = $scope.setAllTimeChampions();
      }
    };

    $scope.setAllTimeChampions = function()
    {
      var allTimeResult = {};
      var result = [];
      for(var year in $rootScope.totalScoreDictionaryGroupedByYears){
        var resultsOfYear = $scope.setMatchDayResults("", $rootScope.totalScoreDictionaryGroupedByYears[year].MatchDayResults);    

        for (var playerResult in resultsOfYear){
          if (!resultsOfYear[playerResult].ignoreOnTotalScore || year < 2013){
            if (!allTimeResult.hasOwnProperty(resultsOfYear[playerResult].player)){
              allTimeResult[resultsOfYear[playerResult].player] = resultsOfYear[playerResult];
              allTimeResult[resultsOfYear[playerResult].player].cards = resultsOfYear[playerResult].cards;
              allTimeResult[resultsOfYear[playerResult].player].cardsPenalty = 0;
              allTimeResult[resultsOfYear[playerResult].player].ignoreOnTotalScore = false;
              allTimeResult[resultsOfYear[playerResult].player].participated = 1;
              allTimeResult[resultsOfYear[playerResult].player].rebuyValue = resultsOfYear[playerResult].rebuyValue;
              allTimeResult[resultsOfYear[playerResult].player].totalWin = resultsOfYear[playerResult].totalWin;
            }else{
              allTimeResult[resultsOfYear[playerResult].player].result += resultsOfYear[playerResult].result;
              allTimeResult[resultsOfYear[playerResult].player].cards += resultsOfYear[playerResult].cards;
              allTimeResult[resultsOfYear[playerResult].player].cardsPenalty = 0;
              allTimeResult[resultsOfYear[playerResult].player].ignoreOnTotalScore = false;
              allTimeResult[resultsOfYear[playerResult].player].participated ++;
              allTimeResult[resultsOfYear[playerResult].player].rebuyValue += resultsOfYear[playerResult].rebuyValue;
              allTimeResult[resultsOfYear[playerResult].player].totalWin += resultsOfYear[playerResult].totalWin;
            }
          }
          
        }
      }
      
      for(var score in allTimeResult){
        var ignore = allTimeResult[score].participated < 2 ;
        allTimeResult[score].ignoreOnTotalScore = ignore;
        result.push(allTimeResult[score]);
        allTimeResult[score].allOverRank = rank;
        allTimeResult[score].realRank = rank;
      }

      result.sort(function(a, b){
        return b.result-a.result
      });

      var rank = 0;
      for(var r in result){
        if (!result[r].ignoreOnTotalScore){
          rank ++;
        }
        result[r].allOverRank = rank;
        result[r].realRank = rank;
      }
      return result;
    }

    $scope.nextMatchday = function(){
      if ($rootScope.currentMatchDay <  Object.keys($rootScope.matchdays[$scope.currentYear]).length){
        $rootScope.currentMatchDay += 1;
        $scope.getScoreOfMatchday($rootScope.currentMatchDay, "");
        $scope.getAllScoresOfMatchday();
      }
    };

    $scope.previousMatchday = function (){
      if ($rootScope.currentMatchDay > 1){
        $rootScope.currentMatchDay -= 1;
        $scope.getScoreOfMatchday($rootScope.currentMatchDay, "");
        $scope.getAllScoresOfMatchday();
      }
    };


    $scope.setMatchDayUser = function(){
      $scope.getScoreOfMatchday($rootScope.currentMatchDay, "");
    }

    $scope.setTotalScoreUser = function()
    {
      if($rootScope.showTotalScoreOfAllPlayers){
        $rootScope.selectedUser = $scope.totalScore[0].player;
      } else{
        for(var score in $scope.totalScore){
         if (!$scope.totalScore[score].ignoreOnTotalScore){
          $rootScope.selectedUser = $scope.totalScore[score].player;
          return;
         }
        }
      }
      
    }

    $scope.getAllScoresOfMatchday = function(){
      debug("START getAllScoresOfMatchday");
      $scope.allScoresOfMatchday = [];

      var id = $rootScope.matchdays[$rootScope.currentYear][$rootScope.currentMatchDay].ID;

      for(var player in $scope.matchdayResults[id]){
        var count = 0;
        for(var score in $scope.matchdayResults[id][player].scores){
          $scope.allScoresOfMatchday.push({
            username: $scope.matchdayResults[id][player].scores[count].USER_NAME,
            chipcount: parseFloat($scope.matchdayResults[id][player].scores[count].CHIPCOUNT),
            inserttimestamp: Date.parse($scope.matchdayResults[id][player].scores[count].INSERTTIMESTAMP),
            isrebuy: $scope.matchdayResults[id][player].scores[count].ISREBUY,
            id: $scope.matchdayResults[id][player].scores[count].ID
          });
          count ++;
        }
      }

      debug("END getAllScoresOfMatchday");
      debug("### LAST STEP OF INITIALIZATION");
      $rootScope.uiBlocked = false;
      $.unblockUI();
    }    

    $scope.rowSelected = function (user) {
      $rootScope.selectedUser = user;
    };

    $scope.addMatchday = function(venue, date){

      $rootScope.startBlockUi();
      $http({
          method  : 'POST',
          url     : 'ajax/addMatchday.php',
          data    : { 
                      username: venue,
                      date: date
                    },
          headers : {'Content-Type': 'application/x-www-form-urlencoded'} 
         }).success(function(data) {
            if (data.errors) {

            } else {
              //$scope.initializeApplication(venue);
              $scope.initializeApplication(venue, $rootScope.currentMatchDay, true);
            }
          });
    }

    
    $scope.setRebuyValue = function(value){
      $scope.rebuyValue = parseFloat(value);
    }
    


    $scope.addAllScoresOfMatchday = function(matchday, chipcount, rebuyvalue, username){
      $http({
          method  : 'POST',
          url     : 'ajax/addAllScoresOfMatchday.php',
          data    : {
                      matchday: matchday,
                      chipcount: chipcount,
                      rebuyvalue: rebuyvalue,
                      username: username
                    },
          headers : {'Content-Type': 'application/x-www-form-urlencoded'} 
         }).success(function(data) {
            if (data.errors) {
            } else {            
              //$scope.$apply();
            }
          });
    }

    $scope.saveTotalScore = function(){
      $rootScope.startBlockUi();
      for (var user in $rootScope.allUser){
        $scope.addAllScoresOfMatchday()
      }  
    }


    $scope.deleteScore = function(id){

      $rootScope.startBlockUi();
      $http({
          method  : 'POST',
          url     : 'ajax/deleteScore.php',
          data    : {
                      id: id
                    },
          headers : {'Content-Type': 'application/x-www-form-urlencoded'} 
         }).success(function(data) {
            if (data.errors) {
            } else {
              $scope.initializeApplication($scope.matchDayVenue, $rootScope.currentMatchDay, true);
              //$scope.$apply();
            }
          });
    }


    $scope.toggleMatchday = function(id, active){

      $rootScope.startBlockUi();
      $http({
          method  : 'POST',
          url     : 'ajax/toggleMatchday.php',
          data    : {
                      id: $rootScope.matchdays[$rootScope.currentYear][id].ID,
                      active: active,
                      matchdayIndex: parseInt($scope.getMatchdayIndexById($rootScope.matchdays[$rootScope.currentYear][id].ID))
                    },
          headers : {'Content-Type': 'application/x-www-form-urlencoded'} 
         }).success(function(data) {
            if (data.errors) {
            } else {
              $rootScope.matchdays[$rootScope.currentYear][id].ACTIVE = active;
              $scope.initializeApplication($scope.matchDayVenue, $rootScope.currentMatchDay, true);
              $.unblockUI();
              //$scope.$apply();
            }
          });
    }

    $scope.deleteMatchDay = function(id){

      $rootScope.startBlockUi();
      $http({
          method  : 'POST',
          url     : 'ajax/deleteMatchday.php',
          data    : {
                      id: $rootScope.matchdays[$rootScope.currentYear][id].ID
                    },
          headers : {'Content-Type': 'application/x-www-form-urlencoded'} 
         }).success(function(data) {
            if (data.errors) {
            } else {

              $scope.initializeApplication($scope.matchDayVenue, $scope.currentMatchDay, true);
              //$scope.$apply();
            }
          });
    }

    $rootScope.saveProfile = function (file, username, oldpassword, newPassword, repeatedNewPassword) {
      console.log(oldpassword);
      $rootScope.startBlockUi();
      Upload.upload({
          url: 'ajax/upload.php',
          method: 'POST',
          data: {fileToUpload: file, username: username, folder: 'avatar', oldpassword: oldpassword, newpassword: newPassword, repeatednewpassword: repeatedNewPassword}
      }).then(function successCallback(resp) {
        console.log(resp);
        var currentDate = new Date();
        var pic = "../uploads/avatar/" + username.toLowerCase() + ".jpg?" 
                        + currentDate.getHours()
                        + currentDate.getMinutes()
                        + currentDate.getSeconds()
                        + currentDate.getMilliseconds() + ".edited";

        $("img[src*='/" + username.toLowerCase() + ".jpg']").attr("src", pic);

        if (resp.data == "invalidpassword") {
          alert("Das angegebene alte Passwort ist falsch!");
        } else if (resp.data == "passwordsdoesnotmatch"){
          alert("Die Wiederholung des neuen Passworts stimmt nicht überein!");
        } else {
          alert("Dein Passwort wurde erfolgreich geändert!");
        }


        $.unblockUI();
      }, function errorCallback(resp) {
        $.unblockUI();
        location.reload(false);
      });
    };

    $rootScope.instantiateTextbox = function () {
      textboxio.replaceAll('textarea', {
        paste: {
          style: 'clean'
        },
        css: {
          stylesheets: ['./lib/textboxio/example.css']
        },
        images : {
          upload : {
            handler : function (data, success, failure) {
              var currentDate = new Date();
              var pic = ""
                  + $scope.getMatchdayIdByIndex($rootScope.currentMatchDay) + "-"
                  + currentDate.getHours()
                  + currentDate.getMinutes()
                  + currentDate.getSeconds()
                  + currentDate.getMilliseconds();
              Upload.upload({
                  url: 'ajax/upload.php',
                  method: 'POST',
                  data: {fileToUpload: data.blob(), 'username': pic, 'folder': 'articlePictures'}
              }).then(function successCallback(resp) {
                
                success("../uploads/articlePictures/" + pic + ".jpg");
              }, function errorCallback(resp) {
                $.unblockUI();
                location.reload(false);
              });
            }
          }
        }
      });
      var editors = textboxio.get('#textbox');
      var editor = editors[0];
      if (editor != undefined){
        if ($scope.matchDayArticle.hasOwnProperty($scope.getMatchdayIdByIndex($rootScope.currentMatchDay))
                    && !editor.content.isDirty()){
          editor.content.set($scope.matchDayArticle[$scope.getMatchdayIdByIndex($rootScope.currentMatchDay)].article);
        }
      }
      
    };



    $rootScope.showTotalScoreOfAllPlayers = false;


    $rootScope.logOff = function () {
       $rootScope.initializeLoggedInUser();
    }

    $rootScope.switchShowPlayers = function () 
    {
        $rootScope.showTotalScoreOfAllPlayers = !$rootScope.showTotalScoreOfAllPlayers;
    };

    $rootScope.currentMatchDay = 1;
    $rootScope.currentYear = new Date().getFullYear();    
    $rootScope.Utils = {
         keys : Object.keys
      }
      
    $scope.page = 1;
    $scope.matchDayDate = new Date();
    $scope.allScoresOfMatchday = [];  
    var now = new Date();

    $scope.rebuyValue = 10;

    if (now.getHours() >= 22){
      $scope.rebuyValue = 20;
    }

    $rootScope.$storage = $localStorage.$default({
    });
    
    $localStorage.$reset();
    $rootScope.applicationInitialized = false;
    $scope.initializeApplication("", undefined, $rootScope.$storage.initialized == undefined);

  });

  app.filter('keylength', function(){
    return function(input){
      if(!angular.isObject(input)){
        throw Error("Usage of non-objects with keylength filter!!")
      }
      return Object.keys(input).length;
    }
  });


  app.filter('orderObjectBy', function(){
   return function(input, attribute) {
      if (!angular.isObject(input)) 
      {
        return input;
      }

      var array = [];
      for(var objectKey in input) {
          array.push(input[objectKey]);
      }

      array.sort(function(a, b){
          a = a[attribute];
          b = b[attribute];
          return b - a;
      });
      return array;

   }
  });

  app.config(function($routeProvider) {
    $routeProvider.when('/',              {templateUrl: './templates/total-score.html', reloadOnSearch: false});
    //$routeProvider.when('/home',              {templateUrl: './templates/home.html', reloadOnSearch: false});
    $routeProvider.when('/login',              {templateUrl: './templates/login.html', reloadOnSearch: false});
    $routeProvider.when('/matchday',      {templateUrl: './templates/matchday.html', reloadOnSearch: false});
    $routeProvider.when('/matchdays',      {templateUrl: './templates/matchdays.html', reloadOnSearch: false});
    $routeProvider.when('/totalscore',      {templateUrl: './templates/total-score.html', reloadOnSearch: false});
    $routeProvider.when('/articles',      {templateUrl: './templates/articles.html', reloadOnSearch: false});
    $routeProvider.when('/administration',      {templateUrl: './templates/administration.html', reloadOnSearch: false});
    $routeProvider.when('/stats',      {templateUrl: './templates/stats.html', reloadOnSearch: false});
    $routeProvider.when('/test',      {templateUrl: './templates/test.html', reloadOnSearch: false});
    $routeProvider.when('/countdown',      {templateUrl: './templates/countdown.html', reloadOnSearch: false});
  });

  app.run( function($rootScope, $location) {
    $rootScope.$on( "$routeChangeStart", function(event, next, current) {
      if (!$rootScope.applicationInitialized){
        if ($rootScope.showCountdown){
          //$location.path( "/totalscore" );
          $location.path( "/countdown" );
        } else{
          $location.path( "/totalscore" );
        }
      } 

      /*if ( $rootScope.loggedInUser.loggedIn != true ) {
        if ( next.templateUrl == "templates/login.html" ) {
        } else {
          $location.path( "/login" );
        }
      }*/         
    });
 })

})();
