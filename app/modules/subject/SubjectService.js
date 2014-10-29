(function () {
    'use strict';
    angular.module('GSB.subject.service', ['GSB.endPointService', 'GSB.language', 'GSB.subject.model', 'GSB.arrowService'])
        .factory('SubjectService', SubjectService);

    function SubjectService(Subject, $log, connectionService, EndPointService, $translate, $filter) {

        var factory = {};
        factory.subjects = [];
        factory.x = {
            mainSubject: null,
            groups: []
        };
        factory.groups = [];
        factory.availableSubjectClasses = [];
        factory.addSubjectByURI = addSubjectByURI;
        factory.addSubject = addSubject;
        factory.removeSubject = removeSubject;
        factory.isAliasUnique = isAliasUnique;
        factory.reset = reset;
        factory.getAvailableClasses = getAvailableClasses;
        factory.getMainSubject = getMainSubject;
        factory.getSubjects = getSubjects;
        factory.setMainSubjectWithAlias = setMainSubjectWithAlias;
        factory.linkSubjectWithProperty = linkSubjectWithProperty;
        factory.getGroups = getGroups;

        function getGroups() {
            var groups = connectionService.getGroups();
            var oldBossID = (!_.isEmpty(factory.x.mainSubject)) ? angular.copy(factory.x.mainSubject.$id) : null;
            var newBossIDs = _.keys(groups);
            factory.groups = _.filter(factory.subjects, function (s) {
                return _.contains(newBossIDs, s.$id);
            });

            if (!_.contains(newBossIDs, oldBossID)) {
                var newBossID = _.findKey(groups, function (ids) {
                    return _.contains(ids, oldBossID);
                });
                factory.x.mainSubject = _.find(factory.groups, {$id: newBossID});
            }

            if (factory.groups.length === 1) {
                factory.x.mainSubject = factory.groups[0];
            }
            return factory.groups;
        }

        function linkSubjectWithProperty(property) {
            var subjects = _.where(factory.subjects, {alias: property.linkTo});
            if (subjects.length > 0) {
                property.linkTo = subjects[0];
            }
        }

        function setMainSubjectWithAlias(alias) {
            factory.x.mainSubject = _.where(factory.subjects, {alias: alias})[0];
        }

        var currentMainID = null;

        function getMainSubject() {
            if (!_.isEmpty(factory.x.mainSubject) && currentMainID !== factory.x.mainSubject.$id) {
                currentMainID = factory.x.mainSubject.$id;
                connectionService.connect('startpoint', currentMainID, false, 'Start');
            }
            return factory.x;
        }

        function getSubjects() {
            return factory.subjects;
        }

        function getAvailableClasses() {
            var newValues = [];
            factory.availableSubjectClasses.forEach(function (c) {
                newValues.push({
                    uri: c.uri,
                    label: c.uri + '.$label',
                    comment: c.uri + '.$comment'
                });
            });
            return $filter('translateAndSortLocalizedObjectArrayByKey')(newValues, 'label');
        }


        function addSubjectByURI(uri) {
            var data = {
                uri: uri,
                $classURIs: [uri]
            };
            addSubject(data);
        }

        function addSubject(data) {
            $log.debug('SUBJECT added ' + data.uri, data);
            var newSubject = new Subject(data);
            factory.subjects.push(newSubject);
            return newSubject;
        }

        function removeSubject(id) {
            connectionService.remove(id).then(function () {
                _.remove(factory.subjects, {$id: id});
            });
        }

        function reset() {
            factory.subjects = [];
            factory.x.mainSubject = null;
        }

        function isAliasUnique(alias) {
            return _.filter(factory.subjects, {alias: alias}).length === 0;
        }

        EndPointService.getAvailableClasses()
            .then(function (classes) {
                $log.debug('Classes loaded ', classes);

                $translate.refresh();
                factory.availableSubjectClasses = classes;
            })
            .catch(function (err) {
                $log.error('An error occurred: ', err);
            });


        return factory;

    }

})();