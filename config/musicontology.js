'use strict';

angular.module('VSB.config')
    .config(function (globalConfig) {
        globalConfig.name = 'MO_CONFIG';
        globalConfig.propertyTypeByRange['http://purl.org/ontology/mo/'] = 'RELATION_PROPERTY';
        globalConfig.propertyTypeByRange['http://purl.org/NET/c4dm/keys.owl#Key/'] = 'RELATION_PROPERTY';
        globalConfig.propertyTypeByRange['http://purl.org/dc/terms/MediaType/'] = 'RELATION_PROPERTY';
        globalConfig.propertyTypeByRange['http://web.resource.org/cc/License/'] = 'RELATION_PROPERTY';
        globalConfig.propertyTypeByRange['http://xmlns.com/foaf/0.1/'] = 'RELATION_PROPERTY';
        globalConfig.prefixes = _.merge(globalConfig.prefixes,{
            'mo': 'http://purl.org/ontology/mo/'
        });
        globalConfig.defaultGraphURIs = ['http://purl.org/ontology/mo/'];
        globalConfig.resultURL = globalConfig.baseURL;
    });