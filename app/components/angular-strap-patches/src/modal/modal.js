(function () {
    'use strict';
    angular.module('zenubu.ngStrap.modal', ['mgcrea.ngStrap.modal', 'ngSanitize'])

        .config(function ($modalProvider) {
            angular.extend($modalProvider.defaults, {
                html: true
            });
        })
        .config(function ($provide) {

            // Use decorator to add new functionality
            $provide.decorator('$modal', function ($controller, $delegate, $injector, $q, $rootScope) {

                // Add new open() method

                var defer;

                function monkeyPatch(config) {

                    defer = $q.defer();

                    var $modal = $delegate(config);

                    $modal.dismiss = function (reason) {
                        defer.reject(reason);
                    };

                    var originalHide = $modal.hide;

                    $modal.hide = function () {
                        originalHide();
                        $modal.destroy();
                    };

                    $modal.close = function (data) {
                        defer.resolve(data);
                    };

                    $modal.result = defer.promise
                        .then(function (data) {
                            $modal.hide();
                            return data;
                        }).catch(function (reason) {
                            $modal.hide();
                            return $q.reject(reason);
                        });

                    return $modal;

                }

                monkeyPatch.open = modalOpen;


                //////////

                /*
                 * $modal.open() function
                 *
                 * This function adds new options to `$modal()`.
                 *
                 * New options:
                 * - controller {String|Function} First param of $controller. For string, controllerAs syntax is supported.
                 * - controllerAs {String} The 'as X' part of controllerAs syntax.
                 * - resolve {Object} Like the resolve in ngRoute
                 *
                 * Notes:
                 * -- Use either `controller: myCtrl as vm` or `controllerAs: vm`. Don't use both.
                 * -- Not sure if ngAnnotate supports this. It should since it understands '$modal.open()' in UI Bootstrap
                 */
                function modalOpen(config) {
                    var ctrl, resolvePromises = [];
                    var allDone;
                    var options = _.omit(config, ['controller', 'controllerAs', 'resolve']); // Options to be passed to $modal()
                    var modalScope = options.scope || $rootScope;

                    // Resolve
                    if (config.resolve) {
                        resolvePromises = _
                            .map(config.resolve, function (resolveFunc) {
                                return $injector.invoke(resolveFunc);
                            });
                    }

                    // Setup controller
                    if (config.controller) {
                        allDone = $q.all(resolvePromises)
                            .then(function (resolves) {
                                var locals = {};

                                // Assign resolves
                                var iter = 0;
                                _.forEach(config.resolve, function (resolveFunc, name) {
                                    locals[name] = resolves[iter++];
                                });

                                // Create new scope
                                modalScope = modalScope.$new();

                                locals.$scope = modalScope;

                                locals.$modalInstance = {};

                                locals.$modalInstance.dismiss = function (reason) {
                                    defer.reject(reason);
                                };
                                locals.$modalInstance.close = function (reason) {
                                    defer.resolve(reason);
                                };

                                // Instantiate controller
                                ctrl = $controller(config.controller, locals);

                                if (config.controllerAs) {
                                    modalScope[config.controllerAs] = ctrl;
                                }
                            });
                    }

                    return allDone.then(function () {
                        // Prepare final options
                        _.assign(options, {
                            scope: modalScope
                        });

                        return monkeyPatch(options);
                    });


                }

                return monkeyPatch;

            });
        });
})();