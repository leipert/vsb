'use strict';

angular.module('GSB.config', [])
  .constant('globalConfig', {
    propertyTypeURIs : {
      'OBJECT_PROPERTY' : [
          /http:\/\/dbpedia.org\/ontology\//
      ],
      'NUMBER_PROPERTY' : [
          /http:\/\/www\.w3\.org\/2001\/XMLSchema#(integer|float|double)/,
        'http://www.w3.org/2001/XMLSchema#decimal'
      ],
      'STRING_PROPERTY' : [
        'http://www.w3.org/2001/XMLSchema#string',
        'http://www.w3.org/2001/XMLSchema#literal'
      ]
    },
    resultURL: 'http://dbpedia-live.openlinksw.com/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&format=text%2Fhtml&timeout=5000&debug=on&query=',
	  queryURL: 'http://dbpedia-live.openlinksw.com/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&format=json&timeout=5000&debug=on&query=',
    baseURL: 'http://' + (location.host + location.pathname).substring(0,(location.host + location.pathname).lastIndexOf('app/') + 4),
    allowedLanguages : ['*','de','en','pl'],
    propertyOperators : [
      {
        label: 'must',
        value: 'MUST'
      },
      {
        label: 'must not',
        value: 'MUST_NOT'
      }
    ],
    inversePropertyOperators : [
      {
        label: 'is of',
        value: 'IS_OF'
      },
      {
        label: 'is not of',
        value: 'IS_NOT_OF'
      }
    ],
	aggregateOperators : [
      {
        label: 'cnt',
        value: 'COUNT(%alias%)'
      },
      {
        label: 'max',
        value: 'MAX(%alias%)'
      },
      {
        label: 'min',
        value: 'MIN(%alias%)'
      }
    ]
  });