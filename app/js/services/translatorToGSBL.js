'use strict';
/**
 * GSBL Translator Factory
 * A factory to handle translation of JSON -> GSBL
 *
 */

angular.module('GSB.services.translatorToGSBL', ['GSB.config'])
    .factory('TranslatorToGSBL', function (globalConfig, $log) {
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
                var subjectsProperties = [],
                    curSubj = json.SUBJECTS[i];

                for (var p = 0; p < curSubj.properties.length; p++) {

                    var curProp = curSubj.properties[p];

                    subjectsProperties.push(
                        {
                            $copied : true,
                            alias: curProp.alias,
                            uri: curProp.uri,
                            type: curProp.type,
                            view: curProp.view,
                            optional: curProp.optional,
                            filterExists: curProp.filterExists,
                            hasFilter: curProp.hasFilter,
                            linkTo: curProp.linkTo,
                            arithmetic: curProp.arithmetic,
                            compare: curProp.compare,
                            compareRaw: curProp.compareRaw
                        });

                }

                allTheSubjects.push(
                    {
                        alias: curSubj.alias,
                        uri: curSubj.uri,
                        pos: curSubj.pos,
                        view: curSubj.view,
                        $selectedAggregates: [],
                        $selectedProperties: subjectsProperties,
                        $copied : true
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
    });
