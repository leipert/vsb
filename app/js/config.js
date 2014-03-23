angular.module('GSB.config', [])
  .constant('globalConfig', {
    dataTypeURIs : [
      'http://www.w3.org/2001/XMLSchema'
    ],
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