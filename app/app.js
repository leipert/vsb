'use strict';

// Loads all our components
angular.module('GSB', [
    'GSB.config',
    'GSB.filters',
    'GSB.subject',
    'GSB.mainCtrl',
    'GSB.languageService'
]).config(function (uiSelectConfig) {
    uiSelectConfig.theme = 'bootstrap';
});

//Global functions

//Define 'str1'.startsWith('str2') if undefined.
if (typeof String.prototype.startsWith !== 'function') {
    /**
     * Returns whether the String starts with the given str
     * @param str
     * @returns {boolean}
     */
    String.prototype.startsWith = function (str) {
        return this.indexOf(str) === 0;
    };
}
