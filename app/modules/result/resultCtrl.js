(function () {
    'use strict';

    angular.module('VSB.layout.result', ['VSB.config', 'SPARQLJS'])
        .directive('bindingCell', bindingCell)
        .factory('labelService', labelService)
        .controller('ResultCtrl', ResultCtrl);

    function ResultCtrl($scope, ParserManager, globalConfig, $http, $log, sparqljs) {
        //ngTableParams, EndPointService
        //var vm = this;
        $scope.resultHead = [];

        $scope.resultData = [];

        $scope.showQueries = true;

        $scope.resultFormats = globalConfig.resultFormats;

        var JSON = ParserManager.translateVSBLToSPARQL();

        $scope.translatedJSON = JSON.json;

        var query = sparqljs.parse(JSON.sparql.toString());
        $scope.translatedSPARQL = sparqljs.stringify(query);


        $scope.queryExecutor = {
            endpoint: globalConfig.resultURL,
            limit: 100,
            offset: 0,
            resultFormat: globalConfig.resultFormats[0]
        };

        $scope.openInNewTab = function () {
            if ($scope.runQuery.$invalid) {
                $scope.runQuery.$submitted = true;
                return;
            }
            var win = window.open(sparqljs.createQueryURL($scope.queryExecutor, $scope.translatedSPARQL), '_blank');
            win.focus();
        };

        function loadTable() {
            var queryExecutor = angular.copy($scope.queryExecutor);
            queryExecutor.limit = 25;
            delete queryExecutor.resultFormat;
            $http
                .get(sparqljs.createQueryURL(queryExecutor, $scope.translatedSPARQL), {
                    headers: {'Accept': 'application/sparql-results+json'}
                })
                .then(function (data) {
                    $log.debug(data.data);
                    $scope.resultColumns = _.values(_.get(data, 'data.head.vars', {}));
                    $scope.resultRows = _.get(data, 'data.results.bindings', []);
                });
        }

        loadTable();

        $scope.tabs = [


            {
                'title': 'RESULTS_PREVIEW',
                'template': '/modules/result/tabs/preview.tpl.html'
            },
            {
                'title': 'SPARQL_QUERY',
                'template': '/modules/result/tabs/sparql.tpl.html'
            },
            {
                'title': 'JSON',
                'template': '/modules/result/tabs/json.tpl.html'
            }
        ];

    }

    function bindingCell() {
        return {
            restrict: 'E',
            scope: {
                bound: '&'
            },
            templateUrl: '/modules/result/cell.tpl.html',
            controller: detailViewController
        };
    }

    function detailViewController($scope, labelService) {


        $scope.bound = $scope.bound();

        if ($scope.bound.type === 'uri') {

            labelService.getLabel($scope.bound.value)
                .then(function (label) {
                    $scope.label = label;
                });
        }

    }

    function labelService($http, $log, $q, globalConfig,  sparqljs) {
        var cache = {};

        var labelTemplate = _.template(globalConfig.endPointQueries.getLabel);

        var queryExecutor = {
            endpoint: globalConfig.resultURL,
            limit: null,
            offset: null
        };

        return {
            getLabel: function (uri) {
                var label = _.get(cache, uri, false);
                if (label) {
                    return $q.when(label);
                } else {
                    return $http
                        .get(sparqljs.createQueryURL(queryExecutor, labelTemplate({uri: '<' + uri + '>'})), {
                            headers: {'Accept': 'application/sparql-results+json'}
                        })
                        .then(function (data) {
                            label = _.get(data, 'data.results.bindings[0].label.value', false);
                            _.set(cache, uri, label);
                            return label;
                        }, function (error) {
                            $log.warn('error getting label for', uri, error);
                            return false;
                        });
                }
            }
        };
    }


})();