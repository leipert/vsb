'use strict';
/**
 * JSON Translator Factory
 * A factory to handle translation of JSON -> SPARQL
 *
 */
/* global jassa */


angular.module('GSB.services.translatorToSPARQL', ['GSB.config'])
    .factory('TranslatorToSPARQL', function () {

        var factory = {};

        var sparql = jassa.sparql;
        var rdf = jassa.rdf;
        var vocab = jassa.vocab;
        var shownVariables;

        function sanitizeAlias(string) {

            var pattern = new RegExp('[^A-Za-z0-9_?]', 'g');

            return string.replace(pattern, '_').replace(/_+/g, '_').replace(/^_|_$/, '');
        }

        function translateObjectProperty(s, p, o, linkTo, view) {
            if (linkTo !== null) {
                o = rdf.NodeFactory.createVar(sanitizeAlias(linkTo));
                view = false;
            }
            return {s: s, p: p, o: o, view: view};
        }

        function translateProperty(property, subjectAlias, subjectView) {
            var alias = sanitizeAlias(subjectAlias + ' ' + property.alias),
                uri = property.uri,
                type = property.type,
                triples = new sparql.ElementTriplesBlock(),
                r;
            var s = rdf.NodeFactory.createVar(subjectAlias);
            var p = rdf.NodeFactory.createUri(uri);
            var o = rdf.NodeFactory.createVar(alias);
            var b = o;
            var view = subjectView && property.view;
            if (type === 'INVERSE_PROPERTY') {
                r = translateObjectProperty(s, p, o, property.linkTo, view);
                s = r.o;
                b = r.s;
                view = r.view;
            } else if (type === 'OBJECT_PROPERTY') {
                r = translateObjectProperty(s, p, o, property.linkTo, view);
                b = r.o;
                view = r.view;
            }

            if (property.filterExists) {
                if(property.hasFilter) {
                    if (property.arithmetic !== null) {
                        b = rdf.NodeFactory.createVar(sanitizeAlias(alias + ' ' + 'temp'));
                    }
                }

                triples.addTriples([new rdf.Triple(s, p, b)]);

                if(property.hasFilter) {
                    if (property.arithmetic !== null) {
                        property.arithmetic = property.arithmetic.replace(/%before_arithmetic%/g, b).replace(/%after_arithmetic%/g, o);
                        triples.addTriples([new sparql.ElementBind(o, property.arithmetic)]);
                    }
                    if (property.compare !== null) {
                        property.compare = property.compare.replace(/%before_arithmetic%/g, b).replace(/%after_arithmetic%/g, o);
                        triples.addTriples([new sparql.ElementFilter(property.compare)]);
                    }
                }

                if (view && !shownVariables.contains(rdf.NodeFactory.createVar(alias))) {
                    shownVariables.add(rdf.NodeFactory.createVar(alias));
                }

            } else {
                triples.addTriples([new sparql.ElementFilter(new sparql.E_NotExists(new rdf.Triple(s, p, o)))]);
            }

            if (property.optional) {
                return new sparql.ElementOptional(triples);
            }

            return triples;
        }

        function translateSubject(subject) {

            var alias = sanitizeAlias(subject.alias),
                s = rdf.NodeFactory.createVar(sanitizeAlias(alias)),
                o = rdf.NodeFactory.createUri(subject.uri),
                triples = [new rdf.Triple(s, vocab.rdf.type, o)];

            if (subject.view && !shownVariables.contains(s)) {
                shownVariables.add(s);
            }

            if (subject.hasOwnProperty('properties')) {
                subject.properties.forEach(function (property) {
                    triples = triples.concat(translateProperty(property, alias, subject.view));
                });
            }
            return triples;
        }


        /**
         * Function to start translation process, with call to changeURIs for the mockup data
         * and replaceAliasSpaces to replace spaces with underscores
         * @param json
         */
        factory.translateJSONToSPARQL = function (json) {
            shownVariables = new sparql.VarExprList();
            var query = new sparql.Query(),
                ElementTriplesBlock = new sparql.ElementTriplesBlock();
            if (json.hasOwnProperty('SUBJECTS')) {
                json.SUBJECTS.forEach(function (subject) {
                    ElementTriplesBlock.addTriples(translateSubject(subject));
                });
            }
            query.setQueryPattern(ElementTriplesBlock);
            query.setProjectVars(shownVariables);
            query.setDistinct(true);
            query.setLimit(100);
            return query.toString();
        };

        return factory;

    });
