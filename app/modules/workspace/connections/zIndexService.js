(function () {
    'use strict';
    angular.module('VSB.zIndex', ['VSB.config'])
        .factory('zIndexService', zIndexService);

    function zIndexService() {
        var indices = [];

        var endPoints = {};

        var subjects = {};

        return {
            increaseIndex: increaseIndex,
            getSubjectIndex: getSubjectIndex,
            registerSubject: registerSubject,
            registerEndpoint: registerEndpoint,
            reset: reset
        };

        function increaseIndex(key) {
            var currentIndex = _.lastIndexOf(indices, key);
            if (currentIndex !== indices.length - 1) {
                indices.push(key);
                var newIndex = _.lastIndexOf(indices, key);
                setIndex(key, currentIndex, newIndex);
                makeUniqueIfNecessary();
            }
        }

        function makeUniqueIfNecessary() {
            var uniq = _.uniq(indices);
            if (indices.length - uniq.length < 3) {
                return;
            }

            indices = _(uniq).sortBy(function (key) {
                return _.lastIndexOf(indices, key);
            }).forEach(function (key, newIndex) {
                var currentIndex = _.lastIndexOf(indices, key);
                setIndex(key, currentIndex, newIndex);
            }).value();

        }

        function setIndex(key, currentIndex, newIndex) {
            _.forEach(endPoints[key], function (endPoint, endPointKey) {
                if (endPoint._jsPlumb === null) {
                    delete endPoints[key][endPointKey];
                    return;
                }
                endPoint.removeClass('z-index-' + currentIndex);
                endPoint.addClass('z-index-' + newIndex);
            });
            endPoints[key] = _.compact(endPoints[key]);
            subjects[key].removeClass('z-index-' + currentIndex);
            subjects[key].addClass('z-index-' + newIndex);
        }

        function reset() {
            indices = [];

            endPoints = {};
        }

        function getSubjectIndex(id) {
            if (_.lastIndexOf(indices, id) === -1) {
                indices.push(id);
            }
            return _.lastIndexOf(indices, id);
        }

        function registerSubject(id, element) {
            var index = getSubjectIndex(id);
            element.addClass('z-index-' + index);
            subjects[id] = element;

        }

        function registerEndpoint(id, endPoint) {
            var currentIndex = _.lastIndexOf(indices, id);
            if (!_.isArray(endPoints[id])) {
                endPoints[id] = [];
            }
            endPoint.addClass('z-index-' + currentIndex);
            endPoints[id].push(endPoint);
        }
    }

})();