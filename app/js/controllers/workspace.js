'use strict';

/**
 * WorkspaceCtrl
 * Controller which holds all the subjects.
 * TODO: Better definition what this controller actually does
 */

angular.module('GSB.controllers.workspace', ['GSB.config', 'GSB.services.availableClasses'])
  //Inject $scope, $log, AvailableClassesService and globalConfig (see @ js/config.js, @js/services/availableClasses.js) into controller
  .controller('WorkspaceCtrl', ['$scope', '$log', 'AvailableClassesService', 'globalConfig', function ($scope, $log, AvailableClassesService, globalConfig) {

    //** FUNCTIONS START **//

    /**
     * a function which adds a new subject with an uri, alias and comment
     *
     * TODO: Handle empty alias (maybe in createUniqueAlias) & empty comment
     *
     * @param uri
     * @param alias
     * @param comment
     */
    $scope.addSubject = function (uri, alias, comment) {
      $log.info('Subject added');
      alias = $scope.createUniqueAlias(alias, uri);
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
      //If there is only one subject, it will be the one selected by the startPoint (automatically).
      //TODO: Move to separate $watch ???
      if ($scope.subjects.length === 1) {
        $scope.mainSubjectSelected = $scope.subjects[0];
      }
    };

    /**
     * returns a unique alias for a given alias
     *
     * TODO: Handle empty alias
     *
     * @param alias
     * @param uri
     * @returns {*}
     */
    $scope.createUniqueAlias = function (alias, uri) {
      var aliasUnique = true,
        newAlias = alias,
        key = null,
        c = 1;

        //Handling for empty alias, try an extract of uri
        if (newAlias.length==0)
        {newAlias = uri;}

      do {
        for (key in $scope.subjects) {
          if ($scope.subjects.hasOwnProperty(key)) {
            if ($scope.subjects[key].alias === newAlias) {
              aliasUnique = false;
              newAlias = alias + "_" + c;
              break;
            }
            aliasUnique = true;
          }
          c += 1;
        }
      } while (!aliasUnique);
      return newAlias;
    };

    /**
     * Removes a given subject from the Workspace
     * @param subjectInst
     */
    $scope.removeSubject = function (subjectInst) {
      $scope.subjects.splice($scope.subjects.indexOf(subjectInst), 1);
      //If there is only one subject, it will be the one selected by the startPoint automatically .
      //TODO: Move to separate $watch ???
      if ($scope.subjects.length === 1) {
        $scope.mainSubjectSelected = $scope.subjects[0];
      }
    };


    /**
     * translates the GSBL to JSON
     * TODO: Make it nicer
     * TODO: Move it to a own service|factory ???
     * @namespace currentProperty.link.linkPartner
     */
    $scope.translateGSBLToJSON = function () {
      $log.info('Translate GSBL to JSON');
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
      //Converts the 'json'-named-object to JSON notation
      $scope.translatedJSON = JSON.stringify(json, null, 2);
    };

    /**
     * translates the JSON to SPARQL
     * TODO: Make it nicer
     * TODO: Move it to a own service|factory ???
     */
    $scope.translateJSONtoSPARQL = function () {
      $log.info('Translate JSON to SPARQL');
      $scope.translateGSBLToJSON();
      if ($scope.translatedJSON == null) {
        $log.error("JSON is not valid");
        return;
      }
      $scope.translatedSPARQL = translateAllFromString($scope.translatedJSON);
    };

    /**
     * Initializes the Workspace
     */
    $scope.initializeWorkspace = function () {
      $log.info('Initialize Workspace');
      $scope.availableSubjectClasses = [];
      $scope.subjects = [];
      $scope.highlightedSubject = null;
      $scope.translatedJSON = "In the near future the translated JSON will be here.";
      $scope.translatedSPARQL = "In the near future the translated SPARQL will be here.";
      $scope.mainSubjectSelected = null;
      $scope.expertView = false;
      AvailableClassesService.get($scope.availableSubjectClasses);
    };

    /**
     * Change the View of the given Subject
     * TODO: Maybe move it to own controller?
     * @param subjectInst
     */
    $scope.toggleSubjectView = function (subjectInst) {
      subjectInst.view = !subjectInst.view;
    };

    /**
     * Open the SPARQL Query in a new dbpedia tab
     * TODO: implement our own Result view ;)
     */
    $scope.openInNewTab = function () {
      var win = window.open(globalConfig.queryURL + encodeURIComponent($scope.translatedSPARQL), '_blank');
      win.focus();
    };

    //** FUNCTIONS END **//

    //Initialize Workspace and add two subjects to it (for easier testing).
    $scope.initializeWorkspace();
    $scope.addSubject('mockup/Person.json', "Mensch", "Ein Individuum der Spezies Mensch.");
    $scope.addSubject('mockup/Stadt.json', "Stadt", "Eine Siedlung, größer als ein Dorf.");

    /**
     * New Event. If this event is broadcast by another service or controller,
     * a new subject will be added
     *
     * @param $event The $event which has been triggered
     * @param subjectClass
     * @namespace subjectClass.uri
     * @namespace subjectClass.alias
     * @namespace subjectClass.comment
     */
    $scope.$on('newSubjectEvent', function ($event, subjectClass) {
      if(subjectClass.hasOwnProperty('uri')) {
        $scope.addSubject(subjectClass.uri, subjectClass.alias, subjectClass.comment);
      }else{
        $log.error('newSubjectEvent - no URI provided');
      }
    });

  }]);