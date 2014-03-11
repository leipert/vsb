'use strict';

/* Directives */


angular.module('GSB.directives', [])

    .directive('gsbSubject', function () {
    return {
        restrict: "A",
        replace: true,
        scope: {
            subjectId: '=gsbId'
        },
        templateUrl: 'template/subject.html'
    }
})