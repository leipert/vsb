(function () {
    'use strict';

// Loads all our components
    angular.module('GSB', [
        'GSB.config',
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

        $stateProvider.state('authenticate', {
            url: '/',
            templateUrl: '/modules/layout/content.tpl.html'
        });

        $urlRouterProvider.otherwise('/');
    }


})();