(function () {
    'use strict';
    angular.module('GSB.propertyType', [
        'GSB.propertyType.object',
        //'GSB.propertyType.aggregate',
        'GSB.propertyType.number',
        'GSB.propertyType.string',
        'GSB.propertyType.date'
    ]);
})();