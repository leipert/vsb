'use strict';

angular.module('VSB.config')
    .config(function (globalConfig) {
        globalConfig.name = 'DBPEDIA_CONFIG';
        globalConfig.propertyTypeByRange['http://dbpedia.org/ontology/'] = 'OBJECT_PROPERTY';
        globalConfig.prefixes = _.merge(globalConfig.prefixes, {
            'category': 'http://dbpedia.org/resource/Category:',
            'dbpedia': 'http://dbpedia.org/resource/',
            'dbpedia-owl': 'http://dbpedia.org/ontology/',
            'dbpprop': 'http://dbpedia.org/property/',
            'units': 'http://dbpedia.org/units/',
            'yago': 'http://dbpedia.org/class/yago/'
        });
        globalConfig.defaultGraphURIs = ['http://dbpedia.org'];
        globalConfig.baseURL = 'http://dbpedia.org/sparql';
        globalConfig.resultURL = globalConfig.baseURL;
        globalConfig.endPointQueries.getDirectProperties = '{<%uri%> (rdfs:subClassOf|(owl:equivalentClass|^owl:equivalentClass))* ?class .' +
        '?uri rdfs:domain ?class .' +
        'OPTIONAL { ?uri rdfs:range ?range }  .' +
        'OPTIONAL { ?uri rdf:type ?type }  .' +
        'OPTIONAL { ?uri rdfs:label ?label . BIND(LANG(?label) AS ?label_loc) } .' +
        'OPTIONAL { ?uri rdfs:comment ?comment . BIND(LANG(?comment) AS ?comment_loc) } .' +
        'FILTER ( !isBlank(?class) && !isBlank(?uri) && !isBlank(?range) ) ' +
        '} UNION { ?uri rdfs:range <http://dbpedia.org/ontology/City> . ?uri rdfs:range ?range . OPTIONAL { ?uri rdf:type ?type }   }';
    })

    /*
     * Everything below is just for the dbpedia demo on leipert.github.io/vsb
     *
     *
     */

    .run(function ($localForage, TranslatorToVSBL, MessageService, languageStorage) {

        languageStorage.mergeLanguages({
            de: {
                EXAMPLE_MESSAGE: 'In diesem Beispiel sehen sie, wie gut die dbpedia mit dem VSB funktioniert.<br>' +
                'Leider muss man feststellen, dass die Datenqualität oft nicht hochwertig genug ist für reale Beispiele.<br>' +
                'So ist Tom Hanks zB kein Schauspieler und es fehlen viele ranges & domains..<br>' +
                'Haben Sie aber trotzdem Spaß beim rumprobieren!'
            },
            en: {
                EXAMPLE_MESSAGE: 'This example shows how well the VSB works with the dbpedia.<br>' +
                'Unfortunately the dbpedia’s is not high enough for real examples.<br>' +
                'Tom Hanks is not an actor for instance, a lot of ranges and domains are also missing.<br>' +
                'I wish you fun anyway trying the VSB!'
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
                "CONFIG": "DBPEDIA_CONFIG",
                "START": {
                    "type": "LIST_ALL",
                    "linkTo": "person"
                },
                "SUBJECTS": [
                    {
                        "uri": "http://dbpedia.org/ontology/Person",
                        "pos": {
                            "x": 350,
                            "y": 150
                        },
                        "view": true,
                        "alias": "person",
                        "properties": [
                            {
                                "uri": "http://dbpedia.org/ontology/birthPlace",
                                "type": "OBJECT_PROPERTY",
                                "filterExists": true,
                                "hasFilter": true,
                                "compareRaw": {},
                                "linkTo": "city",
                                "view": true,
                                "optional": false,
                                "arithmetic": null,
                                "compare": null,
                                "alias": "birth place"
                            },
                            {
                                "uri": "http://dbpedia.org/ontology/almaMater",
                                "type": "OBJECT_PROPERTY",
                                "filterExists": true,
                                "hasFilter": true,
                                "compareRaw": {},
                                "linkTo": "university",
                                "view": true,
                                "optional": false,
                                "arithmetic": null,
                                "compare": null,
                                "alias": "alma mater"
                            }
                        ]
                    },
                    {
                        "uri": "http://dbpedia.org/ontology/City",
                        "pos": {
                            "x": 837,
                            "y": 133
                        },
                        "view": true,
                        "alias": "city",
                        "properties": [
                            {
                                "uri": "http://www.w3.org/2000/01/rdf-schema#label",
                                "type": "STRING_PROPERTY",
                                "filterExists": true,
                                "hasFilter": true,
                                "compareRaw": {
                                    "selectedLanguage": "*",
                                    "stringComparison": 0,
                                    "comparisonInput": "Hamburg",
                                    "comparisonRegexFlags": "i"
                                },
                                "linkTo": null,
                                "view": true,
                                "optional": false,
                                "arithmetic": null,
                                "compare": "langMatches(lang(%after_arithmetic%), \"*\") && langMatches(lang(%after_arithmetic%), \"*\") && regex(%after_arithmetic%, \"Hamburg\", \"i\")",
                                "alias": "Label"
                            }
                        ]
                    },
                    {
                        "uri": "http://dbpedia.org/ontology/University",
                        "pos": {
                            "x": 688,
                            "y": 505
                        },
                        "view": true,
                        "alias": "university",
                        "properties": [
                            {
                                "uri": "http://dbpedia.org/ontology/city",
                                "type": "OBJECT_PROPERTY",
                                "filterExists": true,
                                "hasFilter": true,
                                "compareRaw": {},
                                "linkTo": "city",
                                "view": true,
                                "optional": false,
                                "arithmetic": null,
                                "compare": null,
                                "alias": "city"
                            }
                        ]
                    }
                ]
            };
        }
    }
);