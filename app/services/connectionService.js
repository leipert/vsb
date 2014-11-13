(function () {
    'use strict';
    angular.module('GSB.connectionService', ['GSB.arrowService'])
        .factory('connectionService', connectionService);

    function connectionService($q, ArrowService) {

        var counter = -1;

        var idToScopeMap = {};

        var subjectToPropertyMap = {};
        var propertyToSubjectMap = {};

        var connectionMap = {};

        var groups = {};

        var factory = {};
        factory.getConnections = getConnections;
        factory.addSubject = addSubject;
        factory.addMapping = addMapping;
        factory.getScopeID = getScopeID;
        factory.addPropertyToSubject = addPropertyToSubject;
        factory.generateID = generateID;
        factory.remove = remove;
        factory.connect = connect;
        factory.updateConnectionLabel = updateConnectionLabel;
        factory.getGroups = getGroups;

        function getGroups() {
            return groups;
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
                delete subjectToPropertyMap[id];
                delete idToScopeMap[id];
                delete propertyToSubjectMap[id];
                generateGroups();

            };
        }

        function remove(id) {
            var promises = [];
            if (subjectToPropertyMap.hasOwnProperty(id)) {
                promises = _.map(subjectToPropertyMap[id], function (x) {
                    return disconnect(x).then(cleanFromMaps(x));
                }).push(disconnect(id).then(cleanFromMaps(id)));
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

        function connect(source, target, inverse, label) {
            return disconnect(source).then(function () {
                return $q.all({
                    source: getScopeID(source),
                    target: getScopeID(target)
                });
            })
                .then(function (ids) {
                    if (ids.target) {
                        connectionMap[source] = target;
                        generateGroups();
                        if (propertyToSubjectMap[source] === target) {
                            return ArrowService.connectToSelf(ids.source);
                        } else {
                            return ArrowService.connect(ids.source, ids.target, label, inverse);
                        }
                    }
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

        function generateGroups() {
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
                return id;
            }
            return idToScopeMap[id];
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