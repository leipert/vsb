(function () {
    'use strict';
    /**
     * SubjectCollectionCtrl
     * Controller for all subjects.
     */

    angular.module('GSB.modals', ['ui.bootstrap', 'GSB.subject.service'])
        .controller('findRelationModalCtrl', findRelationModalCtrl);

    function findRelationModalCtrl($scope, subjects, possibleRelations, SubjectService, $modalInstance) {
        $scope.subjects = _.cloneDeep(subjects);
        $scope.subjects[0].$availableProperties = filterPropertyCollection(subjects[0].$availableProperties);
        $scope.subjects[1].$availableProperties = filterPropertyCollection(subjects[1].$availableProperties);
        if ($scope.subjects[0].$id === $scope.subjects[1].$id) {
            $scope.dontShowSecond = true;
        }
        $scope.subject1 = subjects[0].alias;
        $scope.subject2 = subjects[1].alias;

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
            var subject = SubjectService.getSubjectById(subjects[$scope.fromIDX].$id);
            var target = SubjectService.getSubjectById(subjects[$scope.toIDX].$id);
            var newProperty = subject.addProperty(angular.copy($scope.selected));
            newProperty.hasFilter = true;
            newProperty.linkTo = target;
            $modalInstance.dismiss();
        };

        $scope.cancel = $modalInstance.dismiss;

        function filterPropertyCollection(propertyCollection) {
            return _(propertyCollection)
                .where({type: 'OBJECT_PROPERTY'})
                .filter(function (value) {
                    return _.contains(possibleRelations, value.uri);
                })
                .value();
        }
    }

})();