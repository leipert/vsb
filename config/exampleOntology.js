'use strict';

angular.module('VSB.config')

    .run(function ($localForage, TranslatorToVSBL, MessageService, languageStorage) {

        languageStorage.mergeLanguages({
            de: {
                EXAMPLE_MESSAGE: 'Diese Beispielontologie ist Großenteils zum Testen der technischen Grezen des VSB gedacht.' +
                'Sie finden das Vokabular <a class="alert-link" target="_blank" href="../config/graphs/vsb.ttl">hier</a>.' +
                '<br> Es gibt zur Zeit nur gemockte Personendaten.'
            },
            en: {
                EXAMPLE_MESSAGE: 'This example ontology is mainly to test some technical limits of the VSB.' +
                'You can find its definition <a class="alert-link" href="../config/graphs/vsb.ttl">here</a>.' +
                '<br> The only instances you may find (at the moment) are some mockup persons.'
            }
        });

        MessageService.addMessage('<span translate="EXAMPLE_MESSAGE"></span>');

        $localForage.getItem('current').then(function (data) {
            if (data === null || data === undefined) {
                loadExample()
            }
        }, loadExample);

        function loadExample() {
            TranslatorToVSBL.translateJSONToVSBL(getExample());
        }

        function getExample() {
            return {
                CONFIG: 'STANDARD_CONFIG',
                START: {
                    type: 'LIST_ALL',
                    linkTo: 'Grandchild'
                },
                SUBJECTS: [
                    {
                        uri: 'http://vsb.leipert.io/ns/Person',
                        pos: {
                            x: 364,
                            y: 177
                        },
                        view: true,
                        alias: 'Grandchild',
                        properties: [
                            {
                                uri: 'http://vsb.leipert.io/ns/ancestor',
                                type: 'RELATION_PROPERTY',
                                filterExists: true,
                                hasFilter: true,
                                compareRaw: {},
                                linkTo: 'Parent',
                                view: true,
                                optional: false,
                                arithmetic: null,
                                compare: null,
                                alias: 'Ancestor'
                            }
                        ]
                    },
                    {
                        uri: 'http://vsb.leipert.io/ns/Person',
                        pos: {
                            x: 724,
                            y: 415
                        },
                        view: false,
                        alias: 'Parent',
                        properties: [
                            {
                                uri: 'http://vsb.leipert.io/ns/ancestor',
                                type: 'RELATION_PROPERTY',
                                filterExists: true,
                                hasFilter: true,
                                compareRaw: {},
                                linkTo: 'Grandparent',
                                view: true,
                                optional: false,
                                arithmetic: null,
                                compare: null,
                                alias: 'Ancestor'
                            }
                        ]
                    },
                    {
                        uri: 'http://vsb.leipert.io/ns/Person',
                        pos: {
                            x: 385,
                            y: 665
                        },
                        view: true,
                        alias: 'Grandparent',
                        properties: [
                            {
                                uri: 'http://vsb.leipert.io/ns/age',
                                type: 'NUMBER_PROPERTY',
                                filterExists: true,
                                hasFilter: false,
                                compareRaw: {},
                                linkTo: null,
                                view: true,
                                optional: false,
                                arithmetic: null,
                                compare: null,
                                alias: 'Age'
                            }
                        ]
                    }
                ]
            };
        }
    }
);