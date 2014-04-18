'use strict';

/**
 * Property directive
 * Creates the possibility to use a <property> element,
 * which will be replaced with the contents of template/property.html
 */

angular.module('GSB.directives.property', [])
  .directive('propertyDir', function () {
    return {
      restrict: "E",
      replace: true,
      controller: 'PropertyInstanceCtrl',
      templateUrl: 'template/property.html',
      /**
       * The link function is the function where you can interact with the DOM
       *
       * @param scope The current Scope, equivalent to the propertyInst scope
       * @param element The current element, equivalent to div.startPointCSS
       *
       */
      link: function(scope, element) {

        // On mouseEnter, set highlightedSubject to linked Subject of Property
        //TODO: Do not work with $parent³, use $emit, $on and $broadcast instead
        element.on('mouseenter',function(){
          scope.$parent.$parent.$parent.highlightedSubject = scope.propertyInst.link.linkPartner;
          scope.$apply();
        });

        // On mouseLeave, set highlightedSubject subject to null
        //TODO: Do not work with $parent³, use $emit, $on and $broadcast instead
        element.on('mouseleave',function(){
          scope.$parent.$parent.$parent.highlightedSubject = null;
          scope.$apply();
        });
      }
    }
  });