(function () {
    'use strict';

    angular.module('VSB.layout.result', [ 'VSB.config', 'SPARQLJS'])
        .filter('deepOrderBy', deepOrderBy)
        .controller('ResultCtrl', ResultCtrl);

    function ResultCtrl($scope, ParserManager, globalConfig, $filter, sparqljs) {
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
            resultFormat : globalConfig.resultFormats[0]
        };

        $scope.openInNewTab = function () {
            if ($scope.runQuery.$invalid) {
                $scope.runQuery.$submitted = true;
                return;
            }
            var win = window.open(createQueryURL($scope.queryExecutor), '_blank');
            win.focus();
        };

        function createQueryURL(queryExecutor) {
            var format = '&format=' + encodeURIComponent(queryExecutor.resultFormat.format);
            var query = sparqljs.parse($scope.translatedSPARQL);
            query.limit = queryExecutor.limit;
            query.offset = queryExecutor.offset;
            query = sparqljs.stringify(query);

            var defaultGraphs = '';

            if (queryExecutor.resultFormat.qtxt) {
                query = '&qtxt=' + encodeURIComponent(query);
                defaultGraphs = '';
            } else {
                query = '&query=' + encodeURIComponent(query);
                globalConfig.defaultGraphURIs.forEach(function (graph) {
                    defaultGraphs += '&default-graph-uri=' + encodeURIComponent(graph);
                });
            }

            if (queryExecutor.endpoint.indexOf('?') === -1) {
                return queryExecutor.endpoint + '?' + format + defaultGraphs + query;
            }

            return queryExecutor.endpoint + format + defaultGraphs + query;
        }

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

        //TODO: Refactor

        //$scope.$on('SPARQLUpdateEvent', function (event, sponateMap) {
        //    EndPointService.runSponateMap(sponateMap).then(
        //        function (data) {
        //            $scope.resultHead = [];
        //            $scope.resultData = (_(data).chain().pluck('val').pluck('rows').flatten(true).value());
        //            _($scope.resultData).chain().map(function (x) {
        //                return _.keys(x);
        //            }).flatten().uniq().value().forEach(function (head) {
        //                if (head !== 'id') {
        //                    $scope.resultHead.push({title: head, field: head, visible: true, sortable: head});
        //                }
        //            });
        //            $scope.$apply();
        //        }
        //    );
        //});
        //
        //var getData = function () {
        //    return angular.copy($scope.resultData);
        //};
        //
        //$scope.resultType = function (data) {
        //    if (_.isString(data)) {
        //        return 'string';
        //    }
        //    if (_.isDate(data)) {
        //        return 'date';
        //    }
        //    if (_.isObject(data)) {
        //        if (data.hasOwnProperty('id') && data.hasOwnProperty('label')) {
        //            return 'uri';
        //        }
        //        if (data.hasOwnProperty('lexicalValue') && data.hasOwnProperty('datatypeUri')) {
        //            return 'lexicalValue';
        //        }
        //        return 'object';
        //    }
        //};
        //
        //$scope.extractLabelFromURI = function (uri) {
        //    return EndPointService.extractLabelFromURI(uri);
        //};
        //
        //
        ///*jshint newcap: false */
        //$scope.tableParams = new ngTableParams(
        //    /*jshint newcap: true */
        //    {
        //        page: 1,            // show first page
        //        total: 0,
        //        count: 10,          // count per page
        //        sorting: {},
        //        filter: {}
        //    }, {
        //        getData: function ($defer, params) {
        //            var filteredData = params.filter() ?
        //                $filter('filter')(getData(), params.filter()) :
        //                getData();
        //            var orderedData = params.sorting() ?
        //                $filter('deepOrderBy')(filteredData, params.orderBy()) :
        //                filteredData;
        //            $scope.tlength = orderedData.length;
        //            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        //        },
        //        $scope: {$data: {}}
        //    }
        //);
        //
        //$scope.$watchCollection('resultData', function () {
        //    $scope.tableParams.reload();
        //});
        //
        //$scope.$watch('tlength', function (nv) {
        //    $scope.tableParams.total(nv);
        //    $scope.tableParams.reload();
        //});
    }

    function deepOrderBy() {
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
    }

})();