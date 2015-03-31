(function () {
    'use strict';
    angular.module('VSB.arrowService', ['VSB.config', 'VSB.zIndex'])
        .factory('ArrowService', ArrowService);

    function ArrowService($q, $log, zIndexService) {

        var instance = null;


        function getInstance() {

            if (instance !== null) {
                var defer = $q.defer();
                defer.resolve(instance);
                return defer.promise;
            } else {
                return $q.when(jsPlumb.ready(function () {
                    instance = jsPlumb.getInstance({
                        Endpoint: ['Dot', {cssClass: 'hidden'}],
                        //Endpoint: ['Dot', {}],
                        ConnectionOverlays: [
                            ['Arrow', {
                                location: 1,
                                id: 'arrow',
                                cssClass: 'arrow',
                                length: 14,
                                foldback: 0.8
                            }],
                            ['Label', {label: '', id: 'label', cssClass: 'connector-label'}]
                        ],
                        Container: 'workspace'
                    });
                    //instance.draggable('workspace', {containment: "body"});
                    instance.bind('connection', function (info) {
                        var label = info.connection.getParameter('label');
                        if (label === null) {
                            info.connection.removeOverlay('label');
                        } else {
                            var overlay = info.connection.getOverlay('label');

                            zIndexService.registerEndpoint(info.connection.getParameter('sourceParent'), overlay);

                            overlay.setLabel(label);
                        }
                    });

                })).then(function () {
                    return instance;
                });
            }

        }

        var targetAnchors = [];

        for (var y = 0; y <= 1; y += 1) {
            for (var x = 0; x <= 1; x += 0.125) {
                var dx = 0;
                var offset = 0;
                dx = (x === 0) ? -1 : dx;
                dx = (x === 1) ? 1 : dx;
                if (dx !== 0) {
                    offset = (y === 0) ? 20 : offset;
                    offset = (y === 1) ? -20 : offset;
                }
                targetAnchors.push([x, y, dx, 0, 0, offset]);
            }
        }

        var sourceAnchors = [
            [1, 0.5, 1, 0, 0, 0, 'right'],
            [0, 0.5, -1, 0, 0, 0, 'left']
        ];

        return {
            makeDraggable: function (target, options) {
                if(_.isNumber(target)){
                    target = target + '';
                }
                return getInstance().then(function (instance) {
                    return instance.draggable(target, options);
                });
            },
            connectToSelf: function (source, sourceParent) {
                source = source.toString();
                return getInstance().then(function (instance) {
                    var connection = instance.connect({
                        source: source,
                        target: source,
                        connector: ['Bezier',
                            {
                                showLoopback: false,
                                curviness: 50,
                                proximityLimit: 0
                            }],
                        cssClass: 'connector connector-self',
                        anchors: [[1, 0.25, 1, 0], [1, 0.75, 1, 0]],
                        parameters: {
                            label: null
                        }
                    });

                    zIndexService.registerEndpoint(sourceParent, connection);

                    return connection;
                });
            },
            connect: function (source, target, label, sourceParent) {
                $log.debug('connect', source, target, label);
                source = source.toString();
                target = target.toString();
                return getInstance().then(function (instance) {

                    var connection = instance.connect({
                        source: source,
                        target: target,
                        cssClass: 'connector',
                        endpoints: ['Blank', 'Blank'],
                        anchors: [sourceAnchors, targetAnchors],
                        connector: 'Bezier',
                        parameters: {
                            label: label,
                            sourceParent: sourceParent
                        }
                    });

                    zIndexService.registerEndpoint(sourceParent, connection);


                    instance.repaintEverything();
                    return connection;
                });
            }, repaintEverything: function () {
                return getInstance().then(function (instance) {
                    return instance.repaintEverything();
                });
            },
            detach: function (connection) {
                return getInstance().then(function (instance) {
                    if (connection !== null) {
                        return instance.detach(connection);
                    }
                });
            },
            deleteAllConnections: function (id) {
                id = id.toString();
                return getInstance().then(function (instance) {
                    instance.setSuspendDrawing(true);
                    if (id !== null) {
                        instance.removeAllEndpoints(id);
                    }
                    instance.setSuspendDrawing(false);
                    return instance.repaintEverything();
                });
            },
            updateConnectionLabel: function (connection, label) {
                if (connection !== null) {
                    return connection.getOverlay('label').setLabel(label);
                }
            },
            recalculateOffsets: function (id, repaint) {
                id = id.toString();
                return getInstance().then(function (instance) {
                    instance.recalculateOffsets(id);
                    if(repaint){
                        instance.repaintEverything();
                    }
                });
            },
            resetService: function () {
                if (instance !== null) {
                    instance.cleanupListeners();
                    instance.reset();
                }
                instance = null;
            }


        };
    }
})();