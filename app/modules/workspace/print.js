(function () {

    'use strict';

    angular.module('VSB.print', [])
        .factory('PrintService', function ($window, $rootScope, $timeout, ArrowService, $q, MessageService) {
            var listeners = {};
            var beforePrintDirty = false;

            return {
                beforePrint: beforePrint,
                registerListener: function (key, value) {
                    listeners[key] = value;
                },
                unregisterListener: function (key) {
                    delete listeners[key];
                }
            };


            function beforePrint() {

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

                return $timeout(function () {
                    ArrowService.repaintEverything();
                    // This is used for Webkit. For some reason this gets called twice there.
                    beforePrintDirty = false;
                    MessageService.addMessage({
                        message: '<span translate="PRINT_PREVIEW_MESSAGE"></span>',
                        dismiss: afterPrint,
                        dismissText: 'CLOSE_PREVIEW',
                        icon: 'print',
                        'class': 'success'
                    });
                }, 100, false);
            }

            function afterPrint() {

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

            }


        })
        .directive('onBeforePrint', function (PrintService) {

            return function (scope, iElement, iAttrs) {
                function onBeforePrint() {
                    scope.$eval(iAttrs.onBeforePrint);
                }

                function onAfterPrint() {
                    scope.$eval(iAttrs.onAfterPrint);
                }

                PrintService.registerListener(scope.$id, iElement);
                iElement.on('beforePrint', onBeforePrint);
                iElement.on('afterPrint', onAfterPrint);

                scope.$on('$destroy', function () {
                    iElement.off('beforePrint', onBeforePrint);
                    iElement.off('afterPrint', onAfterPrint);

                    PrintService.unregisterListener(scope.$id);
                });
            };
        });

})();