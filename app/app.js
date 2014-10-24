(function () {
    'use strict';

// Loads all our components
    angular.module('GSB', [
        'GSB.config',
        'GSB.layout',
        'GSB.filters',
        'GSB.subject',
        'GSB.mainCtrl',
        'GSB.languageService',
        'ui.router'
    ])
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
                    templateUrl: '/modules/layout/workspace/content.tpl.html'
                },
                navigation: {
                    templateUrl: '/modules/layout/workspace/navigation.tpl.html'
                }
            }
        });

        $stateProvider.state('result', {
            url: '/result',
            views: {
                content: {
                    templateUrl: '/modules/layout/result/content.tpl.html'
                },
                navigation: {
                    templateUrl: '/modules/layout/result/navigation.tpl.html'
                }
            }
        });

        $urlRouterProvider.otherwise('/workspace');
    }


})();