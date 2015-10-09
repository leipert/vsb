(function () {
    'use strict';

// Loads all our components
    angular.module('VSB', [
        'VSB.message',
        'VSB.config',
        'VSB.layout',
        'VSB.filters',
        'VSB.subject',
        'VSB.helpCtrl',
        'VSB.language',
        'pascalprecht.translate'
    ])
        .run(mixedContentCheck)
        .run(loadLastFromForage)
        .config(['$localForageProvider', function($localForageProvider){
            $localForageProvider.config({
                //driver      : 'localStorageWrapper', // if you want to force a driver
                name        : 'myApp', // name of the database and prefix for your data, it is "lf" by default
                //version     : 1.0, // version of the database, you shouldn't have to use this
                storeName   : 'keyvaluepairs', // name of the table
                description : 'some description'
            });
        }])
        .config(allowBlobs);


    function allowBlobs($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
    }

    function loadLastFromForage($localForage, globalConfig, TranslatorToVSBL) {

        //TODO: Move to own SaveStatusFactory
        $localForage.getItem('current')
            .then(function (data) {
                if (data !== null && data !== undefined && data.CONFIG === globalConfig.name) {
                    TranslatorToVSBL.translateJSONToVSBL(data);
                }
            });
    }

    function mixedContentCheck(MessageService, $window, $http, $timeout, globalConfig) {

        var hideMessage = false;

        var parser = document.createElement('a');
        parser.href = globalConfig.baseURL;

        if ($window.location.protocol !== parser.protocol) {

            $http.get(globalConfig.baseURL + '?query=select+%3Fs+where+%7B%5B%5D+a+%3Fs%7D+LIMIT+1')
                .success(function () {
                    hideMessage = true;
                });

            $timeout(function () {
            }, 1000).then(showMessage);

        }

        function showMessage() {
            if (hideMessage) {
                return;
            }
            var params = {
                VSBProtocol: $window.location.protocol,
                EndpointProtocol: parser.protocol,
                VSBLink: parser.protocol + '//' + $window.location.host + $window.location.pathname + $window.location.hash
            };

            var message = '<span translate="MIXED_CONTENT_WARNING" translate-values=\'' + JSON.stringify(params) + '\'></span>';

            MessageService.addMessage({message: message, 'class': 'warning', icon: 'exclamation-triangle'});
        }


    }

})();