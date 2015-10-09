(function () {
    'use strict';
    angular.module('SPARQLJS', ['VSB.config', 'VSB.filters'])
        .factory('sparqljs', QueryService);

    function QueryService($filter, globalConfig) {

        var parser = new sparqljs.Parser(globalConfig.prefixes);
        var generator = new sparqljs.Generator();

        return {
            parse: parser.parse,
            stringify: stringify,
            createQueryURL: function(queryExecutor, sparql) {
            var format = '';
            if (queryExecutor.resultFormat) {
                format = '&format=' + encodeURIComponent(queryExecutor.resultFormat.format);
            }
            var query = parser.parse(sparql);
            query.limit = queryExecutor.limit;
            query.offset = queryExecutor.offset;
            query = stringify(query);

            var defaultGraphs = '';

            if (_.get(queryExecutor, 'resultFormat.qtxt', false)) {
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
        };

        function stringify(q){
            var query = _.defaults({prefixes: {}}, q);
            query = generator.stringify(query);
            query = $filter('replaceURIsWithPrefixes')(query, true);
            query = $filter('beautifySPARQL')(query);
            return query;
        }

    }

})();