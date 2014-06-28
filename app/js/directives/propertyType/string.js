'use strict';

/**
 * Property directive
 * Creates the possibility to use a <property> element,
 * which will be replaced with the contents of template/property.html
 */

angular.module('GSB.directives.propertyType.string', [])
    .directive('stringPropertyDir', function () {
        return {
            restrict: 'A',
            replace: true,
            controller: 'StringPropertyCtrl',
            templateUrl: 'template/propertyType/string.html'
        };
    });