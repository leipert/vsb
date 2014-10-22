(function () {
    'use strict';
    angular.module('GSB.arrowService', ['GSB.config'])
        .factory('ArrowService', ArrowService);

    function ArrowService($q) {

        var instance = null;


        function getInstance() {

            if (instance !== null) {
                var defer = $q.defer();
                defer.resolve(instance);
                return defer.promise;
            } else {
                return $q.when(jsPlumb.ready(function () {
                    instance = jsPlumb.getInstance({
                        Endpoint: ['Dot', {cssClass:'hidden'}],
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
                        if(label === null){
                            info.connection.removeOverlay('label');
                        }else{
                            info.connection.getOverlay('label').setLabel(label);
                        }
                    });

                })).then(function () {
                    return instance;
                });
            }

        }

        var factory = {

            addEndpoint: function (id) {
                return getInstance().then(function (instance) {
                    //instance.draggable(id, {filter: 'mover'});
                    return instance.addEndpoint(id, {});
                });
            },
            connectToSelf: function (source) {
                return getInstance().then(function (instance) {
                    return instance.connect({
                        source: source,
                        target: source,
                        connector: ['Bezier',
                        {
                            showLoopback: false,
                            curviness:50,
                            proximityLimit:0
                        }],
                        cssClass: 'connector',
                        anchors: [[1, 0.25, 1, 0],[1, 0.75, 1, 0]],
                        parameters:{
                            label:null
                        }
                    });
                });
            },
            connect: function (source, target, label, inverse) {
                return getInstance().then(function (instance) {
                    if(inverse){
                        return instance.connect({
                            source: target,
                            target: source,
                            cssClass: 'connector',
                            anchors: ['Continuous', ['Continuous', {faces: ['left', 'right']}]],
                            connector: 'Bezier',
                            parameters:{
                                label:label
                            }
                        });
                    }
                    return instance.connect({
                        source: source,
                        target: target,
                        cssClass: 'connector',
                        anchors: [['Continuous', {faces: ['left', 'right']}], 'Continuous'],
                        connector: 'Bezier',
                        parameters:{
                            label:label
                        }
                    });
                });
            },
            repaint: function (id) {
                return getInstance().then(function (instance) {
                    return instance.repaint(id);
                });
            },
            repaintEverything: function () {
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
            setVisibilityForAllConnection: function(visibility){
                return getInstance().then(function(instance){
                    angular.forEach(instance.getAllConnections(),function(connection){
                        connection.setVisible(visibility);
                    });
                });
            },
            deleteAllConnections: function(id){
                return getInstance().then(function (instance) {
                    angular.forEach(instance.getEndpoints(id),function(endpoint){
                        endpoint.detachAll();
                    });
                    return instance.repaintEverything();
                });
            },
            updateConnectionLabel: function(connection,label){
                if(connection !== null){
                    return connection.getOverlay('label').setLabel(label);
                }
            }


        };

        return factory;
    }
})();