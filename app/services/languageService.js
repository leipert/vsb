'use strict';

angular.module('GSB.languageService', ['GSB.config','pascalprecht.translate'])
    .config(function ($translateProvider,globalConfig) {
        globalConfig.fallBackLanguages.push('default');
        $translateProvider.useLoader('languageLoader')
            .fallbackLanguage(globalConfig.fallBackLanguages)
            .determinePreferredLanguage();
    })
    .factory('languageLoader', function (languageStorage) {
        return function (options) {
            return languageStorage.getItem(options.key);
        };
    })
    .factory('languageStorage',function($q){
        var storage = {
                default: {
                    ADD_A_AGGREGATE:'Add an aggregate',
                    ADD_FILTER:'add filter',
                    AFTER:'after',
                    ARITHMETICS:'arithmetics',
                    A_LINK_TO:'a link to',
                    BACK_TO_WORKSPACE:'Workspace',
                    BEFORE:'before',
                    BUTTON_LANG_DE:'german',
                    BUTTON_LANG_EN:'english',
                    CHOOSE_A_PROPERTY:'Choose a property',
                    CHOOSE_A_SUBJECT:'Choose a subject',
                    COMPARISON:'comparison',
                    CONTAINS:'contains',
                    DELETE_PROPERTY:'delete property',
                    DOWNLOAD_JSON:'Download JSON',
                    ENDS_WITH:'ends with',
                    EQUALS:'equals',
                    EQUALS_NOT:'equals not',
                    EXISTS:'exists',
                    EXISTS_NOT:'exists not',
                    HIDE_PROPERTY:'hide property',
                    HIDE_QUERIES:'hide queries',
                    IS_MANDATORY:'is mandatory',
                    IS_OPTIONAL:'is optional',
                    JSON:'JSON',
                    LANGUAGE:'language',
                    LINK_WITH_SUBJECT:'Link with a subject',
                    LIST_ALL:'List all',
                    LOAD_JSON:'Load JSON',
                    NO_COMPARISON:'no comparison',
                    PICK_MAIN_SUBJECT:'Pick a main subject',
                    PROPERTY:'property',
                    QUERIES:'Queries',
                    REGEX:'regex',
                    REMOVE_FILTER:'remove filter',
                    RESET_WORKSPACE:'Reset Workspace',
                    RESULTS:'Results',
                    RUN_QUERY:'Run Query',
                    SELECT_LANGUAGE:'Select a language',
                    SHOW_PROPERTY:'show property',
                    SHOW_QUERIES:'show queries',
                    SPARQL:'SPARQL',
                    STARTS_WITH:'starts with',
                    WORKSPACE:'Workspace',
                    TITLE: 'Graphical SPARQL Builder'
                }
            },
            factory = {};

        factory.mergeLanguages = function (data){
            storage = _.merge(storage,data);
        };

        factory.setItem = function(lang,key,value){
            if (!storage.hasOwnProperty(lang)) {
                storage[lang] = {};
            }
            storage[lang][key] = value;
        };
        factory.getItem = function(key){
            var deferred = $q.defer();
            if(storage.hasOwnProperty(key)){
                deferred.resolve(storage[key]);
            }else{
                deferred.resolve({});
            }
            return deferred.promise;
        };
        return factory;
    });