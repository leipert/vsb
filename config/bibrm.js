'use strict';

angular.module('GSB.config')
    .config(function (globalConfig) {
        globalConfig.name = 'BIBRM_CONFIG';
        globalConfig.propertyTypeURIs.OBJECT_PROPERTY = [
            'http://vocab.ub.uni-leipzig.de/bibrm/'
        ];
        globalConfig.prefixes = _.merge(globalConfig.prefixes,{
            bibrm: 'http://vocab.ub.uni-leipzig.de/bibrm/',
            sysont: 'http://ns.ontowiki.net/SysOnt/',
            bibo: 'http://purl.org/ontology/bibo/',
            aiiso: 'http://purl.org/vocab/aiiso/schema#',
            dct: 'http://purl.org/dc/terms/',
            sioc: 'http://rdfs.org/sioc/ns#',
            geo: 'http://www.w3.org/2003/01/geo/wgs84_pos#'
        });
        globalConfig.defaultGraphURIs = [''];
        globalConfig.baseURL = 'http://localhost:8890/sparql';

    });