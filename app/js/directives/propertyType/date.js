'use strict';

/**
 * Property directive
 * Creates the possibility to use a <property> element,
 * which will be replaced with the contents of template/date.html
 */

angular.module('GSB.directives.propertyType.date', ['ui.bootstrap'])
    .directive('datePropertyDir', function () {
        return {
            restrict: 'A',
            replace: true,
            controller: 'DatePropertyCtrl',
            templateUrl: 'template/propertyType/date.html'
        };
    });