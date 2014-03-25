'use strict';

/*
 * StartPoint directive
 * You can give a html element the attribute start-point-dir, which will show the connected mainSubjectSelected
 */

angular.module('GSB.directives.startPoint', [])
  .directive('startPointDir', function () {
    return {
      restrict: "A",
      link: function(scope, element) {

        // On mouseEnter, set highlightedSubject to mainSubjectSelected
        element.on('mouseenter',function(){
          scope.highlightedSubject = scope.mainSubjectSelected;
          scope.$apply();
        });

        // On mouseLeave, set highlightedSubject subject to null
        element.on('mouseleave',function(){
          scope.highlightedSubject = null;
          scope.$apply();
        });
      }
    }
  });