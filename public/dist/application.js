'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'greenfield';
	var applicationModuleVendorDependencies = ['ngResource', 'ngCookies',  'ngAnimate',  'ngTouch',  'ngSanitize',  'ui.router', 'ui.bootstrap', 'ui.utils'];

	// Add a new vertical module
	var registerModule = function(moduleName, dependencies) {
		// Create angular module
		angular.module(moduleName, dependencies || []);

		// Add the module to the AngularJS configuration file
		angular.module(applicationModuleName).requires.push(moduleName);
	};

	return {
		applicationModuleName: applicationModuleName,
		applicationModuleVendorDependencies: applicationModuleVendorDependencies,
		registerModule: registerModule
	};
})();
'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
'use strict';

// Use application configuration module to register a new module
ApplicationConfiguration.registerModule('challenges-page');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
'use strict';

// Use application configuration module to register a new module
ApplicationConfiguration.registerModule('org');
'use strict';

// Use application configuration module to register a new module
ApplicationConfiguration.registerModule('profile');

'use strict';

// Use application configuration module to register a new module
ApplicationConfiguration.registerModule('to-do-list');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');
'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
  function($stateProvider) {
    // Users state routing
    $stateProvider.
    state('challenges', {
      url: '/allchallenges',
      templateUrl: 'modules/challenges-page/views/all-challenges.client.view.html'
    });
  }
]);
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
'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('home', {
			url: '/',
			templateUrl: 'modules/core/views/home.client.view.html'
		});
	}
]);
'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$location', 'Authentication', 'Menus',
	function($scope, $location, Authentication, Menus) {
		$scope.authentication = Authentication;
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});

		$scope.getLocation = function(){
			return $location.path() === '/';
		};
	}
]);
'use strict';


angular.module('core').controller('HomeController', ['$scope', '$location','Authentication',
  function($scope, $location, Authentication) {
    // This provides Authentication context.
    $scope.authentication = Authentication;

    //this function ensures redirect to /user-to-do after login
    $scope.$watch(function(){return $location.path();}, function(next,current){
      if(Authentication.user && current === '/'){
        $location.path('/user-to-do');
      }
    });
  }
]);
'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [

	function() {
		// Define a set of default roles
		this.defaultRoles = ['*'];

		// Define the menus object
		this.menus = {};

		// A private function for rendering decision 
		var shouldRender = function(user) {
			if (user) {
				if (!!~this.roles.indexOf('*')) {
					return true;
				} else {
					for (var userRoleIndex in user.roles) {
						for (var roleIndex in this.roles) {
							if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
								return true;
							}
						}
					}
				}
			} else {
				return this.isPublic;
			}

			return false;
		};

		// Validate menu existance
		this.validateMenuExistance = function(menuId) {
			if (menuId && menuId.length) {
				if (this.menus[menuId]) {
					return true;
				} else {
					throw new Error('Menu does not exist');
				}
			} else {
				throw new Error('MenuId was not provided');
			}

			return false;
		};

		// Get the menu object by menu id
		this.getMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			return this.menus[menuId];
		};

		// Add new menu object by menu id
		this.addMenu = function(menuId, isPublic, roles) {
			// Create the new menu
			this.menus[menuId] = {
				isPublic: isPublic || false,
				roles: roles || this.defaultRoles,
				items: [],
				shouldRender: shouldRender
			};

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			delete this.menus[menuId];
		};

		// Add menu item object
		this.addMenuItem = function(menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Push new menu item
			this.menus[menuId].items.push({
				title: menuItemTitle,
				link: menuItemURL,
				menuItemType: menuItemType || 'item',
				menuItemClass: menuItemType,
				uiRoute: menuItemUIRoute || ('/' + menuItemURL),
				isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].isPublic : isPublic),
				roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].roles : roles),
				position: position || 0,
				items: [],
				shouldRender: shouldRender
			});

			// Return the menu object
			return this.menus[menuId];
		};

		// Add submenu item object
		this.addSubMenuItem = function(menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
					// Push new submenu item
					this.menus[menuId].items[itemIndex].items.push({
						title: menuItemTitle,
						link: menuItemURL,
						uiRoute: menuItemUIRoute || ('/' + menuItemURL),
						isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].items[itemIndex].isPublic : isPublic),
						roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : roles),
						position: position || 0,
						shouldRender: shouldRender
					});
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenuItem = function(menuId, menuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
					this.menus[menuId].items.splice(itemIndex, 1);
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeSubMenuItem = function(menuId, submenuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
					if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
						this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
					}
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		//Adding the topbar menu
		this.addMenu('topbar');
	}
]);
'use strict';

