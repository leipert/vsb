(function () {
    'use strict';
    /**
     * Translator Manager Factory
     * A factory to manage translation of GSBL -> JSON and JSON -> SPARQL
     *
     */

    angular.module('GSB.parser', ['GSB.config', 'GSB.parser.GSBL2JSON', 'GSB.parser.GSBL2SPARQL', 'GSB.parser.JSON2GSBL', 'LocalForageModule'])
        .factory('TranslatorManager', TranslatorManager)
        .directive('jsonreader', jsonreader);

    function jsonreader(TranslatorToGSBL, SubjectService) {
        return {
            link: function (scope, element) {
                element.bind('change', function (changeEvent) {
                    var reader = new FileReader();
                    reader.onload = function (loadEvent) {
                        element.val(null);
                        var parsedJSON = JSON.parse(loadEvent.target.result);
                        SubjectService.reset();
                        TranslatorToGSBL.translateJSONToGSBL(parsedJSON);
                    };
                    reader.readAsText(changeEvent.target.files[0]);
                });
            }
        };

    }

    function TranslatorManager($log, TranslatorToJSON, TranslatorToSPARQL) {
        var factory = {};

        /**
         *  Function first calls the factory to translate GSBL to JSON, then the one to translate JSON to SPARQL
         */
        factory.translateGSBLToSPARQL = function () {

            var newJSON = TranslatorToJSON.translateGSBLToJSON();


            if (newJSON === null) {
                $log.error('JSON is not valid / empty');
                return;
            }


            var newSPARQL = TranslatorToSPARQL.translateJSONToSPARQL(JSON.parse(newJSON));

            var sponateMap = TranslatorToSPARQL.translateJSONToSponateMap(JSON.parse(newJSON));

            return {
                json: newJSON,
                sparql: newSPARQL,
                sponateMap: sponateMap
            };
        };

        return factory;
    }

})();