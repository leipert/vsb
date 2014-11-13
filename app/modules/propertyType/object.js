(function () {
    'use strict';

    /**
     * Property directive
     * Creates the possibility to use a <property> element,
     * which will be replaced with the contents of template/property.html
     */

    angular.module('GSB.propertyType.object', ['GSB.arrowService', 'GSB.connectionService'])
        .directive('objectPropertyDir', objectPropertyDir)
        .filter('objectPropertyFilter', objectPropertyFilter);

    function objectPropertyDir() {
        return {
            restrict: 'A',
            replace: true,
            scope: {
                property: '='
            },
            controllerAs: 'vm',
            controller: ObjectPropertyCtrl,
            templateUrl: '/modules/propertyType/object.tpl.html'
        };
    }

    function ObjectPropertyCtrl($scope, SubjectService, connectionService) {
        //Observes and updates the values of linked partner of the choosen object properties

        var lastConnection = null;

        var vm = this;

        vm.subjects = SubjectService.subjects;

        var property = $scope.property;

        function setLastConnection(connection) {
            lastConnection = connection;
        }

        $scope.$watch('property.alias', function (nv) {
            connectionService.updateConnectionLabel(lastConnection, nv);
        });

        $scope.$watch('property.linkTo', function (nv) {
            var source = angular.copy(property.$id),
                target,
                connectionLabel = property.alias,
                inverse = (property.type === 'INVERSE_PROPERTY');
            if (nv !== undefined && nv !== null) {
                target = angular.copy(nv.$id);
            }
            connectionService.connect(source, target, inverse, connectionLabel).then(setLastConnection);
        });

    }

    function objectPropertyFilter() {
        return function (arrayOfObjects, key, filter) {
            if (key === null || key === undefined || typeof filter !== 'object' || filter.length === 0) {
                return arrayOfObjects;
            }
            return arrayOfObjects.filter(function (currentObject) {
                    if (currentObject[this.key] === undefined) {
                        return true;
                    }
                    for (var i = 0, j = this.filter.length; i < j; i++) {
                        if (currentObject[this.key].indexOf(this.filter[i]) !== -1) {
                            return true;
                        }
                    }
                    return false;
                }, {key: key, filter: filter}
            );
        };
    }


})
();