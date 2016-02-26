'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$location', 'Authentication', 'Menus', 'Todo',
	function($scope, $location, Authentication, Menus, Todo) {
		$scope.authentication = Authentication;
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

		$scope.loader = Todo.loader;

		$scope.loader.toggleOn();
		console.log($scope.loader);


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