'use strict';
angular.module('GSB.filters', [])
  .filter('aggregatePropertyFilter',function(){
    return function(arrayOfObjects, filter){
      if(filter === null || filter === undefined || !filter.hasOwnProperty("restrictTo") || filter.restrictTo === null){
        return arrayOfObjects;
      }
      return arrayOfObjects.filter(
        function(currentObject){
          return currentObject.type == this.restrictTo;
        },
        filter
      );
    };
  });