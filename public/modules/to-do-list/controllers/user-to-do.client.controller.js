'use strict';

angular.module('to-do-list').controller('UserToDoController', ['$scope', 'Authentication', 'Todo', '$location',

  function($scope, Authentication, Todo, $location) {
    // Controller Logic
    $scope.authentication = Authentication;
    $scope.loading = Todo.loading;



    //calls Todo.getUserTasks which returns the users tasks
    $scope.getUserTasks = function(){
      $scope.loader.toggleOn();
      Todo.getUserTasks()
      .then(function(res){
        $scope.loader.toggleOff();
        //sets scope.tasks to the array of user tasks
        $scope.tasks = res.data;
        // $scope.loading = false;
      }, function(err){
        $scope.loader.toggleOff();
        console.log(err);
      });
     };
    //calls Todo.getUserChallenges which returns the array of challenges attached to the user and updates allChallenges

    $scope.loader = Todo.loader;

    $scope.getUserChallenges = function(){
      $scope.loader.toggleOn();
      Todo.getUserChallenges()
      .then(function(res){
        // console.log('getUserChallenges res.data');
        // console.log(res.data);
        //sets scope.userChallenges to the array of challenges the user is involved in
        $scope.userChallenges = res.data;
      }, function(err){
        console.log(err);
      })
      .then(function(res){
        //Returns array of all challenges available to user
         Todo.getAllChallenges()
        .then(function(res){
          //filters for challenges already attached to user
          $scope.allChallenges = [];
          for (var i = 0; i < res.data.length; i++){
            var toPush = true;
            for(var j = 0; j < $scope.userChallenges.length; j++){
              if (res.data[i]._id === $scope.userChallenges[j]._id){
                toPush = false;
              }
            }
            if(toPush){
              $scope.allChallenges.push(res.data[i]);
            }
            $scope.loader.toggleOff();
          }
        }, function(err){
          $scope.loader.toggleOff();
          console.log(err);
        });
      });
     };


    $scope.addChallenge = function(index){
      $scope.loader.toggleOn();
      Todo.putUserChallenge($scope.allChallenges[index]._id)
      .then(function(res){
        $scope.getUserChallenges();
        $scope.loader.toggleOff();
      }, function(err){
        $scope.loader.toggleOff();
        console.log(err);
      });
     };

    $scope.addUserTask = function(){
      $scope.loader.toggleOn();
      var data = document.getElementById('taskData').value;
      var task = {description: data, completed: false, rewards: null};
      Todo.putUserTask(task)
      .then(function(res){
        $scope.loader.toggleOff();
        document.getElementById('taskData').value = '';
        $scope.getUserTasks();
      }, function(err){
        $scope.loader.toggleOff();
        console.log(err);
      });
     };

     $scope.removeTask = function(index){
      $scope.loader.toggleOn();
      console.log('removing task');
      Todo.removeTask(index).then(function(){$scope.getUserTasks(); $scope.loader.toggleOff();});
      console.log('removing: ' + $scope.tasks[index].description);
      
     };

    $scope.completeUserTask = function(index){

      $scope.loader.toggleOn();
      Todo.updateUserTask($scope.tasks[index]._id)
      .then(function(res){
        $scope.loader.toggleOff();
        $scope.getUserTasks();
      },function(err){
        $scope.loader.toggleOff();
        console.log(err);
      });
    };

    $scope.completeChallengeTask = function(challengeIndex, index){
      // console.log('TASK ID');
      // console.log(this.task._id);
      // console.log('CHALLENGE ID');
      // console.log(this.$parent.challenge._id);
      // console.log('COMPLETED STATE BEFORE UPDATE');
      // console.log(this.task.completed);
      console.log($scope.userChallenges[challengeIndex]);
      var numChallenges = $scope.userChallenges[challengeIndex].tasks.length;
      var count = 0;
      Todo.updateChallengeTask(this.task._id, this.$parent.challenge._id) //this.task._id === right task
      .then(function(res){
        if($scope.userChallenges[challengeIndex].tasks[index].completed){
          $scope.userChallenges[challengeIndex].tasks[index].completed = false;
        }else{
          $scope.userChallenges[challengeIndex].tasks[index].completed = true;
        }
        //$scope.getUserChallenges();
        for(var i = 0; i < $scope.userChallenges[challengeIndex].tasks; i++){
          if($scope.userChallenges[challengeIndex].tasks[i].completed){
            count++;
          }
        }
        if(count === numChallenges){
          $scope.userChallenges[challengeIndex].completed = true;
        }else{
          $scope.userChallenges[challengeIndex].completed = false;
        }
        $scope.checkChallengeComplete(challengeIndex);
      },function(err){
        console.log(err);
      });

    };

    $scope.checkChallengeComplete = function(index){
      $scope.loader.toggleOn();
      var complete = false;
      console.log($scope.userChallenges[index]);

      Todo.checkChallengeComplete(index).then(function(response){
        $scope.loader.toggleOff();
        setTimeout(function(){$scope.getUserChallenges();}, 100);
        console.log('challenge complete: ',response);
      });
    };

    $scope.nextDay = function(){
      $scope.today = new Date();
      $scope.dayModifier++;
      $scope.today.setDate($scope.today.getDate() + $scope.dayModifier);
      $scope.displayDay = $scope.today;
      $scope.prettyDate = $scope.displayDay.toDateString();
    };

    $scope.prevDay = function(){
      $scope.today = new Date();
      $scope.dayModifier--;
      $scope.today.setDate($scope.today.getDate() + $scope.dayModifier);
      $scope.displayDay = $scope.today;
      $scope.prettyDate = $scope.displayDay.toDateString();
    };

    $scope.checkDate = function(day){
      var itemDate = new Date(day);
      if (itemDate.getDate() !== $scope.displayDay.getDate()){
        return false;
      }
      if (itemDate.getMonth() !== $scope.displayDay.getMonth()){
        return false;
      }
      if (itemDate.getFullYear() !== $scope.displayDay.getFullYear()){
        return false;
      }
      else return true;
    };

    $scope.dayModifier = 0;
    $scope.displayDay = new Date();
    $scope.prettyDate = $scope.displayDay.toDateString();

    //Template Data -- This will be separated into another controller later
    $scope.newChallenge = {
      name: '',
      description: '',
      reward: 'null',
      category: '',
      tasks: []
    };

    $scope.addNewChallengeTask = function(){
      //Take a challenge task and push it into new challenge task
      var data = document.getElementById('taskData').value;
      $scope.newChallenge.tasks.push({description: data, relativeDate: $scope.dayModifier});
      document.getElementById('taskData').value = '';
    };

    $scope.addNewChallengeName = function(){
      var data = document.getElementById('nameData').value;
      $scope.newChallenge.name = data;
      document.getElementById('taskData').value = '';
    };

    $scope.addNewCategoryName = function(){
      var data = document.getElementById('catData').value;
      $scope.newChallenge.category = data;
    };

    $scope.addNewDescription = function(){
      var data = document.getElementById('descData').value;
      $scope.newChallenge.description = data;
    };

    $scope.checkRelativeDate = function(day){
      if(day === $scope.dayModifier){
        return true;
      }
    };

    $scope.submitChallenge = function(){
      $scope.loader.toggleOn();
      Todo.addChallenge($scope.newChallenge)
      .then(function(res){
        $scope.loader.toggleOff();
        $location.path('/user-to-do');
      }, function(err){
        console.log(err);
      });
     };

     $scope.toggleUserTask = function(challengeIndex, index){
      Todo.toggleUserTask(challengeIndex, index);
     };

    //removeChallengeTask
      $scope.removeChallengeTask = function(challengeIndex, index){
        $scope.loader.toggleOn();
      console.log('current tasks before removal', $scope.userChallenges[challengeIndex].tasks);
      delete $scope.userChallenges[challengeIndex].tasks[index];
      console.log('tasks after removal', $scope.userChallenges[challengeIndex].tasks);

      Todo.removeChallengeTask(challengeIndex, index).then(function(){$scope.getUserChallenges();$scope.loader.toggleOff();});
      console.log('challenge index, index' + challengeIndex + index);

     };

    //remove Challenge
    $scope.removeChallenge = function(id){
      $scope.loader.toggleOn();
      console.log('current challenges before removal', $scope.userChallenges[id]);
      console.log('challenges after removal', $scope.userChallenges[id]);

      Todo.removeChallenge(id).then(function(){$scope.getUserChallenges();$scope.loader.toggleOff();});
      console.log('removing challenge');
      
    };
    //Initialization function for getting initial user data
    $scope.init = function(){
      $scope.getUserTasks();
      $scope.getUserChallenges();
    };

    $scope.init();
  }
]);


///


