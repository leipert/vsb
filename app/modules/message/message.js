(function () {
    'use strict';

// Loads all our components
    angular.module('VSB.message', [])
        .factory('MessageService', function () {
            var messages = [];
            return {
                messages: messages,
                addMessage: function (message) {
                    if (_.isString(message)) {
                        message = {
                            message: message,
                            'class': 'info'
                        };
                    }
                    message.class = 'alert-' + message.class;
                    if (message.icon) {
                        message.icon = 'fa-' + message.icon;
                    }
                    messages.push(message);
                    return message;
                },
                dismiss: function (message, doNotRunCallback) {
                    if (_.isObject(message)) {
                        if (!doNotRunCallback && _.isFunction(message.dismiss)) {
                            message.dismiss();
                        }
                        _.remove(messages, message);
                    }
                    return null;
                }
            };
        })
        .directive('messages', function () {
            return {
                restrict: 'A',
                scope: true,
                replace: true,
                controller: function (MessageService) {
                    var vm = this;
                    vm.messages = MessageService.messages;
                    vm.dismiss = MessageService.dismiss;
                },
                controllerAs: 'vm',
                template: '<div class="messageContainer" >' +
                '<div class="alert" ng-class="message.class" ng-repeat="message in vm.messages" >' +
                '<a class="pull-right alert-link" href="" ng-click="vm.dismiss(message)">' +
                '<i class="pull-left fa fa-lg fa-times"></i><span ng-if="message.dismissText" translate="{{message.dismissText}}"></span>' +
                '</a>' +
                '<i class="pull-left fa fa-lg fa-fw" ng-if="message.icon" ng-class="message.icon" ></i><span compile="message.message"></span>' +
                '</div>' +
                '</div>'
            };
        });


})();