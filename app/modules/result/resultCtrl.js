(function () {
    'use strict';
    angular.module('VSB.layout.result', [])
        .filter('deepOrderBy', deepOrderBy)
        .controller('ResultCtrl', ResultCtrl);

    function ResultCtrl($scope, ParserManager, globalConfig, $filter) {
        //ngTableParams, EndPointService
        //var vm = this;
        $scope.resultHead = [];

        $scope.resultData = [];

        $scope.showQueries = true;

        $scope.resultFormats = globalConfig.resultFormats;
        $scope.currentFormat = globalConfig.resultFormats[0];

        var JSON = ParserManager.translateVSBLToSPARQL();

        $scope.translatedJSON = JSON.json;
        var prefixes = '';
        _.forEach(globalConfig.prefixes, function (uri, prefix) {
            prefixes += 'prefix ' + prefix + ': <' + uri + '> \n';
        });
        $scope.translatedSPARQL = prefixes + '\n' + beautifySPARQL(JSON.sparql.toString());

        function beautifySPARQL(query) {
            query = $filter('beautifySPARQL')(query);
            query = $filter('replaceURIsWithPrefixes')(query);
            return query;
        }

        /**
         * Open the SPARQL Query in a new dbpedia tab
         */


        $scope.openInNewTab = function () {
            var win = window.open(createQueryURL(), '_blank');
            win.focus();
        };

        function createQueryURL() {
            var format = '&format=' + encodeURIComponent($scope.currentFormat.format);
            var query = '&query=' + encodeURIComponent($scope.translatedSPARQL);
            var defaultGraphs = '';
            globalConfig.defaultGraphURIs.forEach(function (graph) {
                defaultGraphs += '&default-graph-uri=' + encodeURIComponent(graph);
            });

            if ($scope.currentFormat.qtxt) {
                query = '&qtxt=' + encodeURIComponent($scope.translatedSPARQL);
                defaultGraphs = '';
            }

            if (globalConfig.resultURL.indexOf('?') === -1) {
                return globalConfig.resultURL + '?' + format + defaultGraphs + query;
            }

            return globalConfig.resultURL + format + defaultGraphs + query;
        }

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