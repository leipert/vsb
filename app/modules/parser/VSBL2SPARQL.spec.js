describe('Unit Test:', function () {
    describe('#VSBL2SPARQL', function () {

        beforeEach(module('VSB.parser.VSBL2SPARQL'));

        it('should contain an ParserToSPARQL service',
            inject(function (ParserToSPARQL) {
                expect(ParserToSPARQL).not.to.equal(null);
            })
        );

        it('should pass all fixtures tests',
            inject(function (ParserToSPARQL) {
                var f = window.fixtures;
                for (var key in f) {
                    if (key.indexOf('VSBL2SPARQL') === 0 && f.hasOwnProperty(key)) {
                        expect(ParserToSPARQL.translateJSONToSPARQL(f[key].json).toString()).to.equal(f[key].result)
                    }
                }
            })
        )


    });
});