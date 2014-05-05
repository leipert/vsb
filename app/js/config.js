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
    queryURL: 'http://dbpedia.org/sparql?format=text%2Fhtml&timeout=5000&debug=on&query=',
	testURLstart: 'http://dbpedia-live.openlinksw.com/sparql/?default-graph-uri=http%3A%2F%2Fdbpedia.org&format=json&timeout=30000&debug=on&query=',
	  testURLend: '',
    baseURL: 'http://' + (location.host + location.pathname).substring(0,(location.host + location.pathname).lastIndexOf('app/') + 4),
    propertyOperators : [
      {
        label: 'must',
        value: 'MUST'
      },
      {
        label: 'must not',
        value: 'MUST_NOT'
      }
    ]
  });