//Setting up route
angular.module('profile').config(['$stateProvider',
	function($stateProvider) {
		// Profile state routing
		$stateProvider.
		state('friend-search', {
			url: '/friendsearch',
			templateUrl: 'modules/profile/views/friend-search.client.view.html'
		}).
		state('profile', {
			url: '/profile',
			templateUrl: 'modules/profile/views/profile.client.view.html'
		}).
		state('userProfile',{
			url: '/users/:username',
			templateUrl: 'modules/profile/views/profile.client.view.html',
			controller: ["$scope", "$stateParams", function($scope, $stateParams) {
				$scope.userName = $stateParams.username;
			}]
		});
	}
]);
'use strict';

angular.module('profile').controller('ProfileController', ['$scope', 'Authentication', 'Todo', 'Friendsearch',
	function($scope, Authentication, Todo, Friendsearch) {
		// Controller Logic
		// ...

    $scope.authentication = Authentication;
      $scope.getUserChallenges = function(){
      Todo.getUserChallenges()
      .then(function(res){
        console.log('getUserChallenges res.data');
        console.log(res.data);
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
          }
        }, function(err){
          console.log(err);
        });
      });
     };

     $scope.search = function(userName){
      console.log('searching for userName');
      Friendsearch.search(userName).then(function(results){
        $scope.searchResults = results;
        $scope.searching = true;
        console.log('results: '+ $scope.searchResults);
      });
     };
     $scope.add = function(username){
      console.log('adding' + username);
      Friendsearch.add(username);
     };

     $scope.retrieveFriends = function(){
      Friendsearch.retrieveFriends().then(function(results){
        $scope.friendsList = results;
        console.log('friends: ' + $scope.friendsList);
      });
     };

     $scope.getUser = function(){
      Friendsearch.getUser($scope.userName).then(function(results){
        console.log("Results from trying to search for user" + results.data);
        console.log(results);
        $scope.user = results;
      });
     };

    $scope.init =function(){
      // $scope.getUserChallenges();
      // $scope.searching = false;
      // $scope.retrieveFriends();
      $scope.getUser();
    };
    $scope.init();
	}
]);
'use strict';

angular.module('profile').factory('Friendsearch', ['$http',
	function($http) {
		// Friendsearch service logic
		// ...
		var search = function(userName){
      return $http({
        method: 'POST',
        data: {userName: userName},
        url: '/users/friends/search'
      })
      .then(function(response){
      	console.log(response);
        return response.data;
      },
      function(err){
        console.log(err);
      });
    };

    var add = function(userName){
    return $http({
        method: 'POST',
        data: {userName: userName},
        url: '/users/friends/add'
      })
      .then(function(response){
      	console.log(response);
        return response.data;
      },
      function(err){
        console.log(err);
      });
    };

    var retrieveFriends = function(userName){
    return $http({
        method: 'GET',
        url: '/users/friends/'
      })
      .then(function(response){
      	console.log('friends list:' + response);
      	console.log('friends list data:' + response.data);
        return response.data;
      },
      function(err){
        console.log(err);
      });
    };

    var getUser = function(userName){
    return $http({
        method: 'GET',
        url: '/users/'+userName
      })
      .then(function(response){
      	console.log('returned user object' + response);
      	console.log('returned user data' + response.data);
        return response.data;
      },
      function(err){
        console.log(err);
      });
    };

		// Public API
		return {
			search: search,
			add: add,
			retrieveFriends: retrieveFriends,
			getUser: getUser
			
		};
	}
]);
'use strict';

