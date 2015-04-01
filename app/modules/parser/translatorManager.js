(function () {
    'use strict';
    /**
     * Translator Manager Factory
     * A factory to manage translation of VSBL -> JSON and JSON -> SPARQL
     *
     */

    angular.module('VSB.parser', ['VSB.config', 'VSB.parser.VSBL2JSON', 'VSB.parser.VSBL2SPARQL', 'VSB.parser.JSON2VSBL', 'LocalForageModule'])
        .factory('ParserManager', ParserManager)
        .directive('jsonreader', jsonreader);

    function jsonreader(TranslatorToVSBL, SubjectService) {
        return {
            link: function (scope, element) {
                element.bind('change', function (changeEvent) {
                    var reader = new FileReader();
                    reader.onload = function (loadEvent) {
                        element.val(null);
                        var parsedJSON = JSON.parse(loadEvent.target.result);
                        SubjectService.reset().then(function () {
                            TranslatorToVSBL.translateJSONToVSBL(parsedJSON);
                        });
                    };
                    reader.readAsText(changeEvent.target.files[0]);
                });
            }
        };

    }

    function ParserManager($log, ParserVSBL2JSON, ParserToSPARQL) {
        var factory = {};

        /**
         *  Function first calls the factory to translate VSBL to JSON, then the one to translate JSON to SPARQL
         */
        factory.translateVSBLToSPARQL = function () {

            var newJSON = ParserVSBL2JSON.parseVSBL2JSON();


            if (newJSON === null) {
                $log.error('JSON is not valid / empty');
                return;
            }


            var newSPARQL = ParserToSPARQL.translateJSONToSPARQL(JSON.parse(newJSON));

            var sponateMap = ParserToSPARQL.translateJSONToSponateMap(JSON.parse(newJSON));

            return {
                json: newJSON,
                sparql: newSPARQL,
                sponateMap: sponateMap
            };
        };

        return factory;
    }

})();