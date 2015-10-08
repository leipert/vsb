(function () {
    'use strict';

    angular.module('VSB.language', ['VSB.config', 'VSB.language.translationCacheService', 'pascalprecht.translate', 'ngCookies'])
        .config(translationProviderConfig)
        .factory('languageStorage', languageStorage)
        .factory('languageLoader', languageLoader)
        .filter('translateAndSortLocalizedObjectArrayByKey', translateAndSortLocalizedObjectArrayByKey);

    function translateAndSortLocalizedObjectArrayByKey($translate) {
        return function (array, key, prefix) {
            if (!key) {
                return array;
            }
            if (!prefix) {
                prefix = '';
            }

            var result = angular.copy(array);

            return result.map(function (c) {
                c[key] = $translate.instant(prefix + c[key]);
                return c;
            }).sort(function (a, b) {
                if (typeof a[key] === 'string' && typeof b[key] === 'string') {
                    return a[key].toLowerCase().localeCompare(b[key].toLowerCase());
                }
            });

        };
    }

    function translationProviderConfig($translateProvider, globalConfig) {

        var availableLanguageKeys = _.chain(globalConfig.languages.GUI)
            .map(function(language){
                return [language + '-*', language];
            })
            .zipObject()
            .value();

        $translateProvider
            .useLoader('languageLoader')
            .useSanitizeValueStrategy('escapeParameters')
            .useLocalStorage()
            .uniformLanguageTag('bcp47')
            .registerAvailableLanguageKeys(globalConfig.languages.GUI, availableLanguageKeys)
            .fallbackLanguage('default')
            .determinePreferredLanguage();
    }

    function languageLoader(languageStorage) {
        return function (options) {
            return languageStorage.getItem(options.key);
        };
    }

    function languageStorage($q, $http, $log) {

        var storage = {
                default: {
                    ADD_FILTER: 'add filter',
                    AFTER: 'after',
                    ARITHMETICS: 'arithmetics',
                    A_LINK_TO: 'a link to',
                    BACK_TO_WORKSPACE: 'Workspace',
                    BEFORE: 'before',
                    BUTTON_LANG_DE: 'german',
                    BUTTON_LANG_EN: 'english',
                    MIXED_CONTENT_WARNING: 'You are trying to view mixed content.<br>Your browser may be blocking data from the endpoint. (The Visual SPARQL Builder is running on {{ VSBProtocol }}, your SPARQL endpoint on {{EndpointProtocol}})<br>In <b>Firefox</b> you need to navigate to <a class=\'alert-link\' href=\'{{VSBLink}}\'>the {{EndpointProtocol}} version of this site.</a><br>In <b>Chrome</b> you could click on the little armor in the URL bar and \'Load unsafe scripts\' or also navigate to the Firefox link.',
                    CLASSES_FOUND_ZERO: 'No classes found.<br>Please try another search term.',
                    CLASSES_FOUND_X: 'Found {{matching}} classes.<br>Total classes: {{total}}',
                    CLASSES_FOUND_X_MORE: 'Showing {{x}} of {{matching}} found classes.<br>Total classes: {{total}}',
                    CLASSES_FOUND_NO_SEARCH: 'Showing {{matching}} of {{total}} classes<br>Please enter a search term.',
                    PROPERTIES_FOUND_ZERO: 'No properties found.<br>Please try another search term.',
                    PROPERTIES_FOUND_X: 'Found {{matching}} properties.<br>Total properties: {{total}}',
                    PROPERTIES_FOUND_X_MORE: 'Showing {{x}} of {{matching}} found properties.<br>Total properties: {{total}}',
                    PROPERTIES_FOUND_NO_SEARCH: 'Showing {{matching}} of {{total}} properties<br>Please enter a search term.',
                    CHOOSE_A_PROPERTY: 'Choose a property',
                    CHOOSE_A_SUBJECT: 'Choose a subject',
                    COMPARISON: 'comparison',
                    CONTAINS: 'contains',
                    DELETE_PROPERTY: 'delete property',
                    DOWNLOAD_JSON: 'Download JSON',
                    ENDS_WITH: 'ends with',
                    EQUALS: 'equals',
                    EQUALS_NOT: 'equals not',
                    EXISTS: 'exists',
                    EXISTS_NOT: 'exists not',
                    HELP: 'Help',
                    HIDE_PROPERTY: 'hide property',
                    HIDE_QUERIES: 'hide queries',
                    IS_MANDATORY: 'is mandatory',
                    IS_OPTIONAL: 'is optional',
                    KEEP_OPEN: 'Keep open',
                    PRINT_PREVIEW: 'Print Preview',
                    HIDE_SUBJECT: 'Hide Subject',
                    SHOW_SUBJECT: 'Show Subject',
                    DELETE_SUBJECT: 'Delete Subject',
                    CONNECT_SUBJECT: 'Connect Subject to another Subject',
                    ADD_APPROPRIATE_CLASS: 'Add appropriate Subject',
                    CAST_PROPERTY: 'Change property type',
                    LANGUAGE: 'language',
                    LINK_WITH_SUBJECT: 'Link with a subject',
                    LIST_ALL: 'List all',
                    LOAD_JSON: 'Load JSON',
                    NO_COMPARISON: 'no comparison',
                    PICK_MAIN_SUBJECT: 'Pick a main subject',
                    PROPERTY: 'property',
                    QUERIES: 'Queries',
                    REGEX: 'regex',
                    REMOVE_FILTER: 'remove filter',
                    RESET_WORKSPACE: 'Reset Workspace',
                    RESULTS: 'Results',
                    RUN_QUERY: 'Run Query',
                    SEARCH_RELATION: 'To Search a Relation between {{alias}} and another subject, please click on the <i class="fa fa-plug fa-fw"></i> plug button of this subject.',
                    SELECT_LANGUAGE: 'Select a language',
                    SHOW_PROPERTY: 'show property',
                    SHOW_QUERIES: 'show queries',
                    STARTS_WITH: 'starts with',
                    WORKSPACE: 'Workspace',
                    TITLE: 'Visual SPARQL Builder',
                    TITLE_SHORT: 'VSB'
                }
            },
            factory = {};

        var promise;

        factory.mergeLanguages = function (data) {
            $log.debug('Missing de translations', _.difference(_.keys(data.en), _.keys(data.de)));
            $log.debug('Missing en tranlsations', _.difference(_.keys(data.de), _.keys(data.en)));
            storage = _.merge(storage, data);
        };

        factory.setItem = function (lang, key, value) {
            if (!storage.hasOwnProperty(lang)) {
                storage[lang] = {};
            }
            storage[lang][key] = value;
            return $q.when(value);
        };

        factory.getItem = function (key) {
            var deferred = $q.defer();
            if (storage.hasOwnProperty(key)) {
                deferred.resolve(storage[key]);
            } else {
                deferred.resolve({});
            }

            return $q.when(promise).then(function () {
                return deferred.promise;
            });
        };

        promise = $http.get('locale.json').success(function (data) {
            factory.mergeLanguages(data);
        });

        return factory;
    }


})();