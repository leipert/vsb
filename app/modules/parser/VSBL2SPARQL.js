(function () {
    'use strict';
    /**
     * JSON Translator Factory
     * A factory to handle translation of JSON -> SPARQL
     *
     */


    angular.module('VSB.parser.VSBL2SPARQL', [])
        .factory('ParserToSPARQL', ParserToSPARQL);

    function ParserToSPARQL() {

        var factory = {};

        var jassa = new Jassa(Promise, $.ajax);

        var sparql = jassa.sparql;
        var rdf = jassa.rdf;
        var vocab = jassa.vocab;
        var shownVariables;
        var blockList;
        var objects = new sparql.VarExprList(), main = '';
        var aggregates;

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

        function translateAggregate(aggregate, subjectAlias, view) {
            var propertyAlias = sanitizeAlias(subjectAlias + ' ' + aggregate.linkTo);
            var alias = sanitizeAlias(propertyAlias + ' ' + aggregate.uri);
            var s = rdf.NodeFactory.createVar(alias);
            var p = rdf.NodeFactory.createVar(propertyAlias);
            aggregate.operator = aggregate.operator.replace(/%alias%/g, p);
            if (view && !shownVariables.contains(s)) {
                aggregates.add(s, aggregate.operator);
            }
            blockList.add(p);
            return [];
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
            if (type === 'AGGREGATE_PROPERTY') {
                return translateAggregate(property, subjectAlias, view);
            }
            if (uri === '$$uri') {
                if (property.compare !== null) {
                    property.compare = property.compare.replace(/%before_arithmetic%/g, s).replace(/%after_arithmetic%/g, s);
                    triples.addTriples([new sparql.ElementFilter(property.compare)]);
                }
                return triples;
            }

            if (type === 'INVERSE_PROPERTY') {
                r = translateObjectProperty(s, p, o, property.linkTo, view);
                s = r.o;
                b = r.s;
                view = r.view;
                type = 'RELATION_PROPERTY';
            } else if (type === 'RELATION_PROPERTY') {
                r = translateObjectProperty(s, p, o, property.linkTo, view);
                b = r.o;
                view = r.view;
            }

            if (property.filterExists) {
                if (property.hasFilter) {
                    if (property.arithmetic !== null) {
                        b = rdf.NodeFactory.createVar(sanitizeAlias(alias + ' ' + 'temp'));
                    }
                }

                triples.addTriples([new rdf.Triple(s, p, b)]);

                if (property.hasFilter) {
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
                    if (type === 'RELATION_PROPERTY') {
                        objects.add(rdf.NodeFactory.createVar(alias));
                    }
                }

            } else {

                /*jshint camelcase: false */
                triples.addTriples([new sparql.ElementFilter('NOT EXISTS {' + (new rdf.Triple(s, p, o).toString() + '}'))]);
                /*jshint camelcase: true */
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
                ElementTriplesBlock = new sparql.ElementTriplesBlock();
            ElementTriplesBlock.addTriples([new rdf.Triple(s, vocab.rdf.type, o)]);

            if (subject.view && !shownVariables.contains(s, alias)) {
                shownVariables.add(s);
                objects.add(s);
                if (main === '') {
                    main = s;
                }
            }

            if (subject.hasOwnProperty('properties')) {
                subject.properties.forEach(function (property) {
                    ElementTriplesBlock.addTriples(translateProperty(property, alias, subject.view));
                });
            }
            return ElementTriplesBlock;
        }

        function getProjectVars(withoutAggregates) {
            var pVars = new sparql.VarExprList();
            shownVariables.entries().forEach(function (pv) {
                if (!blockList.contains(pv.v)) {
                    pVars.add(pv.v, pv.expr);
                }
            });
            if (!withoutAggregates) {
                aggregates.entries().forEach(function (pv) {
                    if (!blockList.contains(pv.v)) {
                        pVars.add(pv.v, pv.expr);
                    }
                });
            }
            return pVars;
        }

        /**
         * Function to start translation process, with call to changeURIs for the mockup data
         * and replaceAliasSpaces to replace spaces with underscores
         * @param json
         */
        factory.translateJSONToSPARQL = function (json) {
            aggregates = new sparql.VarExprList();
            shownVariables = new sparql.VarExprList();
            blockList = new sparql.VarExprList();
            var query = new sparql.Query(),
                ElementTriplesBlock = new sparql.ElementTriplesBlock();
            if (json.hasOwnProperty('SUBJECTS')) {
                json.SUBJECTS.forEach(function (subject) {
                    ElementTriplesBlock.addTriples(translateSubject(subject));
                });
            }
            query.setQueryPattern(ElementTriplesBlock);
            query.setProjectVars(getProjectVars());
            query.setDistinct(true);
            if (aggregates.entries().length > 0) {
                query.groupBy = getProjectVars(true).vars;
            }

            return query;
        };

        factory.translateJSONToSponateMap = function (json) {
            aggregates = new sparql.VarExprList();
            objects = new sparql.VarExprList();
            main = '';

            shownVariables = new sparql.VarExprList();
            blockList = new sparql.VarExprList();
            var ElementTriplesBlock = new sparql.ElementTriplesBlock(), r;
            if (json.hasOwnProperty('SUBJECTS')) {
                json.SUBJECTS.forEach(function (subject) {
                    ElementTriplesBlock.addTriples(translateSubject(subject));
                });
            }

            //ElementTriplesBlock.addTriples(aggregates);

            r = {
                name: new Date().toISOString(),
                template: [{
                    id: main.toString(),
                    rows: [{
                        id: '?rowId'
                    }]
                }],
                from: ElementTriplesBlock.toString()
            };

            getProjectVars().getVars().forEach(function (Var) {
                var key = Var.toString().replace(/^\?/, '');
                if (objects.contains(Var)) {
                    key = '$' + key;
                }
                r.template[0].rows[0][key] = Var.toString();
            });

            return r;
        };


        return factory;

    }

})();