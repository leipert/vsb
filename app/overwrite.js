'use strict';

angular.module('GSB.config')
    .config(function (globalConfig) {
        globalConfig.name = 'DBPEDIA_CONFIG';
        globalConfig.propertyTypeByRange['http://dbpedia.org/ontology/'] = 'OBJECT_PROPERTY';
        globalConfig.prefixes = _.merge(globalConfig.prefixes, {
            'category': 'http://dbpedia.org/resource/Category:',
            'dbpedia': 'http://dbpedia.org/resource/',
            'dbpedia-owl': 'http://dbpedia.org/ontology/',
            'dbpprop': 'http://dbpedia.org/property/',
            'units': 'http://dbpedia.org/units/',
            'yago': 'http://dbpedia.org/class/yago/'
        });
        globalConfig.defaultGraphURIs = ['http://dbpedia.org'];
        globalConfig.baseURL = 'http://dbpedia.org/sparql';
        globalConfig.resultURL = globalConfig.baseURL;
        globalConfig.endPointQueries.getDirectProperties = '{<%uri%> (rdfs:subClassOf|(owl:equivalentClass|^owl:equivalentClass))* ?class .' +
        '?uri rdfs:domain ?class .' +
        'OPTIONAL { ?uri rdfs:range ?range }  .' +
        'OPTIONAL { ?uri rdf:type ?type }  .' +
        'OPTIONAL { ?uri rdfs:label ?label . BIND(LANG(?label) AS ?label_loc) } .' +
        'OPTIONAL { ?uri rdfs:comment ?comment . BIND(LANG(?comment) AS ?comment_loc) } .' +
        'FILTER ( !isBlank(?class) && !isBlank(?uri) && !isBlank(?range) ) ' +
        '} UNION { ?uri rdfs:range <http://dbpedia.org/ontology/City> . ?uri rdfs:range ?range . OPTIONAL { ?uri rdf:type ?type }   }';

    });