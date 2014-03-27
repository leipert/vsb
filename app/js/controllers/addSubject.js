'use strict';


angular.module('GSB.factories.dataGetter', [])
  .factory('classes', function($http, globalConfig) {
    var factory = {};
    factory.get = function(asc) {
      //  Get Availabe Subject Classes from Server
      $http.get(globalConfig.baseURL + 'mockup/classes.json').success(function(data) {
        var availClasses = data.results.bindings;
        for (var key in availClasses) {
          if(availClasses.hasOwnProperty(key)){
            asc.push(
              {
                alias: availClasses[key].alias.value,
                uri: availClasses[key].class.value
              }
            );
          }
          // console.log(availClasses[key].alias.value);
        }
      }); 
    }
    return factory;
  });

angular.module('GSB.controllers.addSubject', ['ngSanitize', 'ui.select'])
  .controller('AddSubjectCtrl', ['$scope', '$http', 'globalConfig', 'classes', function($scope, $http, globalConfig, classes) {
    //  List of available subject classes that can be added to the workspace.
    $scope.availableSubjectClasses = [];

    //  Subject selected to be added to the workspace.
    $scope.selectedSubjectClass = undefined;
    
		classes.get($scope.availableSubjectClasses);       // version 1
	
	$scope.uiAddSubject = function() {
			console.log($scope.selectedSubjectClass);
      if($scope.selectedSubjectClass) { // If the selected option is undefined no subject will be added.
        $scope.$emit('newSubjectEvent', $scope.selectedSubjectClass);
				$scope.selectedSubjectClass = undefined;
      }
    };
  }]);


