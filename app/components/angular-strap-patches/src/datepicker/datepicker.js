(function () {
    'use strict';
    angular.module('zenubu.ngStrap.datepicker', [
        'mgcrea.ngStrap.datepicker',
        'mgcrea.ngStrap.helpers.dateFormatter'
    ])
        .config(monkeyPatchDateFormatterProvider)
        .config(configureDatepicker);

    function configureDatepicker($datepickerProvider) {
        angular.extend($datepickerProvider.defaults, {
            iconLeft: 'fa fa-fw fa-chevron-left',
            iconRight: 'fa fa-fw fa-chevron-right'
        });
        angular.extend($datepickerProvider.defaults, getDateFormats());
    }

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