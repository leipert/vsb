(function () {
    'use strict';
    angular.module('SPARQLJS', ['VSB.config', 'VSB.filters'])
        .factory('sparqljs', QueryService);

    function QueryService($filter, globalConfig) {

        var parser = new sparqljs.Parser(globalConfig.prefixes);
        var generator = new sparqljs.Generator();

        return {
            parse: parser.parse,
            stringify: function(q){
                var query = _.defaults({prefixes: {}}, q);
                query = generator.stringify(query);
                query = $filter('replaceURIsWithPrefixes')(query, true);
                query = $filter('beautifySPARQL')(query);
                return query;
            }
        };

    }

})();