(function () {
    'use strict';

    angular.module('GSB.config')
        .config(changeGlobalConfig);

    function changeGlobalConfig(globalConfig) {
        globalConfig.name = 'GSB_CONFIG';
        globalConfig.propertyTypeByRange['http://vocab.ub.uni-leipzig.de/bibrm/'] = 'OBJECT_PROPERTY';
        globalConfig.prefixes = _.merge(globalConfig.prefixes, {
            bibrm: 'http://vocab.ub.uni-leipzig.de/bibrm/',
            sysont: 'http://ns.ontowiki.net/SysOnt/',
            bibo: 'http://purl.org/ontology/bibo/',
            aiiso: 'http://purl.org/vocab/aiiso/schema#',
            dct: 'http://purl.org/dc/terms/',
            sioc: 'http://rdfs.org/sioc/ns#',
            xsd: 'http://www.w3.org/2001/XMLSchema#',
            geo: 'http://www.w3.org/2003/01/geo/wgs84_pos#'
        });

        //globalConfig.defaultGraphURIs = [''];
        //globalConfig.baseURL = 'http://192.168.59.103:8890/sparql';
        //globalConfig.defaultGraphURIs = ['http://dbpedia.org'];
        //globalConfig.baseURL = 'http://dbpedia.org/sparql';
        globalConfig.resultURL = globalConfig.baseURL;

        globalConfig.endPointQueries = {
            getDirectProperties:
            '?x a <%uri%> . ' +
            '?x ?uri ?y . ' +
            'OPTIONAL { ?uri rdf:type ?type } .' +
            'OPTIONAL { ?uri rdfs:domain ?range }  .' +
            'OPTIONAL { ?uri rdfs:label ?label . BIND(LANG(?label) AS ?label_loc) } .' +
            'OPTIONAL { ?uri rdfs:comment ?comment . BIND(LANG(?comment) AS ?comment_loc) } .' +
            'FILTER ( !isBlank(?uri) && !isBlank(?range) ) ',
            getInverseProperties:

            '?uri rdf:type owl:ObjectProperty  .' +
            '?x a <%uri%> . ' +
            '?y ?uri ?x . ' +
            'BIND(owl:ObjectProperty as ?type) .' +
            'OPTIONAL { ?uri rdfs:domain ?range }  .' +
            'OPTIONAL { ?uri rdfs:label ?label . BIND(LANG(?label) AS ?label_loc) } .' +
            'OPTIONAL { ?uri rdfs:comment ?comment . BIND(LANG(?comment) AS ?comment_loc) } .' +
            'FILTER ( !isBlank(?uri) && !isBlank(?range) ) ',

            getSuperAndEqClasses: '<%uri%> (rdfs:subClassOf|(owl:equivalentClass|^owl:equivalentClass))* ?uri ' +
            'FILTER ( !isBlank(?uri) )',
            getSubAndEqClasses: '<%uri%> (^rdfs:subClassOf|(owl:equivalentClass|^owl:equivalentClass))* ?uri ' +
            'FILTER ( !isBlank(?uri) )',
            getAvailableClasses: '{?uri a rdfs:Class .} UNION {?uri a owl:Class .} .' +
            'FILTER ( !isBlank(?uri) )' +
            'OPTIONAL { ?uri rdfs:label ?label . BIND(LANG(?label) AS ?label_loc) } .' +
            'OPTIONAL { ?uri rdfs:comment ?comment . BIND(LANG(?comment) AS ?comment_loc)} ',
            getPossibleRelation: '<%uri1%> (rdfs:subClassOf|(owl:equivalentClass|^owl:equivalentClass))* ?class1 .' +
            '<%uri2%> (rdfs:subClassOf|(owl:equivalentClass|^owl:equivalentClass))* ?class2 .' +
            '{ ' +
            '?uri rdfs:domain ?class1 . ' +
            '?uri rdfs:range ?class2  .' +
            '} UNION { ' +
            '?uri rdfs:domain ?class2 . ' +
            '?uri rdfs:range ?class1  .' +
            '}'
        }

        //globalConfig.resultURL = 'https://ssl.leipert.io/sparql?timeout=5000&debug=on';
    }

})();