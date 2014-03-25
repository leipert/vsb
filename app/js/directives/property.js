'use strict';

/*
 * Property directive
 * Creates the possibility to use a <property> element,
 * which will be replaced with the contents of template/property.html
 */

angular.module('GSB.directives.property', [])
  .directive('propertyDir', function () {
    return {
      restrict: "E",
      replace: true,
      templateUrl: 'template/property.html',
      link: function(scope, element) {

        // On mouseEnter, set highlightedSubject to linked Subject of Property
        element.on('mouseenter',function(){
          scope.$parent.$parent.$parent.highlightedSubject = scope.propertyInst.link.linkPartner;
          scope.$apply();
        });

        // On mouseLeave, set highlightedSubject subject to null
        element.on('mouseleave',function(){
          scope.$parent.$parent.$parent.highlightedSubject = null;
          scope.$apply();
        });
      }
    }
  });