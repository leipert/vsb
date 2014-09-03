'use strict';

/**
 * MainCtrl
 * Controller that controls mainly everything.
 */

angular.module('GSB.controllers.main', ['GSB.config', 'ngTable'])
//Inject $scope, $log and globalConfig (see @ js/config.js) into controller
    .controller('MainCtrl', function ($scope, $log, globalConfig, $http, $translate, languageStorage, EndPointService, ngTableParams, $filter) {
        var language;
        $scope.changeLanguage = function (langKey) {
            language = langKey;
            $translate.use(langKey);
        };

        $http.get('locale.json').success(function (data) {
            languageStorage.mergeLanguages(data);
            $translate.refresh();
        });

        //Some drag and drop variables
        $scope.showArea = 'workspace';
        $scope.initialisedSubjects = false;
        $scope.offsetX = 0;
        $scope.offsetY = 0;
        $scope.mouseDownAct = false;
        $scope.theMouseDown = function ($event) {
            $scope.offsetX = 0;
            $scope.offsetY = 0;
            $scope.startX = $event.pageX;
            $scope.startY = $event.pageY;
            $scope.mouseDownAct = true;
        };

        $scope.theMouseMove = function ($event) {
            if ($scope.mouseDownAct) {
                $scope.offsetX = $event.pageX - $scope.startX;
                $scope.offsetY = $event.pageY - $scope.startY;
                $scope.startX = $event.pageX;
                $scope.startY = $event.pageY;
            }
        };

        $scope.theMouseUp = function () {
            $scope.offsetX = 0;
            $scope.offsetY = 0;
            $scope.mouseDownAct = false;
        };

        $scope.resultHead = [];

        $scope.resultData = [];

        $scope.$on('SPARQLUpdateEvent', function (event, newSPARQL) {
            EndPointService.runSPARQLQuery(newSPARQL).then(
                function (data) {
                    $scope.resultHead = [];
                    data.head.vars.filter(function (c, i, a) {
                        return !(_.endsWith(c, '_label') && _.contains(a, c.replace(/_label$/, '')));
                    }).forEach(function (head) {
                        $scope.resultHead.push({title: head, field: head, visible: true, sortable: head});
                    });
                    $scope.resultData = data.results.bindings;
                    $scope.$apply();
                }
            );
        });

        var getData = function () {
            return angular.copy($scope.resultData);
        };

        /*jshint newcap: false */

        $scope.tableParams = new ngTableParams(
            /*jshint newcap: true */
            {
                page: 1,            // show first page
                total: 0,
                count: 10,          // count per page
                sorting: {},
                filter: {}
            }, {
                getData: function ($defer, params) {
                    var filteredData = params.filter() ?
                        $filter('filter')(getData(), params.filter()) :
                        getData();
                    var orderedData = params.sorting() ?
                        $filter('deepOrderBy')(filteredData, params.orderBy()) :
                        filteredData;
                    $scope.tlength = orderedData.length;
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                },
                $scope: {$data: {}}
            }
        );

        $scope.$watchCollection('resultData', function () {
            $scope.tableParams.reload();
        });

        $scope.$watch('tlength', function (nv) {
            $scope.tableParams.total(nv);
            $scope.tableParams.reload();
        });

        /**
         * Triggers translation event
         */
        $scope.translate = function () {

            $scope.$broadcast('translationEvent',language);

        };

        /**
         * Triggers save JSON event
         */
        $scope.saveJSON = function () {

            $scope.$broadcast('saveJsonEvent');

        };

        /**
         * Calls the function for resetting workspace
         */
        $scope.resetWorkspace = function () {
            $scope.clearWorkspace();

        };
        /**
         * Triggers load JSON event
         */
        $scope.loadJSON = function () {

            $scope.resetWorkspace();
            $scope.$broadcast('loadJsonEvent');

        };


        /**
         * Initializes the Workspace
         */
        $scope.initializeWorkspace = function () {
            $log.debug('Initialized Workspace');
            $scope.translatedJSON = 'In the near future the translated JSON will be here.';
            $scope.translatedSPARQL = 'In the near future the translated SPARQL will be here.';
            $scope.expertView = false;
        };


        /**
         * Clears the Workspace
         */
        $scope.clearWorkspace = function () {
            $log.debug('Cleared Workspace');
            $scope.$broadcast('removeAllSubjectsEvent');
            $scope.translatedJSON = 'In the near future the translated JSON will be here.';
            $scope.translatedSPARQL = 'In the near future the translated SPARQL will be here.';
            $scope.expertView = false;
        };

        //Initialize Workspace
        $scope.initializeWorkspace();

        $scope.$on('enableButton', function () {
            $scope.disableRun = false;
        });
        $scope.$on('disableButton', function () {
            $scope.disableRun = true;
        });

        /** FOLGENDES MUSS AUS DIESEM CONTROLLER RAUS! **/

        /**
         * Open the SPARQL Query in a new dbpedia tab
         */
        $scope.openInNewTab = function () {
            var win = window.open(globalConfig.resultURL + encodeURIComponent($scope.translatedSPARQL), '_blank');
            win.focus();
        };


    }).filter('deepOrderBy', function () {
        return function (collection, field) {
            if (field.length === 0) {
                return collection;
            }
            var sortOrder = 1;
            if (_.startsWith(field[0], '-')) {
                sortOrder = -1;
            }
            field = field[0].substring(1);

            return collection.sort(function (obj1, obj2) {
                return sortOrder * obj1[field].value.localeCompare(obj2[field].value);
            });
        };
    });