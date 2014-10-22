'use strict';
/**
 * JSON Translator Factory
 * A factory to handle translation of GSBL -> JSON
 *
 */

angular.module('GSB.parser.GSBL2JSON', ['GSB.config'])
    .factory('TranslatorToJSON', function (globalConfig, $log, $localForage) {

        var cleanDollarValues = function(obj){
            for(var key in obj){
                if (obj.hasOwnProperty(key) && key.startsWith('$')){
                    delete obj[key];
                }
            }
            return obj;
        };

        var factory = {};

        /**
         * Function that takes built query and creates a JSON Object for the translation to SPARQL, returns it as a String
         *
         * @param mainSubjectSelected
         * @param subjects
         * @return JSON object as String
         */
        factory.translateGSBLToJSON = function (mainSubjectSelected, subjects) {

            $log.debug('Translate GSBL to JSON');

            if (mainSubjectSelected === null) {
                $log.error('Main Subject not connected');
                return null;
            }
            var json = {
                    CONFIG : globalConfig.name,
                    START: {
                        type: 'LIST_ALL',
                        'linkTo': mainSubjectSelected.alias

                    },
                    SUBJECTS: []
                },
                allSubjects = _.cloneDeep(subjects);
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
                currentSubject.$selectedAggregates = currentSubject.$selectedAggregates.map(function (currentAggregate) {
                    return cleanDollarValues(currentAggregate);
                });
                currentSubject.properties = currentSubject.properties.concat(currentSubject.$selectedAggregates);

                return cleanDollarValues(currentSubject);
            });

            json.SUBJECTS = allSubjects;

            $localForage.set('current',json).then(function() {
                $log.debug('Current Workspace saved into localForage');
            });

            return JSON.stringify(json, null, 2);
        };
        return factory;
    });
