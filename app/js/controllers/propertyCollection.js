'use strict';

/**
 * PropertyCollectionCtrl
 * Controller which holds all the properties of a subject.
 */

angular.module('GSB.controllers.propertyCollection', ['GSB.config', 'GSB.services.endPoint'])
//Inject $scope, $http, $log and globalConfig (see @js/config.js, @js/services/endPoint.js) into controller
    .controller('PropertyCollectionCtrl', ['$scope', '$http', '$q', '$log', 'globalConfig', 'EndPointService', function ($scope, $http, $q, $log, globalConfig, EndPointService) {

        var $selectedProperties = $scope.subjectInst.$selectedProperties;
        EndPointService.$availableProperties = [];
        EndPointService.getProperties($scope.subjectInst.uri)
            .then(function (properties) {
                $log.info('Properties loaded', properties);
                $scope.subjectInst.$availableProperties = properties;
            })
            .fail(function (err) {
                $log.error('An error occurred: ', err);
            });

        $scope.propertyOperators = [
            {
          label: 'MUST',
            value: 1
        },
            {
                label: 'MAY',
                value: 2
            },
            {
                label: 'CAN\'T',
                value: 3
            }
        ];


        /**
         * Adds a property selected from the $availableProperties of a
         * subjectInst to the $selectedProperties of the same subjectInst
         */
        $scope.addProperty = function () {
            var temp = angular.copy($scope.propertySelected);
            temp.$operator = 1;
            temp.alias = temp.$label;
            temp.arithmetic = null;
            temp.compareRaw = {};
            temp.link = null;
            temp.view = true;
            temp.optional = false;
            temp.arithmetic = 'x';
            temp.compare = null;
            $selectedProperties.push(temp);
            $scope.propertySelected = undefined;
        };

        /**
         * Removes a given propertyInst from the $selectedProperties of the subjectInst
         * @param propertyInst
         */
        $scope.removeProperty = function (propertyInst) {
            $selectedProperties.splice($selectedProperties.indexOf(propertyInst), 1);
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
        };

        /**
         * Removes a given aggregateInst from the $selectedAggregates of the subjectInst
         * @param aggregateInst
         */
        $scope.removeAggregate = function (aggregateInst) {
            $scope.subjectInst.$selectedAggregates.splice($scope.subjectInst.$selectedAggregates.indexOf(aggregateInst), 1);
        };

    }]);
