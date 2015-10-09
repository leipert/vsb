describe('Unit Test:', function () {
    describe('#NavigationCtrl', function () {

        var scope;
        var ctrl;

        beforeEach(module('VSB.layout'));

        beforeEach(inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            ctrl = $controller('NavigationCtrl', {$scope: scope, $rootScope: $rootScope});
        }));

        it('should have a NavigationCtrl controller', function () {
            expect(ctrl).not.to.equal(undefined);
            expect(ctrl).not.to.equal(null);
        });

        it('should have the switchStatus set to false', function(){
            expect(scope.switchStatus).to.equal(true);
        });

        it('should react to updateJSON event on $rootscope',function(){
            inject(function($rootScope){
                $rootScope.$emit('updateJSON','{}');
            });
            expect(scope.blobURL).not.to.equal(undefined);
            expect(scope.blobURL).to.startsWith('blob:');
        });

    });
});