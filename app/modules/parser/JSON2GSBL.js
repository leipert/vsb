(function () {
    'use strict';
    /**
     * GSBL Translator Factory
     * A factory to handle translation of JSON -> GSBL
     *
     */

    angular.module('GSB.parser.JSON2GSBL', ['GSB.config', 'GSB.property.model', 'GSB.subject.model'])
        .factory('TranslatorToGSBL', TranslatorToGSBL);

    function TranslatorToGSBL(SubjectService, $q, $log) {
        var factory = {};

        /**
         * Function that takes an uploaded JSON and creates a GSBL query for the representation in GSB
         *
         * @param json
         * @return Array of all the workspace Content
         */
        factory.translateJSONToGSBL = function (json) {

            $log.debug('Translate JSON to GSBL');

            if (json === null) {
                $log.error('Empty JSON File');
                return null;
            }

            var linkToPromises = [];

            json.SUBJECTS.forEach(function (subject) {
                subject.$copied = true;
                var properties = subject.properties;
                delete subject.properties;

                subject = SubjectService.addSubject(subject);

                properties.forEach(function (property) {

                    property.$copied = true;
                    property = subject.addProperty(property);
                    if(property.linkTo){
                        linkToPromises.push(property);
                    }

                });
            });

            linkToPromises.forEach(function(property){
                SubjectService.linkSubjectWithProperty(property);
            });

            SubjectService.setMainSubjectWithAlias(json.START.linkTo);


        };
        return factory;
    }

})();