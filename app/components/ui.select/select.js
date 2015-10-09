(function () {

    'use strict';

    angular.module('VSB.select', ['ui.select'])

        .config(function (uiSelectConfig) {
            uiSelectConfig.theme = '/components/ui.select';
        })
        .directive('uiSelectChoicesRowInner', function () {
            return {
                restrict: 'E',
                replace: true,
                templateUrl: '/components/ui.select/choiceRowInner.tpl.html'
            };
        })
        .filter('highlightSearchTerm', function () {
            return highlightSearchTermDeburred;
        })
        .config(monkeyPatchUiSelectChoices)
        .factory('helperFunctions', function () {
            return {
                filterByTokenStringWithLimit: filterByTokenStringWithLimit,
                highlightSearchTermDeburred: highlightSearchTermDeburred
            };
        });

    function filterByTokenStringWithLimit(array, filter, limit, customFilters) {
        if (!_.isArray(array)) {
            return array;
        }
        customFilters = _.isObject(customFilters) ?
        {post: _.flatten([customFilters.post]), pre: _.flatten([customFilters.pre])}

            : {post: _.flatten([customFilters])};
        filter = _.isString(filter) ? angular.copy(filter) : null;
        limit = _.isString(limit) || _.isNumber(limit) ? angular.copy(limit) : null;
        var total = array.length;
        var matching = null;

        if (!_.isNull(filter)) {


            _.forEach(customFilters.pre, customFilterExecution);


            var filterTokens = tokenize(filter);

            var regexTokens = _.map(filterTokens, function (token) {
                return new RegExp(_.escapeRegExp(token), 'i');
            });

            array = _.filter(array, function (element) {
                return _.every(regexTokens, function (token) {
                    return _.some(element, function (value) {
                        return _.isString(value) && _.deburr(value).match(token);
                    });
                });
            });

            matching = array.length;


            array = orderByLabelMatch(array, filterTokens);

            _.forEach(customFilters.post, customFilterExecution);

        }


        if (!_.isNull(limit)) {
            array = _.take(array, limit);
        }

        return {
            items: array,
            total: total,
            matching: matching
        };


        function customFilterExecution(filterFunction) {
            if (_.isFunction(filterFunction)) {
                var temp = filterFunction(array, filter);
                filter = _.isString(temp.filter) ? temp.filter : filter;
                array = _.isArray(temp.array) ? temp.array : array;
            }
        }

    }

    function highlightSearchTermDeburred(matchItem, query) {

        if (!_.isString(matchItem) || !_.isString(query)) {
            return matchItem;
        }

        var tokens = tokenize(query);

        _.forEach(tokens, function (token) {
            var temp = _.deburr(matchItem).toLowerCase();

            temp = temp.replace(new RegExp(_.escapeRegExp(token), 'ig'), '||');

            var pos = 0;

            temp = _.reduce(temp.split('||'), function (result, current) {
                result.push([pos, current.length]);
                pos += current.length + token.length;
                return result;
            }, []);

            matchItem = _.reduce(temp, function (result, current) {
                var beforeToken = matchItem.substr(current[0], current[1]);
                var mip = matchItem.substr(current[0] + current[1], token.length);
                var as = mip.length > 0 ? '<>' + mip + '</>' : '';
                return result + beforeToken + as;
            }, '');

        });

        return matchItem
            .replace(/<>/g, '<span class="ui-select-highlight">')
            .replace(/<\/>/g, '</span>');

    }


    function orderByLabelMatch(array, filterTokens) {
        if (!_.isArray(array) || !_.isArray(filterTokens) || _.isEmpty(filterTokens)) {
            return array;
        }

        filterTokens = _.map(filterTokens, _.escapeRegExp).join('|');

        var startsWith = new RegExp('^(' + filterTokens + ')', 'i');
        var contains = new RegExp(filterTokens, 'i');

        return _.sortBy(array, function (c) {
            var label = _.deburr(c.$label);
            if (_.isString(label)) {
                if (label.match(startsWith)) {
                    return 10;
                } else if (label.match(contains)) {
                    return 25;
                }
                return 50;
            }

            return 100;
        });
    }

    function tokenize(queryToEscape) {
        queryToEscape = _.words(_.deburr(queryToEscape).toLowerCase(), /[^ <>,]+/g);
        queryToEscape = _.sortBy(queryToEscape, 'length');
        return _.reduceRight(queryToEscape, function (result, token) {
            if (!_.contains(result.join(', '), token)) {
                result.push(token);
            }

            return result;
        }, []);
    }

    function monkeyPatchUiSelectChoices($provide) {
        $provide.decorator('uiSelectChoicesDirective', function ($delegate) {
            var directive = $delegate[0];

            var linkFn;

            var originalCompile = directive.compile;

            directive.compile = compileFn;

            return $delegate;


            function compileFn() {
                /*jshint validthis: true */
                linkFn = originalCompile.apply(this, arguments);

                return linkFunction;
            }

            function linkFunction(scope, element, attrs, $select) {
                /*jshint validthis: true */
                linkFn.apply(this, arguments);

                attrs.$observe('totalItems', function (nv) {
                    $select.totalItems = nv;
                });

                attrs.$observe('matchingItems', function (nv) {
                    $select.matchingItems = nv;
                });

                scope.footerZero = attrs.footerZero;
                scope.footerNoSearch = attrs.footerNoSearch;
                scope.footerFound = attrs.footerFound;

                $select.containsSearchTerm = function (matchItem, query) {
                    return query && matchItem ? _.deburr(matchItem).match(new RegExp(_.map(tokenize(query), _.escapeRegExp).join('|'), 'i')) : false;
                };

            }

        });
    }


})();