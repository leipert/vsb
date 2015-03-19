(function () {
    'use strict';
    /**
     * GSBL Translator Factory
     * A factory to handle translation of JSON -> GSBL
     *
     */

    angular.module('GSB.parser.JSON2GSBL', ['GSB.config', 'GSB.property.model', 'GSB.subject.model'])
        .factory('TranslatorToGSBL', TranslatorToGSBL);

    function TranslatorToGSBL(SubjectService, $log) {
        var factory = {};

        /**
         * Function that takes an uploaded JSON and creates a GSBL query for the representation in GSB
         *
         * @param parsedJSON
         * @return Array of all the workspace Content
         */
        factory.translateJSONToGSBL = function (parsedJSON) {

            $log.debug('Translate JSON to GSBL');

            if (parsedJSON === null) {
                $log.error('Empty JSON File');
                return null;
            }

            var linkSubjectToProperty = [];

            parsedJSON.SUBJECTS.forEach(function (subject) {
                subject.$copied = true;
                var properties = subject.properties;
                delete subject.properties;

                var linkPropertyToAggregate = [];

                subject = SubjectService.addSubject(subject);

                properties.forEach(function (property) {

                    property.$copied = true;
                    property = subject.addProperty(property);
                    if (property.linkTo) {
                        if (property.type !== 'AGGREGATE_PROPERTY') {
                            linkSubjectToProperty.push(property);
                        } else {
                            linkPropertyToAggregate.push(property);
                        }
                    }

                });
                linkPropertyToAggregate.forEach(function (aggregate) {
                    var matching = _.where(subject.$selectedProperties, {alias: aggregate.linkTo});
                    if (matching.length > 0) {
                        aggregate.linkTo = matching[0];
                    }
                });
            });

            linkSubjectToProperty.forEach(function (property) {
                SubjectService.linkSubjectWithProperty(property);
            });

            SubjectService.setMainSubjectWithAlias(parsedJSON.START.linkTo);


        };
        return factory;
    }

})();