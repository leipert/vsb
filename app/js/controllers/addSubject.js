'use strict';

/**
 * addSubjectCtrl
 * Adds a selected subject to the Workspace.
 * TODO: Better definition what this controller actually does
 */

angular.module('GSB.controllers.addSubject', ['ngSanitize', 'ui.select']).
  //Inject $scope and AvailableClassesService (see @js/services/availableClasses.js) into controller
  controller('AddSubjectCtrl', ['$scope', 'AvailableClassesService', function($scope, AvailableClassesService) {
    //  List of available subject classes that can be added to the workspace.
    $scope.availableSubjectClasses = [];

    //  Subject selected to be added to the workspace.
    $scope.selectedSubjectClass = undefined;
    
    AvailableClassesService.get($scope.availableSubjectClasses);
    
    $scope.uiAddSubject = function() {
      console.log($scope.selectedSubjectClass);
      if($scope.selectedSubjectClass) { // If the selected option is undefined no subject will be added.
        $scope.$emit('newSubjectEvent', $scope.selectedSubjectClass);
	      $scope.selectedSubjectClass = undefined;
      }
    };
  }]);