//Setting up route
angular.module('to-do-list').config(['$stateProvider',
	function($stateProvider) {
		// To do list state routing
		$stateProvider.
		state('user-to-do', {
			url: '/user-to-do',
			templateUrl: 'modules/to-do-list/views/user-to-do.client.view.html'
		}).
    state('challenge-create', {
      url: '/challenge-create',
      templateUrl: 'modules/to-do-list/views/challenge-create.client.view.html'
    });
	}
]);

'use strict';

angular.module('to-do-list').controller('UserToDoController', ['$scope', 'Authentication', 'Todo', '$location',

  function($scope, Authentication, Todo, $location) {
    // Controller Logic
    $scope.authentication = Authentication;



    //calls Todo.getUserTasks which returns the users tasks
    $scope.getUserTasks = function(){
      Todo.getUserTasks()
      .then(function(res){
        //sets scope.tasks to the array of user tasks
        $scope.tasks = res.data;
      }, function(err){
        console.log(err);
      });
     };
    //calls Todo.getUserChallenges which returns the array of challenges attached to the user and updates allChallenges
    $scope.getUserChallenges = function(){
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
          }
        }, function(err){
          console.log(err);
        });
      });
     };


    $scope.addChallenge = function(index){
      Todo.putUserChallenge($scope.allChallenges[index]._id)
      .then(function(res){
        $scope.getUserChallenges();
      }, function(err){
        console.log(err);
      });
     };

    $scope.addUserTask = function(){
      var data = document.getElementById('taskData').value;
      var task = {description: data, completed: false, rewards: null};
      Todo.putUserTask(task)
      .then(function(res){
        document.getElementById('taskData').value = '';
        $scope.getUserTasks();
      }, function(err){
        console.log(err);
      });
     };

     $scope.removeTask = function(index){
      console.log('removing task');
      Todo.removeTask(index).then($scope.getUserTasks());
      console.log('removing: ' + $scope.tasks[index].description);
      
     };

    $scope.completeUserTask = function(index){
      Todo.updateUserTask($scope.tasks[index]._id)
      .then(function(res){
        $scope.getUserTasks();
      },function(err){
        console.log(err);
      });
    };

    $scope.completeChallengeTask = function(index){
      console.log('TASK ID');
      console.log(this.task._id);
      console.log('CHALLENGE ID');
      console.log(this.$parent.challenge._id);
      console.log('COMPLETED STATE BEFORE UPDATE');
      console.log(this.task.completed);
      Todo.updateChallengeTask(this.task._id, this.$parent.challenge._id) //this.task._id === right task
      .then(function(res){
        $scope.getUserChallenges();
        $scope.checkChallengeComplete(index);
      },function(err){
        console.log(err);
      });

    };

    $scope.checkChallengeComplete = function(index){
      Todo.checkChallengeComplete(index).then(function(response){
        setTimeout(function(){$scope.getUserChallenges();}, 100);
        console.log('challenge complete: '+response);
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
      Todo.addChallenge($scope.newChallenge)
      .then(function(res){
        $location.path('/user-to-do');
      }, function(err){
        console.log(err);
      });
     };

    //removeChallengeTask
      $scope.removeChallengeTask = function(challengeIndex, index){
      console.log('current tasks before removal', $scope.userChallenges[challengeIndex].tasks);
      $scope.userChallenges[challengeIndex].tasks.splice(index,1);
      console.log('tasks after removal', $scope.userChallenges[challengeIndex].tasks);

      Todo.removeChallengeTask(challengeIndex, index);
      console.log('challenge index, index' + challengeIndex + index);

     };

    //remove Challenge
    $scope.removeChallenge = function(id){
      console.log('current challenges before removal', $scope.userChallenges[id]);
      $scope.userChallenges.splice(id,1);
      console.log('challenges after removal', $scope.userChallenges[id]);

      Todo.removeChallenge(id);
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



'use strict';

angular.module('to-do-list').factory('Todo', ['$http',
  function($http) {

    //Requests list of user tasks from the server
    var getUserTasks = function(){
      return $http({
        method: 'GET',
        url: '/users/tasks'
      })
      .then(function(response){
        return response;
      },
      function(err){
        console.log(err);
      });
    };

    //retrieves array of user challenges from the db
    var getUserChallenges = function(){
      return $http({
        method: 'GET',
        url: '/users/challenges'
      })
      .then(function(response){
        return response;
      },
      function(err){
        console.log(err);
      });
    };

    //retrieves all available challenges from the db
    var getAllChallenges = function(){
      return $http({
        method: 'GET',
        url: '/challenges'
      })
      .then(function(response){
        return response;
      },
      function(err){
        console.log(err);
      });
    };
    //Adds a challenge to user
    var putUserChallenge = function(id){
      return $http({
        method: 'PUT',
        url: '/users/challenges',
        data: {_id: id}
      })
      .then(function(response){
        return response;
      },
      function(err){
        console.log(err);
      });
    };

    var putUserTask = function(task){
      return $http({
        method: 'PUT',
        url: '/users/tasks',
        data: task
      })
      .then(function(response){
        return response;
      },
      function(err){
        console.log(err);
      });
    };

    //Remove Task
    var removeTask = function(index){
      return $http({
        method: 'POST',
        url: '/users/tasks',
        data: {index: index}
      }).then(function(response){
        return response;
      },
      function(err){
        console.log(err);
      });
    };

    //Change
    var updateUserTask = function(taskId){
      return $http({
        method: 'PUT',
        url: '/users/tasks/update',
        data: {taskId: taskId}
      })

      .then(function(response){
        return response;
      },
      function(err){
        console.log(err);
      });
    };

    var updateChallengeTask = function(taskId, challengeId){
      return $http({
        method: 'PUT',
        url: '/users/tasks/update',
        data: {taskId: String(taskId), challengeId: String(challengeId) }
      })
      .then(function(response){
        return response;
      },
      function(err){
        console.log(err);
      });
    };

    var addChallenge = function(data){
      return $http({
        method: 'PUT',
        url: '/challenges',
        data: data
      })
      .then(function(response){
        return response;
      },function(err){
        console.log(err);
      });
    };

    //Remove Challenge Task
    var removeChallengeTask = function(challengeIndex,index){
      return $http({
        method: 'POST',
        url: '/users/challenges/tasks/remove',
        data: {index: index,
              challengeIndex: challengeIndex}
      })
      .then(function(response){
        return response;
      },function(err){
        console.log(err);
      });
    };

    var removeChallenge = function(index){
      return $http({
        method: 'PUT',
        url: '/users/challenges/remove',
        data: {index: index}
      }).then(function(response){
        console.log("executing callback for removeChallenge");
        return response;
      },function(err){
        console.log(err);
      });
    };

    var checkChallengeComplete = function(index){
      return $http({
        method: 'POST',
        url: '/users/challenges/check',
        data: {index: index}
      }).then(function(response){
        console.log('Http response for checkChallengeComplete', response);
        return response;
      },function(err){
        console.log(err);
      });
    };

    //curl -H "Content-Type: application/json" -X PUT -d '{"name":"test me","description":"test info","reward":"stuff","tasks":[{"description": "one day", "relativeDate": 1},{"description": "two day", "relativeDate": 2}]}' https://heraapphrr7.herokuapp.com/challenges

    // var removeUserTask = function(id){
    //  return $http({
    //     method: 'PUT',
    //     url: '/users/tasks/remove',
    //     data: {_id: id}
    //   })
    //   .then(function(response){
    //     return response;
    //   },
    //   function(err){
    //     console.log(err);
    //   });
    // };



    // Public API
    return {
      getUserTasks: getUserTasks,
      getUserChallenges: getUserChallenges,
      getAllChallenges: getAllChallenges,
      putUserChallenge: putUserChallenge,
      putUserTask: putUserTask,
      updateUserTask: updateUserTask,
      updateChallengeTask: updateChallengeTask,
      addChallenge: addChallenge,
      removeTask: removeTask,
      removeChallengeTask: removeChallengeTask,
      removeChallenge: removeChallenge,
      checkChallengeComplete: checkChallengeComplete
		};
	}
]);

'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
	function($httpProvider) {
		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push(['$q', '$location', 'Authentication',
			function($q, $location, Authentication) {
				return {
					responseError: function(rejection) {
						switch (rejection.status) {
							case 401:
								// Deauthenticate the global user
								Authentication.user = null;

								// Redirect to signin page
								$location.path('signin');
								break;
							case 403:
								// Add unauthorized behaviour 
								break;
						}

						return $q.reject(rejection);
					}
				};
			}
		]);
	}
]);
'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
	function($stateProvider) {
		// Users state routing
		$stateProvider.
		state('editProfile', {
			url: '/settings/editProfile',
			templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
		}).
		state('password', {
			url: '/settings/password',
			templateUrl: 'modules/users/views/settings/change-password.client.view.html'
		}).
		state('accounts', {
			url: '/settings/accounts',
			templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
		}).
		state('signup', {
			url: '/signup',
			templateUrl: 'modules/users/views/authentication/signup.client.view.html'
		}).
		state('signin', {
			url: '/signin',
			templateUrl: 'modules/users/views/authentication/signin.client.view.html'
		}).
		state('forgot', {
			url: '/password/forgot',
			templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
		}).
		state('reset-invalid', {
			url: '/password/reset/invalid',
			templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
		}).
		state('reset-success', {
			url: '/password/reset/success',
			templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
		}).
		state('reset', {
			url: '/password/reset/:token',
			templateUrl: 'modules/users/views/password/reset-password.client.view.html'
		});
	}
]);
'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		$scope.signup = function() {
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
	function($scope, $stateParams, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		//If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		// Submit forgotten password account id
		$scope.askForPasswordReset = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/forgot', $scope.credentials).success(function(response) {
				// Show user success message and clear form
				$scope.credentials = null;
				$scope.success = response.message;

			}).error(function(response) {
				// Show user error message and clear form
				$scope.credentials = null;
				$scope.error = response.message;
			});
		};

		// Change user password
		$scope.resetUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.passwordDetails = null;

				// Attach user profile
				Authentication.user = response;

				// And redirect to the index page
				$location.path('/password/reset/success');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication',
	function($scope, $http, $location, Users, Authentication) {
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		// Check if there are additional accounts 
		$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
			for (var i in $scope.user.additionalProvidersData) {
				return true;
			}

			return false;
		};

		// Check if provider is already in use with current user
		$scope.isConnectedSocialAccount = function(provider) {
			return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
		};

		// Remove a user social account
		$scope.removeUserSocialAccount = function(provider) {
			$scope.success = $scope.error = null;

			$http.delete('/users/accounts', {
				params: {
					provider: provider
				}
			}).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.user = Authentication.user = response;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		// Update a user profile
		$scope.updateUserProfile = function(isValid) {
			if (isValid) {
				$scope.success = $scope.error = null;
				var user = new Users($scope.user);

				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', [
	function() {
		var _this = this;

		_this._data = {
			user: window.user
		};

		return _this._data;
	}
]);
'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
	function($resource) {
		return $resource('users', {}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);