(function () {
    'use strict';
    angular.module('VSB.layout', [
        'VSB.layout.workspace',
        'VSB.layout.workspace.navigation',
        'VSB.layout.result',
        'VSB.language',
        'ui.router'
    ])
        .controller('NavigationCtrl', NavigationCtrl)
        .config(stateProviderConfig)
        .run(forceWorkSpaceOnStart);

    /* @ngInject */
    function stateProviderConfig($stateProvider, $urlRouterProvider) {

        $stateProvider.state('workspace', {
            url: '/workspace',
            views: {
                content: {
                    controller: 'WorkspaceCtrl',
                    controllerAs: 'vm',
                    templateUrl: '/modules/workspace/content.tpl.html'
                },
                navigation: {
                    controller: 'WorkspaceNavigationCtrl',
                    controllerAs: 'vm',
                    templateUrl: '/modules/workspace/navigation.tpl.html'
                }
            }
        });

        $stateProvider.state('result', {
            url: '/result',
            views: {
                content: {
                    controller: 'ResultCtrl',
                    controllerAs: 'vm',
                    templateUrl: '/modules/result/content.tpl.html',
                    resolve: {
                        /* @ngInject */
                        JSON: function (ParserManager, $timeout) {
                            return $timeout(function () {
                                return ParserManager.translateVSBLToSPARQL();
                            }, 300);
                        }
                    }
                },
                navigation: {
                    templateUrl: '/modules/result/navigation.tpl.html'
                }
            }
        });

        $urlRouterProvider.otherwise('/workspace');
    }

    function forceWorkSpaceOnStart($rootScope, $state) {

        var unRegisterEventWatch = $rootScope.$on('$stateChangeStart', function (e, toState) {

            if (toState.name === 'workspace') {
                unRegisterEventWatch();
                return;
            }

            e.preventDefault();
            $state.go('workspace');

        });
    }


    function NavigationCtrl($scope, $rootScope, $localForage, ArrowService, $timeout) {

        $scope.switchStatus = true;

        $scope.setSwitchStatus = function (newStatus) {
            setSwitchStatus(newStatus).then(function (newStatus) {
                if (newStatus) {
                    $rootScope.$emit('moveSubjectDrag', {x: 200, y: 0}, true);
                } else {
                    $rootScope.$emit('moveSubjectDrag', {x: -200, y: 0}, true);
                }
            });

        };

        $localForage.getItem('switchStatus').then(function (data) {
            if (_.isArray(data)) {
                setSwitchStatus(data[0]);
            } else {
                setSwitchStatus(data);
            }
        }, function () {
            setSwitchStatus(true);
        });

        function setSwitchStatus(newStatus) {
            if (!_.isBoolean(newStatus)) {
                newStatus = true;
            }
            return $localForage.setItem('switchStatus', [newStatus]).then(function () {
                $scope.switchStatus = newStatus;
                $rootScope.$emit('mainOffset', newStatus);
                $timeout(function () {
                    ArrowService.repaintEverything();
                }, 0);
                return newStatus;
            });
        }

        $rootScope.$on('updateJSON', function (event, json) {
            var blob = new Blob([json], {type: 'application/json'});
            $scope.blobURL = URL.createObjectURL(blob);
        });

    }

})();