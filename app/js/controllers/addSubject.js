'use strict';

angular.module('GSB.controllers.addSubject', ['ngSanitize', 'ui.select']).
  controller('AddSubjectCtrl', ['$scope', '$http', 'globalConfig', 'classes', function($scope, $http, globalConfig, classes) {
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


