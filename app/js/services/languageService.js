'use strict';

angular.module('GSB.services.languageService', ['GSB.config','pascalprecht.translate'])
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
                    TITLE: 'Graphical SPARQL Builder'
                }
            },
            factory = {};
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