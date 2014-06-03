'use strict';

/**
 * Property directive
 * Creates the possibility to use a <property> element,
 * which will be replaced with the contents of template/property.html
 */

angular.module('GSB.directives.propertyType.object', [])
  .directive('objectPropertyDir', function () {
    return {
      restrict: 'A',
      replace: true,
      controller: 'ObjectPropertyCtrl',
      templateUrl: 'template/propertyType/object.html'
    };
  });