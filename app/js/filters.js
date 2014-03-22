angular.module('GSB.filters', [])
  // custom filter which filters an array of objects based on a key and an array of allowed values for that key.
  .filter('filterArrayOfObjectsByKeyWithArray', function() {
    return function(arrayOfObjects, filterKey, allowedKeyValues) {
      return arrayOfObjects.filter(
        function(currentObject){
          return this.allowedKeyValues.indexOf(currentObject[this.filterKey]) != -1;
        },
        {allowedKeyValues: allowedKeyValues, filterKey: filterKey}
      );
    };
  });