(function () {
    'use strict';
    angular.module('zenubu.ngStrap.datepicker', [
        'mgcrea.ngStrap.datepicker',
        'mgcrea.ngStrap.helpers.dateFormatter'
    ])
        .config(monkeyPatchDateFormatterProvider)
        //.config(monkeyPatchDatePickerProvider)
        .config(configureDatepicker);

    function configureDatepicker($datepickerProvider) {
        angular.extend($datepickerProvider.defaults, {
            iconLeft: 'fa fa-fw fa-chevron-left',
            iconRight: 'fa fa-fw fa-chevron-right'
            //TODO: USE AS SOON AS THE ANGULAR_STRAP ISSUE IS FIXED
            //https://github.com/mgcrea/angular-strap/issues/1129
            //template: '/components/zenubu.ngStrap/datepicker/datepicker.tpl.html',
            //container: 'self'
        });
        angular.extend($datepickerProvider.defaults, getDateFormats());
    }


    //function monkeyPatchDatePickerProvider($provide) {
    //    $provide.decorator('$datepicker', function ($delegate) {
    //
    //        $datepickerProvider.defaults = $delegate.defaults;
    //
    //        function $datepickerProvider(element, controller, config) {
    //            var $datepicker = $delegate(element, controller, config);
    //
    //            var originalPlacement = $datepicker.$applyPlacement;
    //
    //            $datepicker.$applyPlacement = function () {
    //                originalPlacement();
    //                angular.element($datepicker.$element[0]).css({
    //                    left: '0',
    //                    top: '0'
    //                });
    //            };
    //
    //            return $datepicker;
    //        }
    //
    //        return $datepickerProvider;
    //
    //    });
    //}

    function monkeyPatchDateFormatterProvider($provide) {
        $provide.decorator('$dateFormatter', function ($delegate) {

            var $dateFormatter = $delegate;

            $dateFormatter.getDefaultLocale = function () {
                return moment.locale();
            };

            $dateFormatter.weekdaysShort = function () {
                return moment.weekdaysShort();
            };

            var oldFormatDate = $dateFormatter.formatDate;
            $dateFormatter.formatDate = function (date, format, lang) {
                if (_.contains(getDateFormats(), format)) {
                    return moment(date.toISOString()).format(format);
                }
                return oldFormatDate(date, format, lang);
            };

            return $dateFormatter;


        });
    }


    function getDateFormats() {
        return {
            dayFormat: 'DD',
            monthTitleFormat: 'MMMM YYYY',
            monthFormat: 'MMM',
            yearFormat: 'YYYY',
            yearTitleFormat: 'YYYY'
        };
    }

})();