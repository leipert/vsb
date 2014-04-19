'use strict';

/**
 * Subject directive
 * Creates the possibility to use a <subject-dir> element,
 * which will be replaced with the contents of template/subject.html
 * Additionally a subject directive uses it's own scope which is needed,
 * so that each subject can hold it's own property list
 *
 */

angular.module('GSB.directives.subject', [])

  .directive('subjectDir', function () {
    return {
      restrict: "E",
      replace: true,
      controller: 'SubjectInstanceCtrl',
      templateUrl: 'template/subject.html',
      /**
       * The link function is the function where you can interact with the DOM
       *
       * @param scope The current Scope, equivalent to the scope holding subjectInst
       * @param element The current element
       *
       */
      link: function (scope, element) {
        // Set watch for change of the highlightedSubject

          }
        });

        //Show additional fields on mouseEnter
        element.on("mouseenter",function(){
          scope.subjectInst.showAdditionalFields = true;
          scope.$apply();
        });

        //Hide additional fields on mouseEnter
        element.on("mouseleave",function(){
          scope.subjectInst.showAdditionalFields = false;
          scope.$apply();
        });
      }
    };
  });