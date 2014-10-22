'use strict';

/**
 * Property directive
 * Creates the possibility to use a <property> element,
 * which will be replaced with the contents of template/property.html
 */

angular.module('GSB.property.instance')
    .directive('propertyDir', function () {
        return {
            restrict: 'E',
            replace: true,
            controller: 'PropertyInstanceCtrl',
            templateUrl: '/modules/property/instance/property.tpl.html'
        };
    });