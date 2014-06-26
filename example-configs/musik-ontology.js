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
    resultURL: 'http://46.4.144.93:8890/sparql?default-graph-uri=http%3A%2F%2Fpurl.org%2Fontology%2Fmo%2F&format=text%2Fhtml&timeout=5000&debug=on&query=',
    queryURL: 'http://46.4.144.93:8890/sparql?default-graph-uri=http%3A%2F%2Fpurl.org%2Fontology%2Fmo%2F&format=json&timeout=5000&debug=on&query=',
    allowedLanguages: ['*', 'de', 'en', 'pl'],
    propertyOperators: [
      {
        label: 'must',
        value: 'MUST'
      },
      {
        label: 'must not',
        value: 'MUST_NOT'
      }
    ],
    inversePropertyOperators: [
      {
        label: 'is_of',
        value: 'MUST'
      },
      {
        label: 'is not of',
        value: 'MUST_NOT'
      }
    ],
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
    getPropertiesSPARQLQuery: 'SELECT DISTINCT ?uri ?inverse (STR(?comment_temp) AS ?comment) ?range (STR(?alias_temp) AS ?alias)' +
    'WHERE {' +
    '  {' +
    '    <%uri%> rdfs:subClassOf* ?class.' +
    '    {' +
    '      ?uri rdfs:domain ?class . ' +
    '      BIND("D" as ?inverse)' +
    '      OPTIONAL { ?uri rdfs:range ?range}' +
    '    } UNION {' +
    '      ?uri rdfs:range ?class .' +
    '      BIND("I" as ?inverse)' +
    '      OPTIONAL { ?uri rdfs:domain ?range}' +
    '    }' +
    '  }' +
    '  OPTIONAL {' +
    '    ?uri rdfs:comment ?comment_temp .' +
    '  }' +
    '  OPTIONAL {' +
    '    ?uri rdfs:label ?alias_temp .' +
    '  }' +
    '}',
    standardLang: 'en',
    getClassesSPARQLQuery: 'SELECT DISTINCT ?uri (STR(?comment_temp) as ?comment) (STR(?alias_temp) AS ?alias)' +
    'WHERE {' +
    '  ?uri a owl:Class .' +
    '  OPTIONAL {' +
    '    ?uri rdfs:comment ?comment_temp .' +
    '  }' +
    '  OPTIONAL {' +
    '    ?uri rdfs:label ?alias_temp .' +
    '  }' +
    '}',
    getAllURIs:
    'SELECT DISTINCT ?uri ' +
    'WHERE {' +
    '  {' +
    '    {' +
    '      <%uri%> rdfs:subClassOf* ?uri.' +
    '    } UNION {' +
    '      <%uri%> owl:equivalentClass ?uri.' +
    '    }' +
    '  }' +
    '}'
  });