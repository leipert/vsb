'use strict';
/**
 * SubjectCollectionCtrl
 * Controller for all subjects.
 */

angular.module('GSB.controllers.subjectCollection', ['ngSanitize', 'ui.select', 'GSB.config', 'GSB.services.endPoint'])
    //Inject $scope, $log, EndPointService and globalConfig (see @ js/config.js, @js/services/endPoint.js) into controller
    .controller('SubjectCollectionCtrl', ['$scope', '$q', '$log', 'EndPointService', 'globalConfig', 'TranslatorManager', function ($scope, $q, $log, EndPointService, globalConfig, TranslatorManager) {

        $scope.highlightedSubject = null; //
        $scope.mainSubjectSelected = null; //The subject connected with the start point

        //  List of available subject classes that can be added to the workspace.
        $scope.availableSubjectClasses = [];

        //  Subject selected to be added to the workspace.
        $scope.selectedSubjectClass = undefined;

        $scope.uiAddSubject = function () {
            if ($scope.selectedSubjectClass) { // If the selected option is undefined no subject will be added.
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
            $scope.initialisedSubjects = true;
            $scope.subjects.push(
                {
                    alias: createUniqueAlias(alias, uri),
                    label: alias,
                    uri: uri,
                    comment: comment,
                    classURIs: [uri],
                    view: true,
                    selectedProperties: [],
                    availableProperties: [],
                    selectedAggregates: [],
                    showAdditionalFields: true
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
            $log.info('Subject added');
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
            if (newAlias.length === 0) {
                newAlias = uri;
            }

            do {
                for (key in $scope.subjects) {
                    if ($scope.subjects.hasOwnProperty(key)) {
                        if ($scope.subjects[key].alias === newAlias) {
                            aliasUnique = false;
                            newAlias = alias + '_' + c;
                            c += 1;
                            break;
                        }
                        aliasUnique = true;
                    }
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
        var json = JSON.parse('{"START":{"type":"LIST_ALL","linkTo":"contract-dynamic"},"SUBJECTS":[{"alias":"contract-dynamic","label":"contract-dynamic","uri":"http://vocab.ub.uni-leipzig.de/bibrm/LicenseContract","comment":"A class modeling rdf:type business contract between the library and one or more parties. This one contains the dynamic properties of rdf:type contract","classURIs":["<http://vocab.ub.uni-leipzig.de/bibrm/LicenseContract>"],"pos": {"x": 820,"y": 359},"view":true,"showAdditionalFields":true,"$$hashKey":"012","properties":[{"alias":"gekündigt am","comment":"Das Datum, an welchem ein Vertrag/Abo gekündigt wurde","uri":"http://vocab.ub.uni-leipzig.de/bibrm/terminationDate","type":"DATE_PROPERTY","propertyRange":["<http://www.w3.org/2001/XMLSchema#date>"],"view":true,"optional":false,"operator":"MUST","link":null,"arithmetic":null,"compare":null,"compareRaw":{"dateComparison":null,"comparisonInput":""},"$$hashKey":"01V","linkTo":null},{"alias":"Lizenzgeber","comment":"Die Vertragspartei, die eine Lizenz zur Verfügung stellt. Für uns wird hier immer der Verlag eingetragen. (s. weitere Felder: Konsortium, Zahlungsempfänger, Hersteller [Creator])","uri":"http://vocab.ub.uni-leipzig.de/bibrm/licensor","type":"OBJECT_PROPERTY","propertyRange":["<http://xmlns.com/foaf/0.1/Organization>"],"view":true,"optional":false,"operator":"MUST","link":null,"arithmetic":null,"compare":null,"compareRaw":{},"$$hashKey":"03M","linkTo":null}]}]}');
        $scope.fillScopeWithSubjects(TranslatorToGSBL.translateJSONToGSBL(json));

        EndPointService.getAvailableClasses()
            .then(function (classes) {
                $scope.availableSubjectClasses = classes;
            })
            .fail(function (err) {
                $log.error('An error occurred: ', err);
            });

    }]);