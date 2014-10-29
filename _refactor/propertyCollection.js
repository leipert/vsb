(function () {
    'use strict';

    /**
     * PropertyCollectionCtrl
     * Controller which holds all the properties of a subject.
     * TODO: REFACTOR, THIS FILE IS DEPRECATED
     */

    angular.module('GSB.property.collection', ['GSB.config', 'GSB.endPointService', 'GSB.arrowService'])
//Inject $scope, $http, $log and globalConfig (see @js/config.js, @js/services/endPoint.js) into controller
        .controller('PropertyCollectionCtrl', PropertyCollectionCtrl);

    function PropertyCollectionCtrl($scope, globalConfig, ArrowService, Property) {

        $scope.doesAliasExist = function (alias) {
            return _.filter($selectedProperties, {alias: alias}).length > 0;
        };


        /**
         * Adds an aggregate selected from the availableAggregates of a
         * subjectInst to the $selectedAggregates of the same subjectInst
         */
        $scope.addAggregate = function () {
            $scope.subjectInst.$selectedAggregates.push(
                angular.copy(
                    {
                        alias: 'cnt',
                        operator: 'COUNT',
                        type: 'AGGREGATE_PROPERTY',
                        link: null,
                        available: angular.copy(globalConfig.aggregateFunctions)
                    }
                ));
            $scope.subjectInst.showAddProperty = false;
        };

        /**
         * Removes a given aggregateInst from the $selectedAggregates of the subjectInst
         * @param aggregateInst
         */
        $scope.removeAggregate = function (aggregateInst) {
            $scope.subjectInst.$selectedAggregates.splice($scope.subjectInst.$selectedAggregates.indexOf(aggregateInst), 1);
        };

    }

})();