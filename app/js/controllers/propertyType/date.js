'use strict';

/**
 * PropertyInstanceCtrl
 * Controller for a single property.
 */

angular.module('GSB.controllers.propertyType.date', ['GSB.config','ui.bootstrap'])
    //Inject $scope, $http, $log and globalConfig (see @ js/config.js) into controller
    .controller('DatePropertyCtrl', ['$scope', '$http', '$log', 'globalConfig', function($scope, $http, $log, globalConfig) {

    $scope.open = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.opened = true;
    };

    var start = angular.copy($scope.propertyInst.compareRaw);

    //Rules for date comparisons
    $scope.allowedDateComparisons = [
            {
                label: "equals",
                f : 'xsd:dateTime(%after_arithmetic%) >= "%input_start_of_day%"^^xsd:dateTime' +
                '&& xsd:dateTime(%after_arithmetic%) <= "%input_end_of_day%"^^xsd:dateTime'
            },
            {
                label: "equals not",
              f : 'xsd:dateTime(%after_arithmetic%) < "%input_start_of_day%"^^xsd:dateTime' +
              '|| xsd:dateTime(%after_arithmetic%) > "%input_end_of_day%"^^xsd:dateTime'
            },
            {
                label: "after",
              f : 'xsd:dateTime(%after_arithmetic%) > "%input_end_of_day%"^^xsd:dateTime'
            },
            {
                label: "before",
              f : 'xsd:dateTime(%after_arithmetic%) < "%input_start_of_day%"^^xsd:dateTime'
            }
        ];

    $scope.dateComparison = null;
    $scope.comparisonInput = "";


    if(start !== null && start !== undefined){
      if(start.dateComparison !== null && start.dateComparison !== undefined) {
        $scope.dateComparison = start.dateComparison;
      }
      if(start.comparisonInput != null && start.comparisonInput !== undefined) {
        $scope.comparisonInput = new Date(start.comparisonInput);
      }
    }

        //Observers for date comparison

        $scope.$watch('dateComparison',function (newValue){
            $scope.propertyInst.compareRaw.dateComparison = newValue;
          renderDate();
        });


        $scope.$watch('comparisonInput',function (newValue){
          $scope.propertyInst.compareRaw.comparisonInput = newValue;
          renderDate();
        });
        
        /*
         * Updates comparison for date properties
         */

        function renderDate(){
          if($scope.dateComparison != null && $scope.comparisonInput instanceof Date){
            var date = $scope.comparisonInput.toDateString() + " UTC";
            $scope.propertyInst.compare =
              $scope.allowedDateComparisons[$scope.dateComparison].f
                .replace(/%input_start_of_day%/g, moment.utc(date).hour(0).minute(0).second(0).format())
                .replace(/%input_end_of_day%/g, moment.utc(date).hour(23).minute(59).second(59).format())

          } else {
            $scope.propertyInst.compare = null;
          }
        }

    }]);
