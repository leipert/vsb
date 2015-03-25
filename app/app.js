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
        'pascalprecht.translate',
        'ui.router'
    ])
        .factory('MessageService', function () {
            var messages = [];
            return {
                messages: messages,
                addMessage: function (message) {
                    if (_.isString(message)) {
                        message = {
                            message: message
                        };
                    }
                    message.class = 'alert-' + message.class;
                    if (message.icon) {
                        message.icon = 'fa-' + message.icon;
                    }
                    messages.push(message);
                },
                dismiss: function (message) {
                    if (_.isFunction(message.dismiss)) {
                        message.dismiss();
                    }
                    _.remove(messages, message);
                }
            };
        })
        .directive('messages', function () {
            return {
                restrict: 'A',
                scope: true,
                replace: true,
                controller: function (MessageService) {
                    var vm = this;
                    vm.messages = MessageService.messages;
                    vm.dismiss = MessageService.dismiss;
                },
                controllerAs: 'vm',
                template: '<div class="messageContainer" >' +
                '<div class="alert" ng-class="message.class" ng-repeat="message in vm.messages" >' +
                '<a class="pull-right alert-link" href="" ng-click="vm.dismiss(message)">' +
                '<i class="pull-left fa fa-lg fa-times"></i><span ng-if="message.dismissText" translate="{{message.dismissText}}"></span>' +
                '</a>' +
                '<i class="pull-left fa fa-lg fa-fw" ng-if="message.icon" ng-class="message.icon" ></i><span compile="message.message"></span>' +
                '</div>' +
                '</div>'
            };
        })
        .directive('onBeforePrint', function onBeforePrint($window, $rootScope, $timeout, ArrowService, $q, MessageService) {
            var beforePrintDirty = false;
            var listeners = {};

            var promise;

            var beforePrint = function () {

                if (beforePrintDirty) {
                    return;
                }

                beforePrintDirty = true;

                _.forEach(listeners, function (listener) {
                    listener.triggerHandler('beforePrint');
                });

                var scopePhase = $rootScope.$$phase;

                // This must be synchronious so we call digest here.
                if (scopePhase !== '$apply' && scopePhase !== '$digest') {
                    $rootScope.$digest();
                }

                promise = $timeout(function () {
                    ArrowService.repaintEverything();
                    // This is used for Webkit. For some reason this gets called twice there.
                    beforePrintDirty = false;
                    MessageService.addMessage({
                        message: '<span>{{ "PRINT_PREVIEW_MESSAGE" | translate}}</span>',
                        dismiss: afterPrint,
                        dismissText: 'CLOSE_PREVIEW',
                        icon: 'print',
                        'class': 'success'
                    });
                }, 100, false);
                return promise;
            };

            function afterPrint() {

                $q.when(promise).then(function () {

                    _.forEach(listeners, function (listener) {
                        listener.triggerHandler('afterPrint');
                    });

                    var scopePhase = $rootScope.$$phase;

                    // This must be synchronious so we call digest here.
                    if (scopePhase !== '$apply' && scopePhase !== '$digest') {
                        $rootScope.$digest();
                    }
                    $timeout(function () {
                        ArrowService.repaintEverything();
                    }, 0);
                });

            }

            window.print = function () {
                beforePrint();
            };

            return function (scope, iElement, iAttrs) {
                function onBeforePrint() {
                    scope.$eval(iAttrs.onBeforePrint);
                }

                function onAfterPrint() {
                    scope.$eval(iAttrs.onAfterPrint);
                }

                listeners[scope.$id] = iElement;
                iElement.on('beforePrint', onBeforePrint);
                iElement.on('afterPrint', onAfterPrint);

                scope.$on('$destroy', function () {
                    iElement.off('beforePrint', onBeforePrint);
                    iElement.off('afterPrint', onAfterPrint);

                    delete listeners[scope.$id];
                });
            };
        })
        .run(function ($localForage, globalConfig, TranslatorToGSBL, MessageService, $window, $http, $timeout) {

            var parser = document.createElement('a');
            parser.href = globalConfig.baseURL;

            if ($window.location.protocol !== parser.protocol) {

                var hideMessage = false;

                var foo = function () {
                    if (hideMessage) {
                        return;
                    }
                    var message = 'You are trying to view mixed content.<br>' +
                        'Your browser may be blocking data from the endpoint. (The Visual SPARQL Builder is running on ' + $window.location.protocol + ', your SPARQL endpoint on ' + parser.protocol + ')<br>' +
                        'In <b>Firefox</b> you need to navigate to <a class="alert-link" href="' +
                        parser.protocol + $window.location.host + $window.location.pathname + $window.location.hash +
                        '">the ' + parser.protocol + ' version of this site.</a><br>' +
                        'In <b>Chrome</b> you could click on the little armor in the URL bar and \'Load unsafe scripts\' or also navigate to the Firefox link.';

                    MessageService.addMessage({message: message, 'class': 'warning', icon: 'exclamation-triangle'});
                };

                $http.get(globalConfig.baseURL + '?query=select+%3Fs+where+%7B%5B%5D+a+%3Fs%7D+LIMIT+1&format=text%2Fhtml').success(function () {
                    hideMessage = true;
                });

                $timeout(function () {
                }, 1000).then(foo);

            }


            //Some drag and drop variables
            //TODO: Move to own SaveStatusFactory
            $localForage.getItem('current')
                .then(function (data) {
                    if (data !== null && data !== undefined && data.CONFIG === globalConfig.name) {
                        TranslatorToGSBL.translateJSONToGSBL(data);
                    }
                });
        })

        .config(function ($compileProvider) {
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
        })
        .config(stateProviderConfig)
        .run(function ($rootScope, $state) {

            var unRegisterEventWatch = $rootScope.$on('$stateChangeStart', function (e, toState) {

                if (toState.name === 'workspace') {
                    unRegisterEventWatch();
                    return;
                }

                e.preventDefault();
                $state.go('workspace');

            });
        });

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