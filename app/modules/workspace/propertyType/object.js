(function () {
    'use strict';

    /**
     * Property directive
     * Creates the possibility to use a <property> element,
     * which will be replaced with the contents of template/property.html
     */

    angular.module('VSB.propertyType.object', ['VSB.arrowService', 'VSB.connectionService'])
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
            templateUrl: '/modules/workspace/propertyType/object.tpl.html'
        };
    }

    function ObjectPropertyCtrl($scope, SubjectService, connectionService) {
        //Observes and updates the values of linked partner of the choosen object properties

        var lastConnection = null;

        var vm = this;

        var property = $scope.property;

        var inverse = (property.type === 'INVERSE_PROPERTY');

        vm.subjects = SubjectService.subjects;

        var source = angular.copy(property.$id);

        connectionService.registerDestroyWatcher(property.$id, function (id) {
            if (property.linkTo.$id.toString() === id.toString()) {
                property.linkTo = undefined;
            }
        });

        $scope.$watch('property.alias', function (nv) {
            if (inverse) {
                nv = angular.copy(nv) + '⁻¹';
            }
            connectionService.updateConnectionLabel(lastConnection, nv);
        });

        $scope.$watch('property.linkTo', function (nv) {
            if (nv !== undefined && nv !== null) {
                var target = angular.copy(nv.$id);
                var connectionLabel = inverse ? property.alias + '⁻¹' : property.alias;
                connectionService.connect(source, target, connectionLabel).then(setLastConnection);
            } else {
                connectionService.disconnect(source);
                setLastConnection(null);
            }
        });

        $scope.$on('$destroy', function () {
            connectionService.disconnect(source);
            setLastConnection(null);
        });

        function setLastConnection(connection) {
            lastConnection = connection;
        }

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