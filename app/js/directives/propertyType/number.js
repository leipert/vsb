'use strict';

/**
 * Property directive
 * Creates the possibility to use a <property> element,
 * which will be replaced with the contents of template/property.html
 */

angular.module('GSB.directives.propertyType.number', [])
  .directive('numberPropertyDir', function () {
    return {
      restrict: 'A',
      replace: true,
      controller: 'NumberPropertyCtrl',
      templateUrl: 'template/propertyType/number.html'
    };
  })
  //limitates the input characters on a number input field
  .directive('limitInput', function(){
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, modelCtrl) {

        function createNewParser(attrs){
          return function(inputValue){
            var regEx = new RegExp(attrs.limitInput,'g');
            var transformedInput = inputValue.toLowerCase().replace(regEx, '');
              transformedInput = transformedInput.replace(/\s+/g, ' ');
              if (transformedInput!==inputValue) {
                modelCtrl.$setViewValue(transformedInput);
                modelCtrl.$render();
              }

              return transformedInput;

          };

        }

        modelCtrl.$parsers.push(createNewParser(attrs));
      }
    };
  });