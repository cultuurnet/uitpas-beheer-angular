'use strict';

describe('Directive: Uitpas numbers search field', function () {

  var $rootScope, $scope, searchField;

  beforeEach(module('ubr.passholder.search'));

  beforeEach(inject(function (_$rootScope_, $compile) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $scope.passNumbers = '';
    searchField = $compile('<input ng-model="passNumbers" ubr-uitpas-numbers-search-field />')($scope);
    $scope.$apply();
  }));

  it('should add scanned passes to the search field', function () {
    var scannedPassNumber = '1234567898521';

    $rootScope.$emit('nfcNumberReceived', scannedPassNumber);
    expect($scope.passNumbers).toEqual(scannedPassNumber);
  });

  it('should append additional scanned passes to the search field', function () {
    var scannedPassNumber    = '1234567898521';
    var existingPassNumbers  = '7894561239638';
    var expectedPassNumbers  = '7894561239638 1234567898521';

    $scope.passNumbers = existingPassNumbers;
    $scope.$apply();

    $rootScope.$emit('nfcNumberReceived', scannedPassNumber);
    expect($scope.passNumbers).toEqual(expectedPassNumbers);
  });

  it('should not add any duplicate scanned pass numbers to the search field', function () {
    var scannedPassNumber    = '1234567898521';
    var existingPassNumbers  = '1234567898521';
    var expectedPassNumbers  = '1234567898521';

    $scope.passNumbers = existingPassNumbers;
    $scope.$apply();

    $rootScope.$emit('nfcNumberReceived', scannedPassNumber);
    expect($scope.passNumbers).toEqual(expectedPassNumbers);
  });

  it('should mark search input that contains anything other than numbers or whitespace as invalid', function () {
    var modelController = searchField.controller('ngModel');
    $scope.passNumbers = '$B$E$E$P$B$O$O$B$';
    $scope.$apply();

    expect(modelController.$valid).toEqual(false);
    expect(modelController.$error.invalidCharacters).toEqual(true);
  });

  it('should allow numbers and whitespaces characters as valid search field input', function () {
    var modelController = searchField.controller('ngModel');
    $scope.passNumbers = '1234567898521 1234567898521\n1234567898521';
    $scope.$apply();

    expect(modelController.$valid).toEqual(true);
    expect(modelController.$error.invalidCharacters).not.toBeDefined();
  });
});