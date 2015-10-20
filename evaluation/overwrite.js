'use strict';

angular.module('VSB.config')

    .run(function ($localForage, TranslatorToVSBL, MessageService, languageStorage) {

        languageStorage.mergeLanguages({
            de: {
                EXAMPLE_MESSAGE: 'Diese Beispielontologie ist zum Evaluieren des VSB gedacht.' +
                'Sie enthält nur Daten zur Band Nirvana'
            },
            en: {
                EXAMPLE_MESSAGE: 'This Ontology only contains Data regarding the Band Nirvana.'
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
                "CONFIG": "STANDARD_CONFIG",
                "START": {
                    "type": "LIST_ALL",
                    "linkTo": "MusicGroup"
                },
                "SUBJECTS": [
                    {
                        "uri": "http://purl.org/ontology/mo/MusicGroup",
                        "pos": {
                            "x": 424,
                            "y": 206
                        },
                        "view": true,
                        "alias": "Band",
                        "properties": [
                            {
                                "uri": "http://purl.org/ontology/mo/member",
                                "type": "OBJECT_PROPERTY",
                                "filterExists": true,
                                "hasFilter": true,
                                "compareRaw": {},
                                "linkTo": "MusicArtist",
                                "view": true,
                                "optional": false,
                                "arithmetic": null,
                                "compare": null,
                                "alias": "Mitglied"
                            }
                        ]
                    },
                    {
                        "uri": "http://purl.org/ontology/mo/MusicArtist",
                        "pos": {
                            "x": 961,
                            "y": 228
                        },
                        "view": true,
                        "alias": "Musiker",
                        "properties": [
                            {
                                "uri": "http://www.w3.org/2000/01/rdf-schema#label",
                                "type": "STRING_PROPERTY",
                                "filterExists": true,
                                "hasFilter": true,
                                "compareRaw": {
                                    "selectedLanguage": null,
                                    "stringComparison": 2,
                                    "comparisonInput": "Kurt Cobain",
                                    "comparisonRegexFlags": "i"
                                },
                                "linkTo": null,
                                "view": false,
                                "optional": false,
                                "arithmetic": null,
                                "compare": "(str(%after_arithmetic%)!=\"Kurt Cobain\")",
                                "alias": "Name"
                            },
                            {
                                "uri": "http://purl.org/ontology/mo/member",
                                "type": "INVERSE_PROPERTY",
                                "filterExists": true,
                                "hasFilter": true,
                                "compareRaw": {},
                                "linkTo": "Nirvana",
                                "view": false,
                                "optional": false,
                                "arithmetic": null,
                                "compare": null,
                                "alias": "Mitglied"
                            }
                        ]
                    },
                    {
                        "uri": "http://purl.org/ontology/mo/MusicGroup",
                        "pos": {
                            "x": 447,
                            "y": 483
                        },
                        "view": false,
                        "alias": "Nirvana",
                        "properties": [
                            {
                                "uri": "$$uri",
                                "type": "STRING_PROPERTY",
                                "filterExists": true,
                                "hasFilter": true,
                                "compareRaw": {
                                    "selectedLanguage": null,
                                    "stringComparison": 1,
                                    "comparisonInput": "http://example.org/Nirvana",
                                    "comparisonRegexFlags": "i"
                                },
                                "linkTo": null,
                                "view": true,
                                "optional": false,
                                "arithmetic": null,
                                "compare": "(str(%after_arithmetic%)=\"http://example.org/Nirvana\")",
                                "alias": "uri"
                            }
                        ]
                    }
                ]
            };
        }
    }
);