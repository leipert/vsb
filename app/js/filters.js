'use strict';
angular.module('GSB.filters', [])
  .filter('filterArrayOfObjectsByKeyWithArray', function() {
    /**
     * Filters an array of Objects based on a given Key and allowed values for that key
     * @param arrayOfObjects
     * @param filterKey
     * @param allowedKeyValues
     */
    return function(arrayOfObjects, filterKey, allowedKeyValues) {
      return arrayOfObjects.filter(
        function(currentObject){
          return this.allowedKeyValues.indexOf(currentObject[this.filterKey]) != -1;
        },
        {allowedKeyValues: allowedKeyValues, filterKey: filterKey}
      );
    };
  });