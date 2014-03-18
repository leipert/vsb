'use strict';

/* Controllers */

angular.module('GSB.controllers.subject', [])
.controller('SubjectController', ['$scope', function($scope) {
  //Initial State of Subjects
  $scope.subjects = [];

  // Adds Subject with the provided URI
  $scope.addSubject = function(uri) {
    $scope.subjects.push(
      {
        alias: "",
        uri: uri,
        selectedProperties: [],
        availableProperties: []
      }
    );
  }

  //Adds first Subject
  $scope.addSubject('http://a.de/Person');

  //Removes the selected subject !!! FUNCTION IS NOT CALLED BY property.html DOES ANYBODY KNOW WHY?
  // yes we know: u must give the splice-function the instance of subject
  $scope.removeSubject = function(subjectInstance) {
    $scope.subjects.splice($scope.subjects.indexOf(subjectInstance), 1);
  }

}]);  