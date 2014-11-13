(function () {
    'use strict';
    /**
     * JSON Translator Factory
     * A factory to handle translation of GSBL -> JSON
     *
     */

    angular.module('GSB.parser.GSBL2JSON', ['GSB.config'])
        .factory('TranslatorToJSON', TranslatorToJSON);

    function TranslatorToJSON(globalConfig, $log, $localForage,SubjectService) {

        var cleanDollarValues = function (obj) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key) && _.startsWith(key, '$')) {
                    delete obj[key];
                }
            }
            return obj;
        };

        var factory = {};

        /**
         * Function that takes built query and creates a JSON Object for the translation to SPARQL, returns it as a String
         *
         * @param mainSubject
         * @param subjects
         * @return JSON object as String
         */
        factory.translateGSBLToJSON = function () {

            $log.debug('Translate GSBL to JSON');

            var json = {
                    CONFIG: globalConfig.name,
                    START: {
                        type: 'LIST_ALL',
                        'linkTo': SubjectService.getMainSubject().mainSubject.alias

                    },
                    SUBJECTS: []
                },
                allSubjects = _.cloneDeep(SubjectService.getSubjects());
            allSubjects.map(function (currentSubject) {
                currentSubject.properties = currentSubject.$selectedProperties.map(function (currentProperty) {
                    if (currentProperty.type !== 'STANDARD_PROPERTY') {
                        if (currentProperty.hasOwnProperty('linkTo') &&
                            currentProperty.linkTo !== null && currentProperty.linkTo.hasOwnProperty('alias')) {
                            currentProperty.linkTo = currentProperty.linkTo.alias;
                        } else {
                            currentProperty.linkTo = null;
                        }
                    } else {
                        currentProperty.linkTo = null;
                    }
                    return cleanDollarValues(currentProperty);
                });

                return cleanDollarValues(currentSubject);
            });

            json.SUBJECTS = allSubjects;

            $localForage.set('current', json).then(function () {
                $log.debug('Current Workspace saved into localForage');
            });

            return JSON.stringify(json, null, 2);
        };
        return factory;
    }

})();