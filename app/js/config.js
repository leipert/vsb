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
        label: 'is_of',
        value: 'MUST'
      },
      {
        label: 'is not of',
        value: 'MUST_NOT'
      }
    ],
    aggregateFunctions : [
      {
        alias:"cnt",
        operator:"COUNT(%alias%)",
        restrictTo:null
      },
      {
        alias:"sum",
        operator:"SUM(%alias%)",
        restrictTo:"NUMBER_PROPERTY"
      },
      {
        alias:"min",
        operator:"MIN(%alias%)",
        restrictTo:"NUMBER_PROPERTY"
      },
      {
        alias:"max",
        operator:"MAX(%alias%)",
        restrictTo:"NUMBER_PROPERTY"
      },
      {
        alias:"avg",
        operator:"AVG(%alias%)",
        restrictTo:"NUMBER_PROPERTY"
      },
      {
        alias:"gct",
        operator:'GROUP_CONCAT(%alias%,",")',
        restrictTo:"STRING_PROPERTY"
      }
    ],
    getPropertiesSPARQLQuery:
      'SELECT DISTINCT ?u ?i (STR(?ct) AS ?c) ?r (STR(?at) AS ?a)' +
      'WHERE {' +
      '  {' +
      '    <%uri%> rdfs:subClassOf* ?class.' +
      '    {' +
      '      ?u rdfs:domain ?class . ' +
      '      BIND("D" as ?i)' +
      '      OPTIONAL { ?u rdfs:range ?r}' +
      '    } UNION {' +
      '      ?u rdfs:range ?class .' +
      '      BIND("I" as ?i)' +
      '      OPTIONAL { ?u rdfs:domain ?r}' +
      '    }' +
      '  }' +
      '  OPTIONAL {' +
      '    ?u rdfs:comment ?ct .' +
      '    FILTER(LANGMATCHES(LANG(?ct), "%lang%"))' +
      '  }' +
      '  OPTIONAL {' +
      '    ?u rdfs:label ?at .' +
      '    FILTER(LANGMATCHES(LANG(?at), "%lang%"))' +
      '  }' +
      '}',
    standardLang: "en",
    getClassesSPARQLQuery:
      'SELECT DISTINCT ?class (STR(?comment_temp) as ?comment) (STR(?alias_temp) AS ?alias)' +
      'WHERE {' +
      '  ?class a owl:Class .' +
      '  OPTIONAL {' +
      '    ?class rdfs:comment ?comment_temp .' +
      '    FILTER(LANGMATCHES(LANG(?comment_temp), "%lang%"))' +
      '  }' +
      '  OPTIONAL {' +
      '    ?class rdfs:label ?alias_temp .' +
      '    FILTER(LANGMATCHES(LANG(?alias_temp), "%lang%"))' +
      '  }' +
      '}'
  });