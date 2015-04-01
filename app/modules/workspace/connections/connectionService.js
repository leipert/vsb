(function () {
    'use strict';
    angular.module('VSB.connectionService', ['VSB.arrowService'])
        .factory('connectionService', connectionService);

    function connectionService($q, ArrowService, $timeout, $rootScope) {

        var counter = -1;

        var idToScopeMap = {};

        var subjectToPropertyMap = {};
        var propertyToSubjectMap = {
            'startpoint': 'startpoint'
        };

        var connectionMap = {};

        var groups = {};

        var destroyWatchers = {};

        var factory = {};
        factory.getConnections = getConnections;
        factory.addSubject = addSubject;
        factory.addMapping = addMapping;
        factory.getScopeID = getScopeID;
        factory.addPropertyToSubject = addPropertyToSubject;
        factory.generateID = generateID;
        factory.remove = remove;
        factory.disconnect = disconnect;
        factory.connect = connect;
        factory.updateConnectionLabel = updateConnectionLabel;
        factory.getGroups = getGroups;
        factory.resetService = function () {
            ArrowService.resetService();
            idToScopeMap = {};
        };
        factory.recalculateOffsets = function (id, repaint) {
            getScopeID(id).then(function (id) {
                ArrowService.recalculateOffsets(id, repaint);
            });
        };

        function getGroups(omitEvent) {
            return generateGroups(omitEvent);
        }

        function updateConnectionLabel(connection, label) {
            ArrowService.updateConnectionLabel(connection, label);
        }

        function generateID() {
            counter += 1;
            return 'i' + counter;
        }

        function cleanFromMaps(id) {
            return function () {
                _.forEach(_.invert(connectionMap, true)[id], function (x) {
                    if (_.isFunction(destroyWatchers[x])) {
                        destroyWatchers[x](id);
                    }
                    delete connectionMap[x];
                });
                delete destroyWatchers[id];
                delete subjectToPropertyMap[id];
                delete idToScopeMap[id];
                delete propertyToSubjectMap[id];
                generateGroups();

            };
        }

        factory.registerDestroyWatcher = function (id, fn) {
            destroyWatchers[id] = fn;
        };

        function remove(id) {

            var promises = [];
            if (subjectToPropertyMap.hasOwnProperty(id)) {
                promises = _.map(subjectToPropertyMap[id], function (x) {
                    return disconnect(x).then(cleanFromMaps(x));
                }).push(disconnect(id));
            } else {
                promises.push(disconnect(id).then(cleanFromMaps(id)));
                subjectToPropertyMap = _.mapValues(subjectToPropertyMap, function (x) {
                    return _.without(x, id);
                });
            }
            return $q.all(promises).then(cleanFromMaps(id));
        }

        function disconnect(source) {
            return $q.when(getScopeID(source)).then(function (id) {
                return ArrowService.deleteAllConnections(id);
            }).then(function (data) {

                delete connectionMap[source];
                generateGroups();
                return data;
            });
        }

        function connect(source, target, label) {

            var idMap = [];

            return Promise.all([
                getScopeID(source),
                getScopeID(target),
                getScopeID(propertyToSubjectMap[source])
            ])
                .cancellable()
                .then(function (ids) {
                    idMap = ids;
                    return disconnect(source);
                })
                .then(function () {
                    if (idMap[1]) {
                        connectionMap[source] = target;
                        generateGroups();
                        if (idMap[1] === idMap[2]) {
                            return ArrowService.connectToSelf(idMap[0], idMap[2]);
                        } else {
                            return ArrowService.connect(idMap[0], idMap[1], label, idMap[2]).then(function (connection) {
                                ArrowService.recalculateOffsets(idMap[0]);
                                return connection;
                            });
                        }
                    }
                })
                .catch(Promise.CancellationError, function () {
                    return disconnect(source);
                });


        }

        var bfs = function (v, collection, visited) {
            var q = [];
            var group = [];
            q.push(v);

            function handlePair(pair) {
                if (pair[0] === v && !visited[pair[1]]) {
                    q.push(pair[1]);
                } else if (pair[1] === v && !visited[pair[0]]) {
                    q.push(pair[0]);
                }
            }

            while (q.length > 0) {
                v = q.shift();
                if (!visited[v]) {
                    visited[v] = true;
                    group.push(v);
                    collection.forEach(handlePair);
                }
            }
            return group;
        };

        function generateGroups(omitEvent) {
            var neighborMap = [];
            _.forEach(subjectToPropertyMap, function (p, subject) {
                neighborMap.push([subject, subject]);
            });
            _.forEach(connectionMap, function (targetSubject, propertyID) {
                var sourceSubject = propertyToSubjectMap[propertyID];
                if (targetSubject && sourceSubject) {
                    neighborMap.push([sourceSubject, targetSubject]);
                }
            });

            neighborMap = angular.copy(neighborMap);

            var visited = {};

            var oldKeys = _.keys(groups);

            groups = {};

            neighborMap.forEach(function (n) {
                var src = (!visited[n[0]]) ? n[0] : (!visited[n[1]]) ? n[1] : false;
                if (src) {
                    var newGroup = bfs(src, neighborMap, visited);
                    groups[_.min(newGroup, function (x) {
                        return x.substring(1) * 1;
                    })] = newGroup;
                }
            });

            var diff = _.xor(oldKeys, _.keys(groups));

            if (!omitEvent && diff.length > 0) {
                $rootScope.$emit('connectionGroupsChanged');
            }

            return groups;

        }

        function addMapping(id, scopeID) {
            idToScopeMap[id] = scopeID;
        }

        function addSubject(id) {
            subjectToPropertyMap[id] = [];
            generateGroups();
        }

        function getScopeID(id) {

            if (id === 'startpoint') {
                return $q.when(id);
            }
            if (idToScopeMap[id]) {
                return $q.when(idToScopeMap[id]);
            } else {
                return $timeout(function () {
                    return getScopeID(id);
                }, 150);
            }
        }

        function addPropertyToSubject(subjectID, propertyID) {
            subjectToPropertyMap[subjectID].push(propertyID);
            propertyToSubjectMap[propertyID] = subjectID;
        }

        function getConnections() {
            return [subjectToPropertyMap, propertyToSubjectMap, idToScopeMap, connectionMap, groups];
        }

        return factory;
    }
})();