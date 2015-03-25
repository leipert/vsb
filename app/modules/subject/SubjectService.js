(function () {
    'use strict';
    angular.module('GSB.subject.service', ['GSB.endPointService', 'GSB.language', 'GSB.subject.model', 'GSB.arrowService'])
        .factory('SubjectService', SubjectService)
        .directive('popoverWrap', popoverWrap)
    ;

    function popoverWrap() {
        return {
            restrict: 'E',
            replace: true,
            require: '?^ngClick',
            scope: {
                settings: '=',
                click: '&',
                conditionalClass: '@'
            },
            templateUrl: '/modules/subject/popoverWrap.tpl.html'
        };
    }

    function SubjectService(Subject, $log, connectionService, helperFunctions, EndPointService, $q, $translate, $modal, translationCacheService, $rootScope, MessageService) {

        var factory = {};
        factory.subjects = [];
        factory.x = {
            mainSubject: null,
            groups: []
        };
        factory.groups = [];
        var searchRelationSubjects = [];
        factory.addSubjectByURI = addSubjectByURI;
        factory.addSubject = addSubject;
        factory.removeSubject = removeSubject;
        factory.isAliasUnique = isAliasUnique;
        factory.reset = reset;
        factory.getAvailableClasses = getAvailableClasses;
        factory.getMainSubject = getMainSubject;
        factory.getSubjects = getSubjects;
        factory.getSearchRelationSubjects = getSearchRelationSubjects;
        factory.getSubjectById = function (id) {
            return _.where(factory.subjects, {$id: id})[0];
        };
        factory.setMainSubjectWithAlias = setMainSubjectWithAlias;
        factory.linkSubjectWithProperty = linkSubjectWithProperty;
        //factory.getGroups = getGroups;

        var currentDraw = null;

        factory.redrawMainConnection = function (mainSubject) {

            if (_.isObject(mainSubject)) {

                var promise = connectionService.connect('startpoint', mainSubject.$id, 'Start').then(function () {
                    currentDraw = null;
                    factory.x.mainSubject = mainSubject;
                    $rootScope.$emit('mainSubjectChanged');
                });
                if (currentDraw === null) {
                    currentDraw = promise;
                } else {
                    currentDraw.cancel().then(function () {
                        return promise;
                    });

                }
            }
        };
        factory.searchRelation = searchRelation;

        function getSearchRelationSubjects() {
            return searchRelationSubjects;
        }

        function searchRelation(subject) {
            if (searchRelationSubjects.length === 2) {
                searchRelationSubjects = [];
            }
            if (subject !== null) {
                searchRelationSubjects.push(subject);
            }
            if (searchRelationSubjects.length === 2) {
                $modal.open({
                    template: '/modules/modals/findRelationModal.tpl.html',
                    controller: 'findRelationModalCtrl',
                    controllerAs: 'foo',
                    resolve: {
                        subjects: function () {
                            return searchRelationSubjects;
                        },
                        possibleRelations: function (EndPointService) {
                            return EndPointService.getPossibleRelations(
                                searchRelationSubjects[0].uri,
                                searchRelationSubjects[1].uri
                            );
                        }
                    }
                }).then(function (modalInstance) {
                    return modalInstance.result;
                })
                    .then(null, function () {
                        searchRelation(null);
                    });
            }

        }

        $rootScope.$on('connectionGroupsChanged', refreshGroups);

        function refreshGroups() {
            var groups = connectionService.getGroups();
            var oldBossID = (!_.isEmpty(factory.x.mainSubject)) ? angular.copy(factory.x.mainSubject.$id) : null;
            var newBossIDs = _.keys(groups);

            var oldGroups = factory.groups;

            factory.groups = _.filter(factory.subjects, function (s) {
                return _.contains(newBossIDs, s.$id);
            });

            var newMainSubject = null;

            if (oldBossID !== null) {
                if (!_.contains(newBossIDs, oldBossID)) {
                    var newBossID = _.findKey(groups, function (ids) {
                        return _.contains(ids, oldBossID);
                    });
                    newMainSubject = _.find(factory.groups, {$id: newBossID});
                }
            }


            if (factory.groups.length === 1) {
                newMainSubject = factory.groups[0];
            }


            if (_.isObject(newMainSubject) && newMainSubject.$id !== oldBossID) {
                factory.redrawMainConnection(newMainSubject);
            }

            if(_.xor(oldGroups, factory.groups).length> 0){
                $rootScope.$emit('availableGroupsChanged');
            }



        }

        function linkSubjectWithProperty(property) {
            var subjects = _.where(factory.subjects, {alias: property.linkTo});
            if (subjects.length > 0) {
                property.linkTo = subjects[0];
            }
        }

        function setMainSubjectWithAlias(alias) {
            var newMainSubject = _.where(factory.subjects, {alias: alias})[0];
            factory.redrawMainConnection(newMainSubject);
        }

        function getMainSubject() {
            return factory.x;
        }

        function getSubjects() {
            return factory.subjects;
        }

        function getAvailableClasses(filter, limit) {
            return translationCacheService.getFromCache('availableClasses').then(function (classes) {
                return helperFunctions.filterByTokenStringWithLimit(classes, filter, limit);
            });
        }

        function addSubjectByURI(uri) {
            var data = {
                uri: uri,
                $classURIs: [uri]
            };
            return addSubject(data);
        }

        function addSubject(data) {
            $log.debug('SUBJECT added ' + data.uri, data);

            data.pos = data.pos ? data.pos : generatePosition();

            data.alias = createUniqueAlias(data.alias, data.label, data.uri);

            var newSubject = new Subject(data);
            factory.subjects.push(newSubject);
            refreshGroups();
            return newSubject;
        }

        function removeSubject(id) {
            return connectionService.remove(id)
                .then(function () {
                    _.remove(factory.subjects, {$id: id});
                    refreshGroups();
                });
        }

        function reset() {
            var promises = [];

            factory.subjects.forEach(function (subject) {
                promises.push(
                    removeSubject(subject.$id).then(function () {
                        //TODO: removePropertyTranslations
                    })
                );
            });

            return $q.all(promises).then(function () {
                factory.x.mainSubject = null;
                factory.x.groups = [];
                $log.debug('Workspace reset');

            });
        }

        function createUniqueAlias(alias, label, uri) {
            if (!alias) {
                alias = label;
            }
            if (!alias) {
                alias = $translate.instant(uri + '.$label');
            }
            var newAlias = alias;
            var c = 1;
            while (!isAliasUnique(newAlias)) {
                newAlias = alias + ' ' + c;
                c += 1;
            }
            return newAlias;
        }

        function isAliasUnique(alias) {
            return _.filter(factory.subjects, {alias: alias}).length === 0;
        }

        factory.loading = EndPointService.getAvailableClasses()
            .catch(function (err) {
                $log.error('An error occurred while loading available Classes: ', err);
                var message = '<span> An error occured while loading available classes <br>'+ _.escape(err)+'</span>';
                MessageService.addMessage({message: message, icon: 'times-circle-o', 'class': 'danger'});
            })
            .then(function (classes) {
                $log.debug('Classes loaded ', classes);
                return translationCacheService.putInCache('availableClasses', 'class', classes);
            }).then(function () {
                factory.loading = false;
            })
            ;

        var c = 0;

        function generatePosition(){
            var offset = 150 + c*30;
                c = (c+1)%5;

            return  {x:offset,y:offset};
        }

        return factory;

    }

})();