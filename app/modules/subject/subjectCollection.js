(function () {
    'use strict';
    /**
     * SubjectCollectionCtrl
     * Controller for all subjects.
     */

    angular.module('GSB.subject.collection', ['ngSanitize', 'ui.select', 'GSB.config', 'GSB.endPointService', 'GSB.parser', 'GSB.arrowService', 'LocalForageModule'])
        //Inject $scope, $log, EndPointService and globalConfig (see @ js/config.js, @js/services/endPoint.js) into controller
        .controller('SubjectCollectionCtrl', SubjectCollectionCtrl);
    function SubjectCollectionCtrl($scope, $q, $log, EndPointService, globalConfig, TranslatorManager, TranslatorToGSBL, $localForage, $translate, ArrowService) {

        $scope.mainSubjectSelected = null; //The subject connected with the start point

        //  List of available subject classes that can be added to the workspace.
        $scope.availableSubjectClasses = [];

        //  Subject selected to be added to the workspace.
        $scope.selectedSubjectClass = undefined;

        $scope.uiAddSubject = function () {
            if ($scope.selectedSubjectClass) { // If the selected option is undefined no subject will be added.
                var newSubject = $scope.selectedSubjectClass;
                addSubject(newSubject.uri);
                $scope.selectedSubjectClass = undefined;
            }
        };

        /**
         * a function which adds a new subject with an uri, alias and comment
         *
         * @param uri
         */
        var addSubject = function (uri) {
            $log.debug('SUBJECT added ' + uri);
            $scope.initialisedSubjects = true;
            $scope.subjects.push(
                {
                    uri: uri,
                    $classURIs: [uri],
                    view: true,
                    $selectedProperties: [],
                    $availableProperties: [],
                    $selectedAggregates: [],
                    pos: {}
                }
            );
            //If there is only one subject, it will be the one selected by the startPoint (automatically).

        };

        $scope.$watchCollection('subjects', function (nv) {
            if (nv.length === 0) {
                $scope.$emit('disableButton');
            } else {
                $scope.$emit('enableButton');
            }
            if (nv.length === 1) {
                $scope.mainSubjectSelected = nv[0];
            }
        });

        /**
         * a function which adds a new subject given as a subjectObject
         * @param {object} subjectObject a JSON/scope correctly formatted subject
         */
        var addSubjectObject = function (subjectObject) {
            $log.debug('SUBJECT added ' + subjectObject.uri, subjectObject);
            $scope.subjects.push(subjectObject);
            //If there is only one subject, it will be the one selected by the startPoint (automatically).
        };

        $scope.doesAliasExist = function (alias) {
            return _.filter($scope.subjects, {alias: alias}).length > 0;
        };

        /**
         * Removes a given subject from the Workspace
         * @param subjectInst
         */
        $scope.removeSubject = function (subjectInst) {
            $scope.subjects.splice($scope.subjects.indexOf(subjectInst), 1);
            ArrowService.deleteAllConnections(subjectInst.$id);
            angular.forEach(subjectInst.$selectedProperties, function (property) {
                ArrowService.deleteAllConnections(property.$id);
            });
        };


        /**
         * Removes all subjects from the Workspace
         */
        $scope.removeAllSubjects = function () {
            {
                $scope.subjects = [];
            }
        };

        /**
         * Adds all loaded subjects to the Workspace
         *
         * ### TESTFILES: app/test/data/query_test_loadJSON.json
         *                app/test/data/query_test_loadJSON.png
         *
         * @param newWorkspaceContent
         */
        $scope.fillScopeWithSubjects = function (newWorkspaceContent) {
            //Iterate over subjects
            for (var i = 0; i < newWorkspaceContent[0].length; i++) {
                addSubjectObject(newWorkspaceContent[0][i]);
            }

            //Add the connection from startpoint to selected subject
            $scope.mainSubjectSelected = newWorkspaceContent[1];

        };

        /*
         * 		------  EVENT HANDLING  -----------------------------
         */

        $scope.$on('translationEvent', function (event, language) {
            TranslatorManager.translateGSBLToSPARQL($scope.mainSubjectSelected, $scope.subjects, language);
            //TranslatorManager.prepareSaveLink($scope.mainSubjectSelected, $scope.subjects);
        });

        $scope.$on('saveJsonEvent', function () {
            TranslatorManager.saveAsJSON($scope.mainSubjectSelected, $scope.subjects);
        });

        $scope.$on('loadJsonEvent', function () {
            TranslatorManager.loadJSON($scope.mainSubjectSelected, $scope.subjects);
        });

        $scope.$on('removeAllSubjectsEvent', function () {
            $scope.removeAllSubjects();
        });

        $scope.$on('JSONUpdateEvent', function (event, newJSON) {
            $scope.$parent.translatedJSON = newJSON;
        });

        $scope.$on('SPARQLQueryUpdateEvent', function (event, newSPARQL) {
            $scope.$parent.translatedSPARQL = newSPARQL.toString();
        });

        $scope.$on('WorkspaceUpdateFromJSONEvent', function (scope, newWorkspaceContent) {
            $scope.fillScopeWithSubjects(newWorkspaceContent);
        });
        // 		 ----------------------------------------------------

        //Set workspace to initial state
        $scope.availableSubjectClasses = [];
        $scope.subjects = [];

        $localForage.getItem('current')
            .then(function (data) {
                if (data !== null && data.CONFIG === globalConfig.name) {
                    $scope.fillScopeWithSubjects(TranslatorToGSBL.translateJSONToGSBL(data));
                }
            });

        EndPointService.getAvailableClasses()
            .then(function (classes) {
                $log.debug('Classes loaded ', classes);

                $translate.refresh();
                $scope.availableSubjectClasses = classes;
            })
            .catch(function (err) {
                $log.error('An error occurred: ', err);
            });

    }
})();