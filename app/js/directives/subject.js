'use strict';

/*
 * Subject directive
 * Creates the possibility to use a <subject> element,
 * which will be replaced with the contents of template/subject.html
 * Additionally a subject directive uses it's own scope which is needed,
 * so that each subject can hold it's own property list
 */

angular.module('GSB.directives.subject', [])

  .directive('subjectDir', function () {
    return {
      restrict: "E",
      replace: true,
      templateUrl: 'template/subject.html',
      link: function (scope, element, attrs) {

        // Set watch for change of the highlightedSubject
        scope.$watch('highlightedSubject', function () {

          //If the highlightedSubject has the same alias as the current subject, highlight it, else not
          if (scope.highlightedSubject !== undefined && scope.highlightedSubject !== null &&
            scope.hasOwnProperty("subjectInst") && scope.highlightedSubject.hasOwnProperty("alias") &&
            scope.highlightedSubject.hasOwnProperty("alias") &&
            scope.highlightedSubject.alias == scope.subjectInst.alias) {
            element.addClass("highlightSubject");
          } else {
            element.removeClass("highlightSubject");
          }
        });

        element.on("mouseenter",function(){
          scope.subjectInst.showAdditionalFields = true;
          scope.$apply();
        });

        element.on("mouseleave",function(){
          scope.subjectInst.showAdditionalFields = false;
          scope.$apply();
        });
      }
    };
  });