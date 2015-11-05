'use strict';

describe('Directive: ubrShowdownMarkdownToHtml', function () {

  var markdownElement, scope, compile;

  // load the directive's module
  beforeEach(module('uitpasbeheerApp'));

  beforeEach(inject(function ($rootScope, $compile) {
    scope = $rootScope;
    scope.helpMarkdown = '# huppel';
    compile = $compile;
  }));

  var compileMarkdownElement = function (elementMarkup) {
    markdownElement = angular.element(elementMarkup);
    compile(markdownElement)(scope);
    scope.$digest();
    return markdownElement;
  };

  it('should render provided markdown as html', function () {
    markdownElement = compileMarkdownElement('<div ubr-showdown-markdown-to-html="helpMarkdown"></div>');

    expect(markdownElement.html()).toBe('<h1 id="huppel">huppel</h1>');

    scope.helpMarkdown = '*hi*';
    scope.$apply();
    expect(markdownElement.html()).toBe('<p><em>hi</em></p>');
  });

  it('should render provided markdown as html with a specified filter', function () {

  });

  it('should change the html when the markdown changes', function () {

  });

});
