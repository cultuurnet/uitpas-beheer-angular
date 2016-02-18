'use strict';

describe('Controller: HelpController', function () {

  beforeEach(module('uitpasbeheerApp'));

  var helpService, $q, helpController, $state, $scope;

  var getSpyForm = function (formData) {
    var spyForm = {
      $valid: true,
      $dirty: true,
      $setPristine: jasmine.createSpy('$setPristine')
    };

    if (formData) {
      angular.merge(spyForm, formData);
    }

    return spyForm;
  };

  beforeEach(inject(function ($injector, $rootScope){
    var $controller = $injector.get('$controller');
    $scope = $rootScope;
    $q = $injector.get('$q');
    helpService = jasmine.createSpyObj(
      'helpService',
      [
        'getHelpText',
        'checkEditPermission',
        'updateHelpOnServer'
      ]
    );
    $state = jasmine.createSpyObj('$state', ['go']);

    helpService.getHelpText.and.returnValue($q.when('help text'));
    helpService.checkEditPermission.and.returnValue(true);

    helpController = $controller('HelpController', {
      helpService: helpService,
      $q: $q,
      $state: $state
    });
  }));

  it('should initiate with getting the help data', function () {
    $scope.$apply();

    expect(helpService.getHelpText).toHaveBeenCalled();
    expect(helpService.checkEditPermission).toHaveBeenCalled();

    expect(helpController.helpMarkdown).toBe('help text');
    expect(helpController.userCanEdit).toBeTruthy();
  });

  it('should return true if the form is dirty', function () {
    $scope.$apply();

    expect(helpController.isFormDirty(getSpyForm())).toBeTruthy();
  });

  it('should return false if the form is not dirty', function () {
    var form = {
      $dirty: false
    };

    $scope.$apply();

    expect(helpController.isFormDirty(getSpyForm(form))).toBeFalsy();
  });

  it('redirects on successful form submit', function () {
    helpController.helpMarkdown = 'submit this';
    helpService.updateHelpOnServer.and.returnValue($q.when());

    helpController.submitForm(getSpyForm());

    $scope.$apply();

    expect(helpService.updateHelpOnServer).toHaveBeenCalledWith('submit this');
    expect($state.go).toHaveBeenCalled();
  });

  it('sets an error variable with form submit error', function () {
    helpController.helpMarkdown = 'submit this';
    helpService.updateHelpOnServer.and.returnValue($q.reject());

    helpController.submitForm(getSpyForm());

    $scope.$apply();

    expect(helpService.updateHelpOnServer).toHaveBeenCalledWith('submit this');
    expect(helpController.showUpdateError).toBeTruthy();
  });
});
