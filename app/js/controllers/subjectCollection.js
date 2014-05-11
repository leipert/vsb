'use strict';
/**
 * SubjectCollectionCtrl
 * Controller for all subjects.
 */

angular.module('GSB.controllers.subjectCollection', ['ngSanitize','ui.select','GSB.config', 'GSB.services.availableClasses'])
  //Inject $scope, $log, AvailableClassesService and globalConfig (see @ js/config.js, @js/services/availableClasses.js) into controller
  .controller('SubjectCollectionCtrl', ['$scope', '$q', '$log','AvailableClassesService', 'globalConfig', 'TranslatorManager', function ($scope, $q, $log, AvailableClassesService, globalConfig, TranslatorManager) {

    $scope.highlightedSubject = null; //
    $scope.mainSubjectSelected = null; //The subject connected with the start point

    //  List of available subject classes that can be added to the workspace.
    $scope.availableSubjectClasses = [];

    //  Subject selected to be added to the workspace.
    $scope.selectedSubjectClass = undefined;

    $scope.uiAddSubject = function() {
      if($scope.selectedSubjectClass) { // If the selected option is undefined no subject will be added.
        var newSubject = $scope.selectedSubjectClass;
        addSubject(newSubject.uri, newSubject.alias, newSubject.comment);
        $scope.selectedSubjectClass = undefined;
      }
    };

    /**
     * a function which adds a new subject with an uri, alias and comment
     *
     * TODO: Handle empty alias (maybe in createUniqueAlias) & empty comment
     *
     * @param uri
     * @param alias
     * @param comment
     */
    var addSubject = function (uri, alias, comment) {
      $log.info('Subject added');
      alias = createUniqueAlias(alias, uri);
      $scope.subjects.push(
        {
          alias: alias,
          label: alias,
          uri: uri,
          comment: comment,
          view: true,
          selectedProperties: [],
          availableProperties: {},
          selectedInverseProperties: [],
          availableInverseProperties: {},
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
    var createUniqueAlias = function (alias, uri) {
      var aliasUnique = true,
        newAlias = alias,
        key = null,
        c = 1;

      //Handling for empty alias, try an extract of uri
      if (newAlias.length == 0) {
        newAlias = uri;
      }

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

	
	/*
     * 		------  EVENT HANDLING  -----------------------------
     */
    $scope.$on('setHighLightTo',function(event,data) {
        $scope.highlightedSubject = data;
      });
	  
	$scope.$on('translationEvent',function() {
	
      TranslatorManager.translateGSBLToSPARQL($scope.mainSubjectSelected, $scope.subjects);
      TranslatorManager.prepareSaveLink($scope.mainSubjectSelected, $scope.subjects);
    });

    $scope.$on('saveJsonEvent',function() {

            TranslatorManager.saveAsJSON($scope.mainSubjectSelected, $scope.subjects);
        });

    $scope.$on('loadJsonEvent',function() {

            TranslatorManager.loadJSON($scope.mainSubjectSelected, $scope.subjects);
        });


        $scope.$on('JSONUpdateEvent',function(event, newJSON) {
	
      $scope.$parent.translatedJSON = newJSON;
    });  
	  
	  
	$scope.$on('SPARQLUpdateEvent',function(event, newSPARQL) {
	
      $scope.$parent.translatedSPARQL = newSPARQL;
    });
	// 		 ----------------------------------------------------  

	  
    $scope.availableSubjectClasses = [];
    $scope.subjects = [];
    AvailableClassesService.getAvailableClasses($scope.availableSubjectClasses)
      .then(function() {
        console.log('Available classes loaded', $scope.availableSubjectClasses)
      }, function(error) {
        console.log(error)
      });
    addSubject('http://dbpedia.org/ontology/Person', "Person", "Ein Individuum der Spezies Mensch.");
    

  }]);