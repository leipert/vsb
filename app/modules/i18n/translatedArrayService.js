(function () {
    'use strict';

    angular.module('VSB.language.translationCacheService', ['VSB.config', 'pascalprecht.translate'])

        .factory('translationCacheService', translationCacheService);


    function translationCacheService($translate, $rootScope, $q, $log) {

        var untranslatedCache = {};

        var translatedCache = {};

        var factory = {
            getFromCache: getFromCache,
            putInCache: function (key, type, values) {
                untranslatedCache[key] = {
                    type: type,
                    values: values
                };
                return getFromCache(key);
            },
            removeFromCache: function (key) {
                delete translatedCache[key];
                delete untranslatedCache[key];
            }
        };

        function getFromCache(key) {

            if (translatedCache[key] !== undefined) {
                return $q.when(translatedCache[key]);
            } else if (untranslatedCache.hasOwnProperty(key) && !_.isEmpty(untranslatedCache[key])) {
                return $translate.refresh().then(function () {
                    var promises = [];

                    _.forEach(untranslatedCache[key].values, function (c) {
                        var labelKey = c.uri + '.$label';
                        var commentKey = c.uri + '.$comment';
                        var p = $translate([labelKey, commentKey]).then(function (translations) {
                            var comment = (translations[commentKey] === commentKey) ? false : translations[commentKey];

                            if (untranslatedCache[key].type === 'class') {
                                return translateClass(c, comment, translations[labelKey]);
                            } else {
                                c.$comment = comment;
                                c.$label = translations[labelKey];
                                return c;
                            }
                        });
                        promises.push(p);
                    });

                    return $q.all(promises);
                }).then(function (data) {
                    data = _.sortBy(data, function (x) {
                        return x.$label.toLocaleLowerCase();
                    });
                    translatedCache[key] = data;
                    return $q.when(data);
                });
            }

            return $q.when([]);


        }

        function translateClass(c, comment, label) {
            return {
                uri: c.uri,
                $comment: comment,
                $label: label
            };
        }

        var currentLanguage = null;

        $rootScope.$on('$translateChangeSuccess', function (event, data) {
            if (data.language !== currentLanguage && !_.isEmpty(translatedCache)) {
                $log.debug('changed Language to', data.language);
                currentLanguage = data.language;
                translatedCache = {};
                $rootScope.$emit('translateEverything');
            }
        });


        return factory;


    }


})();