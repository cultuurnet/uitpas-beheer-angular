'use strict';

describe('Module: GaTagManager', function () {

    it('called the tag manager', function () {

        var spy = spyOn(window, 'initGaTagManager');
        var appConfig = {
            "gaTagManager": {
                "containerId": "test"
            }
        };
        var myModule = angular.module('ubr.ga-tag-manager');
        var runBlock = myModule._runBlocks[0];
        runBlock[3](appConfig);
        expect(spy).toHaveBeenCalled();
    });

    /**
     * This test can be enabled after next release of karma
     * @see  https://github.com/jasmine/jasmine/commit/342f0eb9a38194ecb8559e7df872c72afc0fe52e
     */
    /**
    it('it does not call tag manager', function () {

        var spy = spyOn(window, 'initGaTagManager');
        var appConfig = {
            "gaTagManager": {
                "containerId": ""
            }
        };
        var myModule = angular.module('ubr.ga-tag-manager');
        var runBlock = myModule._runBlocks[0];
        runBlock[3](appConfig);
        expect(spy).toHaveBeenCalledTimes(0);
    });*/

});
