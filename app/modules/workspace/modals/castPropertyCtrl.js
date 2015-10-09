(function () {
    'use strict';
    /**
     * SubjectCollectionCtrl
     * Controller for all subjects.
     */

    angular.module('VSB.modals')
        .controller('castPropertyCtrl', castPropertyCtrl);

    function castPropertyCtrl($scope, property, $modalInstance) {

        $scope.property = property;

        $scope.availableCasts = [
            'DATE_PROPERTY',
            'STRING_PROPERTY',
            'NUMBER_PROPERTY'
        ];

        $scope.selected = property.type;

        $scope.select = function (type) {
            if ($scope.selected === type) {
                $scope.selected = null;
            } else {
                $scope.selected = type;
            }
        };
        $scope.ok = function () {
            if ($scope.selected !== null) {
                property.type = $scope.selected;
                property.compareRaw = {};
                property.compare = null;
                property.typeCasted = true;

            }
            $modalInstance.dismiss();
        };

        $scope.cancel = $modalInstance.dismiss;

    }

})();