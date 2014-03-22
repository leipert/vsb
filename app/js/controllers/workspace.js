'use strict';

/* Controllers */

angular.module('GSB.controllers.workspace', [])
.controller('WorkspaceCtrl', ['$scope', function($scope) {
  //Initial State of Subjects
  $scope.subjects = [];
  $scope.translatedJSON = "In the near future the translated JSON will be here.";
  $scope.translatedSPARQL = "In the near future the translated SPARQL will be here.";
  $scope.mainSubjectSelected = null;

  // Adds Subject with the provided URI and Alias
  $scope.addSubject = function(uri, alias) {
    alias = $scope.createUniqueAlias(alias);
    $scope.subjects.push(
      {
        alias: alias,
        uri: uri,
        selectedProperties: [],
        availableProperties: {}
      }
    );
  };

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
  };

  //Eventlistener. If this Event is called, a new Subject will be created.
  $scope.$on('newSubjectEvent', function($event, subjectClass) {
      $scope.addSubject(subjectClass.uri,subjectClass.alias);
  });

  //Adds first Subject
  $scope.addSubject('/app/mockup/Person.json', "Mensch");
  $scope.addSubject('/app/mockup/Stadt.json', "Stadt");

  //Removes the selected subject !!! FUNCTION IS NOT CALLED BY property.html DOES ANYBODY KNOW WHY?
  // yes we know: u must give the splice-function the instance of subject
  $scope.removeSubject = function(subjectInst) {
    $scope.subjects.splice($scope.subjects.indexOf(subjectInst), 1);
  };

  //Translate GSBL to JSON
  $scope.translateGSBLToJSON = function(){
    var json = {
        START: {
          type: "LIST_ALL",
          "link": {
            "direction" :"TO",
            "linkPartner" : $scope.mainSubjectSelected.alias
          }
        },
        SUBJECTS: []
      },
      allSubjects = angular.copy($scope.subjects)
    allSubjects.map(function(currentSubject){
      delete currentSubject["availableProperties"];
      currentSubject.properties = currentSubject["selectedProperties"];
      delete currentSubject["selectedProperties"];
      return currentSubject;
    });
    json.SUBJECTS = allSubjects;
    $scope.translatedJSON = JSON.stringify(json, null, 2);
  };

    //TODO: Translation from JSON to SPARQL ( Issue #6)
    $scope.translateJSONtoSPARQL = function(){
      $scope.translateGSBLToJSON();
    };

}]);  