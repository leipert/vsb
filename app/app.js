(function () {
    'use strict';

// Loads all our components
    angular.module('VSB', [
        'VSB.message',
        'VSB.config',
        'VSB.layout',
        'VSB.filters',
        'VSB.subject',
        'VSB.mainCtrl',
        'VSB.language',
        'pascalprecht.translate'
    ])
        .run(mixedContentCheck)
        .run(loadLastFromForage)
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

            $http.get(globalConfig.baseURL + '?query=select+%3Fs+where+%7B%5B%5D+a+%3Fs%7D+LIMIT+1&format=text%2Fhtml')
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
            //TODO:
            var message = 'You are trying to view mixed content.<br>' +
                'Your browser may be blocking data from the endpoint. (The Visual SPARQL Builder is running on ' + $window.location.protocol + ', your SPARQL endpoint on ' + parser.protocol + ')<br>' +
                'In <b>Firefox</b> you need to navigate to <a class="alert-link" href="' +
                parser.protocol + $window.location.host + $window.location.pathname + $window.location.hash +
                '">the ' + parser.protocol + ' version of this site.</a><br>' +
                'In <b>Chrome</b> you could click on the little armor in the URL bar and \'Load unsafe scripts\' or also navigate to the Firefox link.';

            MessageService.addMessage({message: message, 'class': 'warning', icon: 'exclamation-triangle'});
        }


    }

})();