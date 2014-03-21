'use strict';

/* Controllers */

angular.module('GSB.controllers.workspace', [])
.controller('WorkspaceCtrl', ['$scope', function($scope) {
  //Initial State of Subjects
  $scope.subjects = [];
  $scope.result = "In the near future the results will be displayed here.";
  $scope.mainSubjectSelected;

  // Adds Subject with the provided URI and Alias
  $scope.addSubject = function(uri, alias) {
    alias = $scope.createUniqueAlias(alias);
    $scope.subjects.push(
      {
        alias: alias,
        uri: uri,
        selectedProperties: [],
        availableProperties: []
      }
    );
  }

  //Checks whether an alias name is unique.
  //If not it will provide us with an unique one.
  $scope.createUniqueAlias=function(alias) {
      var aliasUnique = true,
          newAlias = alias,
          key = null,
          c = 1;
      do{
          for(key in $scope.subjects){
              if($scope.subjects[key].alias === newAlias){
                  aliasUnique = false;
                  newAlias = alias + "_" + c;
                  break;
              }
              aliasUnique = true;
          }
          c += 1;
      }while(!aliasUnique);
      return newAlias;
  }

  //Eventlistener. If this Event is called, a new Subject will be created.
  $scope.$on('newSubjectEvent', function($event, subjectClass) {
      $scope.addSubject(subjectClass.uri,subjectClass.alias);
  });

  //Adds first Subject
  $scope.addSubject('/app/mockup/Person.json', "Mensch");

  //Removes the selected subject !!! FUNCTION IS NOT CALLED BY property.html DOES ANYBODY KNOW WHY?
  // yes we know: u must give the splice-function the instance of subject
  $scope.removeSubject = function(subjectInst) {
    $scope.subjects.splice($scope.subjects.indexOf(subjectInst), 1);
  }

  $scope.translate = function(){
      $scope.result = "";
      for(var key in $scope.subjects){
          var currSubject = angular.copy($scope.subjects[key]);
          delete currSubject["availableProperties"];
          $scope.result += JSON.stringify(currSubject) + "\n";
      }
  }

}]);  