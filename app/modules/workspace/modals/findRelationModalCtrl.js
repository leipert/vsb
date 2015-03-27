(function () {
    'use strict';
    /**
     * SubjectCollectionCtrl
     * Controller for all subjects.
     */

    angular.module('VSB.modals')
        .controller('findRelationModalCtrl', findRelationModalCtrl);

    function findRelationModalCtrl($scope, subjects, possibleRelations, SubjectService, $modalInstance) {

        $scope.search = {};

        $scope.subjects = _.cloneDeep(subjects);
        $scope.subjects[0].$availableProperties = [];
        // filterPropertyCollection(subjects[0].$availableProperties);
        $scope.subjects[1].$availableProperties = [];
        // filterPropertyCollection(subjects[1].$availableProperties);

        subjects[0].getAvailableProperties(':relation', null)
            .then(filterPropertyCollection)
            .then(function (availableProperties) {
                $scope.subjects[0].$availableProperties = availableProperties;
            });

        subjects[1].getAvailableProperties(':relation', null)
            .then(filterPropertyCollection)
            .then(function (availableProperties) {
                $scope.subjects[1].$availableProperties = availableProperties;
            });


        if ($scope.subjects[0].$id === $scope.subjects[1].$id) {
            $scope.dontShowSecond = true;
        }
        $scope.subject1 = subjects[0].alias;
        $scope.subject2 = subjects[1].alias;

        subjects[0].$searchRelation = false;
        subjects[1].$searchRelation = false;


        $scope.selected = null;
        $scope.fromIDX = null;

        $scope.select = function (property, idx) {
            if ($scope.selected === property && $scope.fromIDX === idx) {
                $scope.selected = null;
                $scope.fromIDX = null;
            } else {
                $scope.selected = property;
                $scope.fromIDX = idx;
                $scope.toIDX = idx === 0 ? 1 : 0;
            }
        };
        $scope.ok = function () {
            if ($scope.selected !== null) {
                var subject = SubjectService.getSubjectById(subjects[$scope.fromIDX].$id);
                var target = SubjectService.getSubjectById(subjects[$scope.toIDX].$id);
                var newProperty = angular.copy($scope.selected);
                newProperty.hasFilter = true;
                newProperty.linkTo = target;
                newProperty.$copied = true;
                subject.addProperty(newProperty);
            }
            $modalInstance.dismiss();
        };

        $scope.cancel = $modalInstance.dismiss;

        function filterPropertyCollection(data) {

            return _(data.items)
                .filter(function (value) {
                    return _.contains(possibleRelations, value.uri);
                })
                .value();
        }
    }

})();