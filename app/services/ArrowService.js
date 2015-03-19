(function () {
    'use strict';
    angular.module('GSB.arrowService', ['GSB.config'])
        .factory('ArrowService', ArrowService);

    function ArrowService($q, $log) {

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
                    instance.bind('connection', function (info) {
                        var label = info.connection.getParameter('label');
                        if (label === null) {
                            info.connection.removeOverlay('label');
                        } else {
                            info.connection.getOverlay('label').setLabel(label);
                        }
                    });

                })).then(function () {
                    return instance;
                });
            }

        }

        var anchors = [];

        for (var y = 0; y <= 1; y += 1) {
            for (var x = 0; x <= 1; x += 0.125) {
                var dx = 0;
                var offset = 0;
                dx = (x === 0) ? -1 : dx;
                dx = (x === 1) ? 1 : dx;
                if(dx !== 0){
                    offset = (y === 0)? 20 : offset;
                    offset = (y === 1)? -20 : offset;
                }
                anchors.push([x, y, dx, 0, 0, offset]);
            }
        }

        return {
            makeDraggable: function (target, options) {
                return getInstance().then(function (instance) {
                    return instance.draggable(target, options);
                });
            },
            connectToSelf: function (source) {
                source = source.toString();
                return getInstance().then(function (instance) {
                    return instance.connect({
                        source: source,
                        target: source,
                        connector: ['Bezier',
                            {
                                showLoopback: false,
                                curviness: 50,
                                proximityLimit: 0
                            }],
                        cssClass: 'connector',
                        anchors: [[1, 0.25, 1, 0], [1, 0.75, 1, 0]],
                        parameters: {
                            label: null
                        }
                    });
                });
            },
            connect: function (source, target, label) {
                $log.debug('connect', source, target, label);
                source = source.toString();
                target = target.toString();
                return getInstance().then(function (instance) {
                    var connection = instance.connect({
                        source: source,
                        target: target,
                        cssClass: 'connector',
                        endpoints: [['Dot', {cssClass: 'property-endpoint'}], ['Dot', {cssClass: 'hidden'}]],
                        anchors: [['Continuous', {faces: ['left', 'right']}], anchors],
                        connector: 'Bezier',
                        parameters: {
                            label: label
                        }
                    });
                    instance.repaintEverything();
                    return connection;
                });
            }, repaintEverything: function () {
                return getInstance().then(function (instance) {
                    return instance.repaintEverything();
                });
            },

            repaint: function (id) {
                id = id.toString();
                return getInstance().then(function (instance) {
                    return instance.repaint(id);
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
            recalculateOffsets: function (id) {
                id = id.toString();
                return getInstance().then(function (instance) {
                    instance.recalculateOffsets(id);
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