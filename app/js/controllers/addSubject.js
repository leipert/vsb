'use strict';

angular.module('GSB.controllers.addSubject', ['ngSanitize', 'ui.select'])
  .factory('test', function($http, globalConfig) {
    var factory = {};
    factory.getClasses = function(asc) { // version 1
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
    // factory.getClasses = function() { // version 2
    //   var asc = [];
    //   //  Get Availabe Subject Classes from Server
    //   $http.get(globalConfig.baseURL + 'mockup/classes.json').success(function(data) {
    //     var availClasses = data.results.bindings;
    //     for (var key in availClasses) {
    //       if(availClasses.hasOwnProperty(key)){
    //         asc.push(
    //           {
    //             alias: availClasses[key].alias.value,
    //             uri: availClasses[key].class.value
    //           }
    //         );
    //       }
    //       // console.log(availClasses[key].alias.value);
    //     }
    //   }); 
    //   return asc;
    // }
    return factory;
  })
  .controller('AddSubjectCtrl', ['$scope', '$http', 'globalConfig', 'test', function($scope, $http, globalConfig, test) {
    //  List of available subject classes that can be added to the workspace.
    $scope.availableSubjectClasses = [];

    //  Subject selected to be added to the workspace.
    $scope.selectedSubjectClass = undefined;

    // //  Get Availabe Subject Classes from Server
    // $http.get(globalConfig.baseURL + 'mockup/classes.json').success(function(data) {
    //   var availClasses = data.results.bindings;
    //   for (var key in availClasses) {
    //     if(availClasses.hasOwnProperty(key)){
    //       $scope.availableSubjectClasses.push(
    //         {
    //           alias: availClasses[key].alias.value,
    //           uri: availClasses[key].class.value
    //         }
    //       );
    //     }
    //     // console.log(availClasses[key].alias.value);
    //   }
    // }); 
    
    
		test.getClasses($scope.availableSubjectClasses);       // version 1
		//$scope.availableSubjectClasses = test.getClasses();  // version 2

		$scope.uiAddSubject = function() {
			console.log($scope.selectedSubjectClass);
      if($scope.selectedSubjectClass) { // If the selected option is undefined no subject will be added.
        $scope.$emit('newSubjectEvent', $scope.selectedSubjectClass);
				$scope.selectedSubjectClass = undefined;
      }
    };
  }]);


