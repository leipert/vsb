(function () {
    'use strict';
    /**
     * VSBL Translator Factory
     * A factory to handle translation of JSON -> VSBL
     *
     */

    angular.module('VSB.parser.JSON2VSBL', ['VSB.config', 'VSB.property.model', 'VSB.subject.model'])
        .factory('TranslatorToVSBL', TranslatorToVSBL);

    function TranslatorToVSBL(SubjectService, $log) {
        var factory = {};

        /**
         * Function that takes an uploaded JSON and creates a VSBL query for the representation in VSB
         *
         * @param parsedJSON
         * @return Array of all the workspace Content
         */
        factory.translateJSONToVSBL = function (parsedJSON) {

            $log.debug('Translate JSON to VSBL');

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