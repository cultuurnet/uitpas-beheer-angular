'use strict';

describe('Module: GaTagManager', function () {

    it('called the tag manager', function () {

        var spy = spyOn(window, 'initGaTagManager');
        var appConfig = {
            'gaTagManager': {
                'containerId': 'test'
            }
        };
        var myModule = angular.module('ubr.ga-tag-manager');
        var runBlock = myModule._runBlocks[0];
        runBlock[3](appConfig);
        expect(spy).toHaveBeenCalled();
    });

    it('it does not call tag manager', function () {

        var spy = spyOn(window, 'initGaTagManager');
        var appConfig = {
            'gaTagManager': {
                'containerId': ''
            }
        };
        var myModule = angular.module('ubr.ga-tag-manager');
        var runBlock = myModule._runBlocks[0];
        runBlock[3](appConfig);
        expect(spy).not.toHaveBeenCalled();
    });

});
