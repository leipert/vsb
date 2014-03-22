'use strict';

// Loads all our components
angular.module('GSB', [
  'ui.bootstrap',
  'GSB.config',
  'GSB.filters',
  'GSB.controllers.workspace',
  'GSB.controllers.property',
  'GSB.directives.subject',
  'GSB.directives.property'
]);

//Global functions

//Now you can check with str1.startWith(str2) whether a string str1 starts with another string str2
if (typeof String.prototype.startsWith != 'function') {
  // see below for better implementation!
  String.prototype.startsWith = function (str){
    return this.indexOf(str) == 0;
  };
}

var AddSubjectDropDownCtrl = function($scope, $http) {
		//	 List of available subject classes that can be added to the workspace.
		$scope.availableSubjectClasses = [];
		
		//  Subject selected to be added to the workspace.
		$scope.selectedSubjectClass;
		
		//  Get Availabe Subject Classes from Server
		$http.get('/app/mockup/classes.json').success(function(data) {
				var availClasses = data.results.bindings;
				for (var key in availClasses) {
						$scope.availableSubjectClasses.push(
								{
										alias: availClasses[key].alias.value,
										uri: availClasses[key].class.value
								}
						);
						// console.log(availClasses[key].alias.value);
				}
		});
		
		$scope.dropDownAddSubject = function() {
				// console.log($scope.selectedSubjectClass);
				if($scope.selectedSubjectClass) { // If the selected option is undefined no subject will be added.
						$scope.$emit('newSubjectEvent', $scope.selectedSubjectClass);
				}
		};
};

var ModalCtrl = function($scope, $http, $modal, $log) {

		$scope.items = []; // Is this the right place?

		// Get Availabe Subject Classes from Server
		$http.get('/app/mockup/classes.json').success(function(data) {
				$scope.items = []; // This is a duplicate of the code 4 lines above. Any ideas which one is preferable?
				var availClasses = data.results.bindings;
				for (var key in availClasses) {
						$scope.items.push(
								{
										alias: availClasses[key].alias.value,
										uri: availClasses[key].class.value
								}
						);
				}
		});

		$scope.open = function() {

				// Create modalInstance
				var modalInstance = $modal.open({
						templateUrl: 'template/modal.html',
						controller: ModalInstanceCtrl,
						resolve: {
								items: function() {
										return $scope.items;
								}
						}
				});

				// User closed modal
				modalInstance.result.then(function(selectedItem) {
						$scope.selected = selectedItem;
						$scope.$emit('newSubjectEvent', selectedItem);
				}, function() {
						$log.info('Modal dismissed at: ' + new Date());
				});
		};
};

var ModalInstanceCtrl = function($scope, $modalInstance, items) {

		$scope.items = items;
		$scope.selected = {
				item: $scope.items[0]
		};

		// User clicked okay
		$scope.ok = function() {
				$modalInstance.close($scope.selected.item);
		};

		// USer clicked cancel
		$scope.cancel = function() {
				$modalInstance.dismiss('cancel');
		};
};

