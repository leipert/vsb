'use strict';

/**
 * PropertyInstanceCtrl
 * Controller for a single property.
 */

angular.module('GSB.controllers.propertyType.string', ['GSB.config'])
  //Inject $scope, $http, $log and globalConfig (see @ js/config.js) into controller
  .controller('StringPropertyCtrl', ['$scope', '$http', '$log', 'globalConfig', function($scope, $http, $log, globalConfig) {

    var start = angular.copy($scope.propertyInst.compareRaw);

    //Rules for String comparisons
    $scope.allowedStringComparisons = [
      {
        label: 'contains',
        f : 'regex(%after_arithmetic%, "%input%", "i")',
        showFlags : false
      },
      {
        label: 'equals',
        f : '(str(%after_arithmetic%)="%input%")',
        showFlags : false
      },
      {
        label: 'equals not',
        f : '(str(%after_arithmetic%)!="%input%")',
        showFlags : false
      },
      {
        label: 'starts with',
        f : 'regex(%after_arithmetic%, "^%input%", "i")',
        showFlags : false
      },
      {
        label: 'ends with',
        f : 'regex(%after_arithmetic%, "%input%$", "i")',
        showFlags : false

      },
      {
        label: 'REGEX',
        f : 'regex(%after_arithmetic%, "%input%", "%flags%")',
        showFlags : true
      }
    ];

    $scope.allowedLanguages = globalConfig.allowedLanguages;

    $scope.stringComparison = null;
    $scope.comparisonInput = '';
    $scope.comparisonRegexFlags = 'i';


    if(start !== null && start !== undefined){
      if(start.selectedLanguage !== null && start.selectedLanguage !== undefined) {
        $scope.selectedLanguage = start.selectedLanguage;
      }
      if(start.stringComparison !== null && start.stringComparison !== undefined) {
        $scope.stringComparison = start.stringComparison;
      }
      if(start.comparisonInput !== null && start.comparisonInput !== undefined) {
        $scope.comparisonInput = start.comparisonInput;
      }
      if(start.comparisonRegexFlags !== null && start.comparisonRegexFlags !== undefined) {
        $scope.comparisonRegexFlags = start.comparisonRegexFlags;
      }
    }

    //Observers for String comparisons
    $scope.$watch('stringComparison',function (newValue){
      renderComparison(newValue,$scope.comparisonInput,$scope.comparisonRegexFlags);
      $scope.propertyInst.compareRaw.stringComparison = newValue;
      if(newValue !== null) {
        $scope.showFlags = $scope.allowedStringComparisons[newValue].showFlags;
      }
    });


    $scope.$watch('comparisonInput',function (newValue){
      $scope.propertyInst.compareRaw.comparisonInput = newValue;
      renderComparison($scope.stringComparison,newValue,$scope.comparisonRegexFlags);
    });


    $scope.$watch('comparisonRegexFlags',function (newValue){
      $scope.propertyInst.compareRaw.comparisonRegexFlags = newValue;
      renderComparison($scope.stringComparison,$scope.comparisonInput,newValue);
    });

    /*
     * Handles updates comparison for String properties
     */
    function renderComparison(method,input,flags)
    {
      if(input === null || input=== undefined || input === '' ||method === undefined || method === null){
        $scope.compare = null;
        renderLangCompare();
        return;
      }
      $scope.compare = $scope.allowedStringComparisons[method].f.replace(/%input%/,input).replace(/%flags%/,flags);
      renderLangCompare();
    }

    $scope.selectedLanguage = null;

    $scope.$watch('selectedLanguage',function (){
      renderLangCompare();
    });

    /*
     * Updates comparison for String properties
     */
    function renderLangCompare(){
      $scope.propertyInst.compareRaw.selectedLanguage = $scope.selectedLanguage;
      if($scope.selectedLanguage === null || $scope.selectedLanguage === undefined ||$scope.selectedLanguage === ''){
        $scope.propertyInst.compare = $scope.compare;
      } else if($scope.compare===null || $scope.compare === undefined){
        $scope.propertyInst.compare = 'langMatches(lang(%after_arithmetic%), "'+$scope.selectedLanguage+'")';
      } else {
        $scope.propertyInst.compare = 'langMatches(lang(%after_arithmetic%), "' + $scope.selectedLanguage + '") && ' + $scope.compare;
      }
    }

  }]);