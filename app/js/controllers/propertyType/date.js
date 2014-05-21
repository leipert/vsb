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

        //Observers for date comparison
        $scope.dateComparison = null;

        $scope.$watch('dateComparison',function (newValue){
          renderDate();
        });

        $scope.comparisonInput = "";

        $scope.$watch('comparisonInput',function (newValue){
          renderDate();
        });
        
        /*
         * Updates comparison for date properties
         */

        function renderDate(){
          if($scope.dateComparison != null && $scope.comparisonInput != null && $scope.comparisonInput != ''){

            var date = $scope.comparisonInput.toDateString() + " UTC";
            $scope.propertyInst.compare =
              $scope.dateComparison.f
                .replace(/%input_start_of_day%/g, moment.utc(date).hour(0).minute(0).second(0).format())
                .replace(/%input_end_of_day%/g, moment.utc(date).hour(23).minute(59).second(59).format())

          } else {
            $scope.propertyInst.compare = null;
          }
        }

    }]);
