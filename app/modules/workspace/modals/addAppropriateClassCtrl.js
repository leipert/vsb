(function () {
    'use strict';
    /**
     * SubjectCollectionCtrl
     * Controller for all subjects.
     */

    angular.module('VSB.modals', ['zenubu.ngStrap', 'VSB.subject.service'])
        .controller('addAppropriateClassCtrl', addAppropriateClassCtrl);

    function addAppropriateClassCtrl($scope, property, SubjectService, subject, $modalInstance, translationCacheService) {

        $scope.property = property;

        $scope.subject = subject;

        $scope.search = {};

        $scope.availableSubjects = [];

        $scope.arrowClass = (property.type === 'OBJECT_PROPERTY') ? 'fa-long-arrow-right' : 'fa-long-arrow-left';

        $scope.selected = null;

        $scope.select = function (subject) {
            if ($scope.selected === subject) {
                $scope.selected = null;
            } else {
                $scope.selected = subject;
            }
        };
        $scope.ok = function () {
            if ($scope.selected !== null) {
                var newSubject = SubjectService.addSubjectByURI(angular.copy($scope.selected.uri));
                property.hasFilter = true;
                property.linkTo = newSubject;
            }
            $modalInstance.dismiss();
        };

        $scope.cancel = $modalInstance.dismiss;

        translationCacheService.getFromCache('availableClasses').then(function (classes) {
            $scope.availableSubjects = _(classes)
                .filter(function (value) {
                    return _.contains(property.$range, value.uri);
                })
                .value();
        });


    }

})();