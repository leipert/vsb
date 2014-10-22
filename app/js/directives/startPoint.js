'use strict';

/**
 * StartPoint directive
 * You can give a html element the attribute start-point-dir, which will show the connected mainSubjectSelected
 */

angular.module('GSB.directives.startPoint', [])
    .directive('startPointDir', function () {
        return {
            restrict: 'A'
        };
    });