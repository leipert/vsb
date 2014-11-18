(function () {
    'use strict';

// Loads all our components
    angular.module('GSB', [
        'GSB.config',
        'GSB.layout',
        'GSB.filters',
        'GSB.subject',
        'GSB.mainCtrl',
        'GSB.language',
        'ui.router'
    ])
        .run(function ($localForage, globalConfig, TranslatorToGSBL) {
            //Some drag and drop variables
            //TODO: Move to own SaveStatusFactory
            $localForage.getItem('current')
                .then(function (data) {
                    if (data !== null && data.CONFIG === globalConfig.name) {
                        TranslatorToGSBL.translateJSONToGSBL(data);
                    }
                });
        })

        .config(function ($compileProvider) {
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
        })

        .config(function (uiSelectConfig) {
            uiSelectConfig.theme = 'bootstrap';
        })
        .config(stateProviderConfig);
    /* @ngInject */
    function stateProviderConfig($stateProvider, $urlRouterProvider) {

        $stateProvider.state('workspace', {
            url: '/workspace',
            views: {
                content: {
                    controller: 'WorkspaceCtrl',
                    controllerAs: 'vm',
                    templateUrl: '/modules/layout/workspace/content.tpl.html'
                },
                navigation: {
                    controller: 'WorkspaceNavigationCtrl',
                    controllerAs: 'vm',
                    templateUrl: '/modules/layout/workspace/navigation.tpl.html'
                }
            }
        });

        $stateProvider.state('result', {
            url: '/result',
            views: {
                content: {
                    controller: 'ResultCtrl',
                    controllerAs: 'vm',
                    templateUrl: '/modules/layout/result/content.tpl.html',
                    resolve: {
                        /* @ngInject */
                        JSON: function (TranslatorManager, $timeout) {
                            return $timeout(function () {
                                return TranslatorManager.translateGSBLToSPARQL();
                            }, 300);
                        }
                    }
                },
                navigation: {
                    templateUrl: '/modules/layout/result/navigation.tpl.html'
                }
            }
        });

        $urlRouterProvider.otherwise('/workspace');
    }


})();