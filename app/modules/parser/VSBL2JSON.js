(function () {
    'use strict';
    /**
     * JSON Translator Factory
     * A factory to handle translation of VSBL -> JSON
     *
     */

    angular.module('VSB.parser.VSBL2JSON', ['VSB.config', 'LocalForageModule'])
        .factory('ParserVSBL2JSON', ParserVSBL2JSON);

    function ParserVSBL2JSON($rootScope, $log, globalConfig, $localForage, SubjectService) {

        var cleanDollarValues = function (obj) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key) && (_.startsWith(key, '$') || typeof obj[key] === 'function')) {
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
        factory.parseVSBL2JSON = function () {

            $log.debug('Translate VSBL to JSON');

            var json = {
                    CONFIG: globalConfig.name,
                    START: {
                        type: 'LIST_ALL',
                        'linkTo': SubjectService.getMainSubject().alias
                    },
                    SUBJECTS: []
                },
                allSubjects = _.cloneDeep(SubjectService.getSubjects());
            allSubjects.map(function (currentSubject) {
                currentSubject.properties = currentSubject.$selectedProperties.map(function (currentProperty) {
                    if (currentProperty.type !== 'STANDARD_PROPERTY') {
                        if (_.isObject(currentProperty.linkTo) && currentProperty.linkTo.hasOwnProperty('alias')) {
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

            $localForage.setItem('current', json).then(function () {
                $log.debug('Current Workspace saved into localForage');
            }, function () {
                $log.debug('Saving to localForage failed', arguments);
            });

            $rootScope.$emit('updateJSON', JSON.stringify(json, null, 2));

            return JSON.stringify(json, null, 2);
        };
        return factory;
    }

})();