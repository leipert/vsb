(function () {

    'use strict';

    angular.module('VSB.print', [])
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
        });

})();