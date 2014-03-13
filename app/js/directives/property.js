'use strict';

/*
 * Property directive
 * Creates the possibility to use a <property> element,
 * which will be replaced with the contents of template/property.html
 */

angular.module('GSB.directives.property', [])
    .directive('property', function () {
    return {
        restrict: "E",
        replace: true,
        templateUrl: 'template/property.html'
    }
})