'use strict';

/**
 * PropertyInstanceCtrl
 * Controller for a single property.
 */

angular.module('GSB.controllers.propertyType.string', ['GSB.config'])
  //Inject $scope, $http, $log and globalConfig (see @ js/config.js) into controller
  .controller('StringPropertyCtrl', ['$scope', '$http', '$log', 'globalConfig', function($scope, $http, $log, globalConfig) {

    $scope.allowedStringComparisons = [
      {
        label: "contains",
        f : 'regex(%after_arithmetic%, "%input%", "i")'
      },
      {
        label: "equals",
        f : '%after_arithmetic%^^xsd:string="%input%"^^xsd:string'
      },
      {
        label: "equals not",
        f : '%after_arithmetic%^^xsd:string!="%input%"^^xsd:string'
      },
      {
        label: "starts with",
        f : 'regex(%after_arithmetic%, "^%input%", "i")'
      },
      {
        label: "ends with",
        f : 'regex(%after_arithmetic%, "%input%$", "i")'
      },
      {
        label: "REGEX",
        f : 'regex(%after_arithmetic%, "%input%", "%flags%")'
      }
    ];

    $scope.allowedLanguages = globalConfig['allowedLanguages'];

    $scope.stringComparison = null;

    $scope.$watch('stringComparison',function (newValue){
      renderComparison(newValue.f,$scope.comparisonInput,$scope.comparisonRegexFlags);
    });

    $scope.comparisonInput = "";

    $scope.$watch('comparisonInput',function (newValue){
      renderComparison($scope.stringComparison.f,newValue,$scope.comparisonRegexFlags)
    });

    $scope.comparisonRegexFlags = "";

    $scope.$watch('comparisonRegexFlags',function (newValue){
      renderComparison($scope.stringComparison.f,$scope.comparisonInput,newValue)
    });

    function renderComparison(f,input,flags)
    {
      if(input === null || input=== undefined || input === '' ||f === undefined || f === null){
        $scope.compare = null
        renderLangCompare();
        return;
      }
      $scope.compare = f.replace(/%input%/,input).replace(/%flags%/,flags);
      renderLangCompare();
    }

    $scope.selectedLanguage = null;

    $scope.$watch('selectedLanguage',function (newValue){
      renderLangCompare();
    });

    function renderLangCompare(){
      if($scope.selectedLanguage === null || $scope.selectedLanguage === undefined ||$scope.selectedLanguage === ''){
        $scope.propertyInst.compare = $scope.compare;
      } else if($scope.compare===null || $scope.compare === undefined){
        $scope.propertyInst.compare = 'langMatches(lang(%after_arithmetic%), "'+$scope.selectedLanguage+'")'
      } else {
        $scope.propertyInst.compare = 'langMatches(lang(%after_arithmetic%), "' + $scope.selectedLanguage + '") && ' + $scope.compare;
      }
    }

  }]);