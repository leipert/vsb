'use strict';
/**
 * SubjectCollectionCtrl
 * Controller for all subjects.
 */

angular.module('GSB.controllers.subjectCollection', ['ngSanitize', 'ui.select', 'GSB.config', 'GSB.services.endPoint'])
    //Inject $scope, $log, EndPointService and globalConfig (see @ js/config.js, @js/services/endPoint.js) into controller
    .controller('SubjectCollectionCtrl', ['$scope', '$q', '$log', 'EndPointService', 'globalConfig', 'TranslatorManager', 'TranslatorToGSBL',
        function ($scope, $q, $log, EndPointService, globalConfig, TranslatorManager, TranslatorToGSBL) {

        $scope.highlightedSubject = null; //
        $scope.mainSubjectSelected = null; //The subject connected with the start point

        //  List of available subject classes that can be added to the workspace.
        $scope.availableSubjectClasses = [];

        //  Subject selected to be added to the workspace.
        $scope.selectedSubjectClass = undefined;

        $scope.uiAddSubject = function () {
            if ($scope.selectedSubjectClass) { // If the selected option is undefined no subject will be added.
                var newSubject = $scope.selectedSubjectClass;
                addSubject(newSubject.uri, newSubject.$label, newSubject.$comment);
                $scope.selectedSubjectClass = undefined;
            }
        };

        /**
         * a function which adds a new subject with an uri, alias and comment
         *
         * TODO: Handle empty alias (maybe in createUniqueAlias) & empty comment
         *
         * @param uri
         * @param $label
         * @param $comment
         */
        var addSubject = function (uri, $label, $comment) {
            $log.info('Subject added');
            $scope.initialisedSubjects = true;
            $scope.subjects.push(
                {
                    alias: createUniqueAlias($label, uri),
                    $label: $label,
                    uri: uri,
                    $comment: $comment,
                    $classURIs: [uri],
                    view: true,
                    $selectedProperties: [],
                    $availableProperties: [],
                    $selectedAggregates: [],
                    pos: {}
                }
            );
            //If there is only one subject, it will be the one selected by the startPoint (automatically).
            //TODO: Move to separate $watch ???
            if ($scope.subjects.length === 1) {
                $scope.mainSubjectSelected = $scope.subjects[0];
            }
        };

        /**
         * a function which adds a new subject given as a subjectObject
         * @param {object} subjectObject a JSON/scope correctly formatted subject
         */
        var addSubjectObject = function (subjectObject) {
            $log.info('Subject added',subjectObject);
            $scope.subjects.push(subjectObject);
            //If there is only one subject, it will be the one selected by the startPoint (automatically).
            if ($scope.subjects.length === 1) {
                $scope.mainSubjectSelected = $scope.subjects[0];
            }
        };

        /**
         * returns a unique alias for a given alias
         *
         * TODO: Handle empty alias
         *
         * @param $label
         * @param uri
         * @returns {*}
         */
        var createUniqueAlias = function ($label) {
            var aliasUnique = true,
                alias = $label,
                key = null,
                c = 1;

            do {
                for (key in $scope.subjects) {
                    if ($scope.subjects.hasOwnProperty(key)) {
                        if ($scope.subjects[key].alias === alias) {
                            aliasUnique = false;
                            alias = $label + '_' + c;
                            c += 1;
                            break;
                        }
                        aliasUnique = true;
                    }
                }
            } while (!aliasUnique);
            return alias;
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
         * Removes all subjects from the Workspace
         */
        $scope.removeAllSubjects = function () {
            {
                $scope.subjects.splice(0, $scope.subjects.length);
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
        $scope.$on('setHighLightTo', function (event, data) {
            $scope.highlightedSubject = data;
        });

        $scope.$on('translationEvent', function () {
            TranslatorManager.translateGSBLToSPARQL($scope.mainSubjectSelected, $scope.subjects);
            TranslatorManager.prepareSaveLink($scope.mainSubjectSelected, $scope.subjects);
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

        $scope.$on('SPARQLUpdateEvent', function (event, newSPARQL) {
            $scope.$parent.translatedSPARQL = newSPARQL;
        });

        $scope.$on('WorkspaceUpdateFromJSONEvent', function (scope, newWorkspaceContent) {
            $scope.fillScopeWithSubjects(newWorkspaceContent);
        });
        // 		 ----------------------------------------------------

        //Set workspace to initial state
        $scope.availableSubjectClasses = [];
        $scope.subjects = [];
//        var json = JSON.parse('{"START":{"type":"LIST_ALL","linkTo":"contract-dynamic"},"SUBJECTS":[{"pos":{"x":300,"y":250},"alias":"contract-dynamic","uri":"http://vocab.ub.uni-leipzig.de/bibrm/LicenseContract","view":true,"properties":[{"alias":"gekündigt am","uri":"http://vocab.ub.uni-leipzig.de/bibrm/terminationDate","type":"DATE_PROPERTY","view":true,"optional":false,"filterNotExists":false,"linkTo":null,"arithmetic":null,"compare":null,"compareRaw":{"dateComparison":null,"comparisonInput":null}},{"alias":"Lizenzgeber","uri":"http://vocab.ub.uni-leipzig.de/bibrm/licensor","type":"OBJECT_PROPERTY","view":true,"optional":false,"filterNotExists":false,"linkTo":null,"arithmetic":null,"compare":null,"compareRaw":{}}]}]}');
//        $scope.fillScopeWithSubjects(TranslatorToGSBL.translateJSONToGSBL(json));

        EndPointService.getAvailableClasses()
            .then(function (classes) {
                $log.info('Classes loaded', classes);
                $scope.availableSubjectClasses = classes;
            })
            .fail(function (err) {
                $log.error('An error occurred: ', err);
            });

    }]);