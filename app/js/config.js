angular.module('GSB.config', [])
  .constant('globalConfig', {
    dataTypeURIs : [
      'http://www.w3.org/2001/XMLSchema'
    ],
    queryURL: 'http://dbpedia.org/sparql?format=text%2Fhtml&timeout=5000&debug=on&query=',
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