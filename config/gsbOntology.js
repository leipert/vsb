'use strict';

angular.module('GSB.config', [])
    .constant('globalConfig', {
        propertyTypeURIs: {
            'OBJECT_PROPERTY': [
                'http://purl.org/ontology/mo/',
                'http://purl.org/NET/c4dm/keys.owl#Key',
                'http://purl.org/dc/terms/MediaType',
                'http://web.resource.org/cc/License',
                'http://xmlns.com/foaf/0.1/'
            ],
            'NUMBER_PROPERTY': [
                /http:\/\/www\.w3\.org\/2001\/XMLSchema#(integer|float|double)/,
                'http://www.w3.org/2001/XMLSchema#decimal',
                'http://www.w3.org/2001/XMLSchema#positiveInteger',
                'http://www.w3.org/2001/XMLSchema#nonNegativeInteger'
            ],
            'STRING_PROPERTY': [
                'http://www.w3.org/2001/XMLSchema#string',
                'http://www.w3.org/2001/XMLSchema#literal'
            ],
            'DATE_PROPERTY': [
                'http://www.w3.org/2001/XMLSchema#date'
            ]
        },
        prefixes: {
            'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
            'foaf': 'http://xmlns.com/foaf/0.1/',
            'owl': 'http://www.w3.org/2002/07/owl#',
            'gsb': 'http://gsb.leipert.io/ns/'
        },
        defaultGraphURIs: ['http://gsb.leipert.io/ns/'],
        baseURL: 'https://ssl.leipert.io/sparql',
        resultURL: 'https://ssl.leipert.io/sparql?default-graph-uri=http%3A%2F%2Fpurl.org%2Fontology%2Fmo%2F&format=text%2Fhtml&timeout=5000&debug=on&query=',
        allowedLanguages: ['*', 'de', 'en', 'pl'],
        standardLang: 'en',
        aggregateFunctions: [
            {
                alias: 'cnt',
                operator: 'COUNT(%alias%)',
                restrictTo: null
            },
            {
                alias: 'sum',
                operator: 'SUM(%alias%)',
                restrictTo: 'NUMBER_PROPERTY'
            },
            {
                alias: 'min',
                operator: 'MIN(%alias%)',
                restrictTo: 'NUMBER_PROPERTY'
            },
            {
                alias: 'max',
                operator: 'MAX(%alias%)',
                restrictTo: 'NUMBER_PROPERTY'
            },
            {
                alias: 'avg',
                operator: 'AVG(%alias%)',
                restrictTo: 'NUMBER_PROPERTY'
            },
            {
                alias: 'gct',
                operator: 'GROUP_CONCAT(%alias%,",")',
                restrictTo: 'STRING_PROPERTY'
            }
        ],
        endPointQueries : {
            getProperties : ' {' +
            '  <%uri%> rdfs:subClassOf* ?class.' +
            '    { ?uri rdfs:domain ?class .' +
            '      BIND("D" as ?inverse)' +
            '      OPTIONAL { ?uri rdfs:range ?range}' +
            '    } UNION {' +
            '      ?uri rdfs:range ?class .' +
            '      BIND("I" as ?inverse)' +
            '      OPTIONAL { ?uri rdfs:domain ?range}' +
            '    }' +
            '  }' +
            '  FILTER ( !isBlank(?class) )' +
            '  FILTER ( !isBlank(?range) )' +
            '  OPTIONAL { ?uri rdfs:comment ?comment . }' +
            '  OPTIONAL { ?uri rdfs:label ?alias . } ',
            getAllClassURIs : '{   <%uri%> rdfs:subClassOf* ?uri. }' +
            'UNION' +
            '{  <%uri%> rdfs:subClassOf*/owl:equivalentClass ?uri.  }' +
            'FILTER ( !isBlank(?uri) )',
            getURIMetaData: '?s a rdfs:Class .' +
            'FILTER ( !isBlank(?s) )' +
            'FILTER ( str(?s) = "%uri%")' +
            'OPTIONAL { ?s rdfs:label ?l } .' +
            'OPTIONAL { ?s rdfs:comment ?c} ',
            getAvailableClasses : '?s a rdfs:Class .' +
            'FILTER ( !isBlank(?s) )' +
            'OPTIONAL { ?s rdfs:label ?l } .' +
            'OPTIONAL { ?s rdfs:comment ?c} '
        }
    });