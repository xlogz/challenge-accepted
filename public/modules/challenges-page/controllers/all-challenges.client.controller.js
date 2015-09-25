'use strict';

angular.module('challenges-page')
.controller('AllChallengesController', ['$scope', 'Authentication', 'Todo', '$location',
	function($scope, Authentication, Todo, $location) {

    $scope.authentication = Authentication;
    $scope.allChallenges = [];
    $scope.addChallenge = function(index){
      Todo.putUserChallenge($scope.allChallenges[index]._id)
      .then(function(res){
        console.log("added");
      }, function(err){
        console.log(err);
      });
     };

    $scope.getAllChallenges = function(){
      Todo.getAllChallenges()
      .then(function(res){
        for (var i = 0; i < res.data.length; i++){
            $scope.allChallenges.push(res.data[i]);
          }
      }, function(err){
        console.log(err);
      });
      console.log($scope.allChallenges);
      return $scope.allChallenges;
    };

    $scope.getAllChallenges();
  }
]);