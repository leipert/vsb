'use strict';

angular.module('GSB.controllers.addSubject', ['ngSanitize', 'ui.select'])
.controller('AddSubjectCtrl', ['$scope', '$http', 'globalConfig', function($scope, $http, globalConfig) {
//	 List of available subject classes that can be added to the workspace.
  $scope.availableSubjectClasses = [];

  //  Subject selected to be added to the workspace.
  $scope.selectedSubjectClass = undefined;

  //  Get Availabe Subject Classes from Server
  $http.get(globalConfig.baseURL + 'mockup/classes.json').success(function(data) {
    var availClasses = data.results.bindings;
    for (var key in availClasses) {
      if(availClasses.hasOwnProperty(key)){
        $scope.availableSubjectClasses.push(
          {
            alias: availClasses[key].alias.value,
            uri: availClasses[key].class.value
          }
        );
      }
      // console.log(availClasses[key].alias.value);
    }
  }); 
		
		
		$scope.uiAddSubject = function() {
				console.log($scope.selectedSubjectClass);
    if($scope.selectedSubjectClass) { // If the selected option is undefined no subject will be added.
      $scope.$emit('newSubjectEvent', $scope.selectedSubjectClass);
						  $scope.selectedSubjectClass = undefined;
    }
  };
}]);


