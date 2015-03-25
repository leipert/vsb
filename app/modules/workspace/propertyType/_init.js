(function () {
    'use strict';
    angular.module('VSB.propertyType', [
        'VSB.propertyType.object',
        'VSB.propertyType.aggregate',
        'VSB.propertyType.number',
        'VSB.propertyType.string',
        'VSB.propertyType.date'
    ]);
})();