'use strict';

/* Controllers */

angular.module('GSB.controllers.workspace', ['GSB.config', 'GSB.services.availableClasses'])
  .controller('WorkspaceCtrl', ['$scope', '$log', 'AvailableClassesService', 'globalConfig', function ($scope, $log, AvailableClassesService, globalConfig) {
    //Initial State of Subjects
    $scope.subjects = [];
    $scope.highlightedSubject = null;
    $scope.translatedJSON = "In the near future the translated JSON will be here.";
    $scope.translatedSPARQL = "In the near future the translated SPARQL will be here.";
    $scope.mainSubjectSelected = null;
    $scope.expertView = false;
    
    // Adds Subject with the provided URI and Alias
    $scope.addSubject = function (uri, alias, comment) {
      alias = $scope.createUniqueAlias(alias);
      $scope.subjects.push(
        {
          alias: alias,
          label: alias,
          uri: uri,
          comment: comment,
          view: true,
          selectedProperties: [],
          availableProperties: {},
          showAdditionalFields: false
        }
      );
      if ($scope.subjects.length === 1) {
        $scope.mainSubjectSelected = $scope.subjects[0];
      }
    };

    //Checks whether an alias name is unique.
    //If not it will provide us with an unique one.
    $scope.createUniqueAlias = function (alias) {
      var aliasUnique = true,
      newAlias = alias,
      key = null,
      c = 1;
      do {
        for (key in $scope.subjects) {
          if ($scope.subjects[key].alias === newAlias) {
            aliasUnique = false;
            newAlias = alias + "_" + c;
            break;
          }
          aliasUnique = true;
        }
        c += 1;
      } while (!aliasUnique);
      return newAlias;
    };

    //Eventlistener. If this Event is called, a new Subject will be created.
    $scope.$on('newSubjectEvent', function ($event, subjectClass) {
	    $scope.addSubject(subjectClass.uri, subjectClass.alias, subjectClass.comment);
    });


    //Adds first Subject
     //  List of available subject classes that can be added to the workspace.
    $scope.availableSubjectClasses = [];
    AvailableClassesService.get($scope.availableSubjectClasses);
    console.log($scope.availableSubjectClasses);
	  
// Does not work, $scope.availableSubjectClasses stille empty at this point.
// Does sombody know why?
//    $scope.addSubject($scope.asc[0].uri, $scope.asc[0].alias, $scope.asc[0].comment);
//    $scope.addSubject($scope.asc[1].uri, $scope.asc[1].alias, $scope.asc[1].comment);
    $scope.addSubject('mockup/Person.json', "Mensch", "Ein Individuum der Spezies Mensch.");
    $scope.addSubject('mockup/Stadt.json', "Stadt", "Eine Siedlung, größer als ein Dorf.");

    //Removes the selected subject !!! FUNCTION IS NOT CALLED BY property.html DOES ANYBODY KNOW WHY?
    // yes we know: u must give the splice-function the instance of subject
    $scope.removeSubject = function (subjectInst) {
      $scope.subjects.splice($scope.subjects.indexOf(subjectInst), 1);
      if ($scope.subjects.length === 1) {
        $scope.mainSubjectSelected = $scope.subjects[0];
      }
    };

    //Translate GSBL to JSON
    $scope.translateGSBLToJSON = function () {
      if ($scope.mainSubjectSelected == null) {
        $log.error("Main Subject not connected");
        $scope.translatedJSON = null;
        return;
      }
      var json = {
        START: {
          type: "LIST_ALL",
          "link": {
            "direction": "TO",
            "linkPartner": $scope.mainSubjectSelected.alias
          }
        },
        SUBJECTS: []
      },
      allSubjects = angular.copy($scope.subjects);
      allSubjects.map(function (currentSubject) {
        delete currentSubject["availableProperties"];
        currentSubject.properties = currentSubject["selectedProperties"].map(function (currentProperty) {
          delete currentProperty["isObjectProperty"];
          delete currentProperty["propertyType"];
          if (currentProperty.link.linkPartner !== null && currentProperty.link.linkPartner.hasOwnProperty("alias")) {
            currentProperty.link.linkPartner = currentProperty.link.linkPartner.alias;
          } else {
            currentProperty.link = {};
          }
          return currentProperty;
        });
        delete currentSubject["selectedProperties"];
        return currentSubject;
      });
      json.SUBJECTS = allSubjects;
      $scope.translatedJSON = JSON.stringify(json, null, 2);
    };

    //TODO: Translation from JSON to SPARQL ( Issue #6)
    $scope.translateJSONtoSPARQL = function () {
      $scope.translateGSBLToJSON();
      if ($scope.translatedJSON == null) {
        $log.error("JSON is not valid");
        return;
      }
      $scope.translatedSPARQL = translateAllFromString($scope.translatedJSON);
    };

    //Reset workspace function
    $scope.initializeWorkspace = function () {
      $scope.subjects = [];
    };

    $scope.toggleSubjectView = function(subjectInst){
      subjectInst.view = !subjectInst.view;
    }

    $scope.openInNewTab = function () {
        var win=window.open(globalConfig.queryURL + encodeURIComponent($scope.translatedSPARQL), '_blank');
        win.focus();
    }

  }]);