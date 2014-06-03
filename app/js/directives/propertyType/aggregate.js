'use strict';

/**
 * Property directive
 * Creates the possibility to use a <property> element,
 * which will be replaced with the contents of template/property.html
 */

angular.module('GSB.directives.propertyType.aggregate', [])
  .directive('aggregatePropertyDir', function () {
    return {
      restrict: 'E',
      replace: true,
      controller: 'AggregatePropertyCtrl',
      templateUrl: 'template/propertyType/aggregate.html'
    };
  });