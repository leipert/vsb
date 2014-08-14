'use strict';

angular.module('GSB.config')
    .config(function (globalConfig) {
        globalConfig.name = 'MO_CONFIG';
        globalConfig.propertyTypeURIs.OBJECT_PROPERTY = [
            'http://purl.org/ontology/mo/',
            'http://purl.org/NET/c4dm/keys.owl#Key',
            'http://purl.org/dc/terms/MediaType',
            'http://web.resource.org/cc/License',
            'http://xmlns.com/foaf/0.1/'
        ];
        globalConfig.prefixes = _.merge(globalConfig.prefixes,{
            'mo': 'http://purl.org/ontology/mo/'
        });
        globalConfig.defaultGraphURIs = ['http://purl.org/ontology/mo/'];
    });