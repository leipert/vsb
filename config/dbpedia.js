'use strict';

angular.module('GSB.config', [])
    .constant('globalConfig', {
        propertyTypeURIs: {
            'OBJECT_PROPERTY': [
                /http:\/\/dbpedia.org\/ontology\//
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
            'dbpedia': 'http://dbpedia.org/'
        },
        defaultGraphURIs: ['http://dbpedia.org'],
        baseURL: 'http://dbpedia-live.openlinksw.com/',
        resultURL: 'http://dbpedia-live.openlinksw.com/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&format=text%2Fhtml&timeout=5000&debug=on&query=',
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
            getProperties :
            '<%uri%> (rdfs:subClassOf|(owl:equivalentClass|^owl:equivalentClass))* ?class .' +
            '{' +
            '    ?uri ?x ?class .' +
            '    FILTER (?x = rdfs:domain) .' +
            '        OPTIONAL { ?uri rdfs:range ?range }  .' +
            '} UNION {' +
            '    ?uri ?x ?class .    FILTER (?x = rdfs:range) .' +
            '        OPTIONAL { ?uri rdfs:domain ?range} .' +
            '} .' +
            'OPTIONAL { ?uri rdfs:comment ?comment } .' +
            'OPTIONAL { ?uri rdfs:label ?alias } .' +
            'FILTER ( !isBlank(?class) && !isBlank(?uri) && !isBlank(?range) ) .' +
            'BIND (if( ?x = rdfs:range, "I", "D") AS ?inverse)'+
            'BIND ( CONCAT(?uri, ?inverse) AS ?id)',
            getAllClassURIs : '<%uri%> (rdfs:subClassOf|(owl:equivalentClass|^owl:equivalentClass))* ?uri ' +
            'FILTER ( !isBlank(?uri) )',
            getURIMetaData: '?s a owl:Class .' +
            'FILTER ( !isBlank(?s) )' +
            'FILTER ( str(?s) = "%uri%")' +
            'OPTIONAL { ?s rdfs:label ?l } .' +
            'OPTIONAL { ?s rdfs:comment ?c} ',
            getAvailableClasses : '?s a owl:Class .' +
            'FILTER ( !isBlank(?s) )' +
            'OPTIONAL { ?s rdfs:label ?l } .' +
            'OPTIONAL { ?s rdfs:comment ?c} '
        }
    });