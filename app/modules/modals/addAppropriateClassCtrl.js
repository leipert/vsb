(function () {
    'use strict';
    /**
     * SubjectCollectionCtrl
     * Controller for all subjects.
     */

    angular.module('GSB.modals', ['ui.bootstrap', 'GSB.subject.service'])
        .controller('addAppropriateClassCtrl', addAppropriateClassCtrl);

    function addAppropriateClassCtrl($scope, property, SubjectService, subject, $modalInstance) {

        $scope.property = property;

        $scope.subject = subject;

        $scope.availableSubjects = filterSubjectCollection(SubjectService.getAvailableClasses());

        $scope.arrowClass = (property.type === 'OBJECT_PROPERTY')?'fa-long-arrow-right':'fa-long-arrow-left';

        $scope.selected = null;

        $scope.select = function (subject) {
            if ($scope.selected === subject) {
                $scope.selected = null;
            } else {
                $scope.selected = subject;
            }
        };
        $scope.ok = function () {
            if($scope.selected !== null){
                var newSubject = SubjectService.addSubject($scope.selected);
                property.hasFilter = true;
                property.linkTo = newSubject;
            }
            $modalInstance.dismiss();
        };

        $scope.cancel = $modalInstance.dismiss;

        function filterSubjectCollection(propertyCollection) {
            return _(propertyCollection)
                .filter(function (value) {
                    return _.contains(property.$range, value.uri);
                })
                .value();
        }
    }

})();