'use strict';
/**
 * GSBL Translator Factory
 * A factory to handle translation of JSON -> GSBL
 *
 */

angular.module('GSB.services.translatorToGSBL', ['GSB.config'])
    .factory('TranslatorToGSBL', ['globalConfig', '$log', function (globalConfig, $log) {
        var factory = {};

        /**
         * Function that takes an uploaded JSON and creates a GSBL query for the representation in GSB
         *
         * @param json
         * @return Array of all the workspace Content
         */
        factory.translateJSONToGSBL = function (json) {

            $log.info('Translate JSON to GSBL');

            if (json === null) {
                $log.error('Empty JSON File');
                return null;
            }

            /* Test output
             for (var i = 0; i < json.SUBJECTS.length; i++) {
             alert(json.SUBJECTS[i].alias);
             }*/

            var allTheSubjects = [];
            var workspaceContent = [];

            //Create object of all subjects
            for (var i = 0; i < json.SUBJECTS.length; i++) {
                var subjectsProperties = [];

                for (var p = 0; p < json.SUBJECTS[i].properties.length; p++) {

                    subjectsProperties.push(
                        {
                            'alias': json.SUBJECTS[i].properties[p].alias,
                            'comment': json.SUBJECTS[i].properties[p].comment,
                            'uri': json.SUBJECTS[i].properties[p].uri,
                            'type': json.SUBJECTS[i].properties[p].type,
                            'propertyRange': json.SUBJECTS[i].properties[p].propertyRange,
                            'view': json.SUBJECTS[i].properties[p].view,
                            'optional': json.SUBJECTS[i].properties[p].optional,
                            'operator': json.SUBJECTS[i].properties[p].operator,
                            'linkTo': json.SUBJECTS[i].properties[p].linkTo,
                            'arithmetic': json.SUBJECTS[i].properties[p].arithmetic,
                            'compare': json.SUBJECTS[i].properties[p].compare,
                            'compareRaw': json.SUBJECTS[i].properties[p].compareRaw
                        });

                }

                allTheSubjects.push(
                    {
                        alias: json.SUBJECTS[i].alias,
                        label: json.SUBJECTS[i].label,
                        uri: json.SUBJECTS[i].uri,
                        comment: json.SUBJECTS[i].comment,
                        view: json.SUBJECTS[i].view,
                        selectedProperties: subjectsProperties,
                        availableProperties: [],
                        selectedAggregates: [],
                        showAdditionalFields: json.SUBJECTS[i].showAdditionalFields
                    }
                );
            }

            //Find the subject connected to the startpoint
            var startSubject = allTheSubjects[0];
            for (i = 0; i < allTheSubjects.length; i++) {
                if (json.START.linkTo === allTheSubjects[i].alias) {
                    startSubject = allTheSubjects[i];
                }
            }

            //workspaceContent[0] all the subjects (as an object)
            //worcspaceContent[1] with startpoint linked subject
            workspaceContent.push(allTheSubjects);
            workspaceContent.push(startSubject);

            return workspaceContent;
        };
        return factory;
    }]);
