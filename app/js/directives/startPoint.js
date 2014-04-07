'use strict';

/**
 * StartPoint directive
 * You can give a html element the attribute start-point-dir, which will show the connected mainSubjectSelected
 */

angular.module('GSB.directives.startPoint', [])
  .directive('startPointDir', function () {
    return {
      restrict: "A",
      /**
       * The link function is the function where you can interact with the DOM
       *
       * @param scope The current Scope, equivalent to the workspaceCtrl scope
       * @param element The current element, equivalent to div.startPointCSS
       *
       */
      link: function(scope, element) {

        // On mouseEnter, set highlightedSubject to mainSubjectSelected
        // TODO: Maybe work with $emit, $on and $broadcast instead, see @js/directives/property.js
        element.on('mouseenter',function(){
          scope.highlightedSubject = scope.mainSubjectSelected;
          scope.$apply();
        });

        // On mouseLeave, set highlightedSubject subject to null
        // TODO: Maybe work with $emit, $on and $broadcast instead, see @js/directives/property.js
        element.on('mouseleave',function(){
          scope.highlightedSubject = null;
          scope.$apply();
        });
      }
    }
  });