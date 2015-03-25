(function () {
    'use strict';
    angular.module('zenubu.ngStrap', [
        'mgcrea.ngStrap',
        'ngSanitize',
        'zenubu.ngStrap.datepicker',
        'zenubu.ngStrap.dropdown',
        'zenubu.ngStrap.modal'
    ])
        .config(function ($tooltipProvider) {
            angular.extend($tooltipProvider.defaults, {
                html: true
            });
        });

})();