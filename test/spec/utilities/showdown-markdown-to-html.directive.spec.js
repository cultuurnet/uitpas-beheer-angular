'use strict';

describe('Directive: ubrShowdownMarkdownToHtml', function () {

  var markdownElement, scope, compile;

  // load the directive's module
  beforeEach(module('uitpasbeheerApp'));

  beforeEach(inject(function ($rootScope, $compile) {
    scope = $rootScope;
    scope.helpMarkdown = '# huppel';
    compile = $compile;

    jasmine.clock().install();
  }));

  afterEach(function() {
    jasmine.clock().uninstall();
  });

  var compileMarkdownElement = function (elementMarkup) {
    markdownElement = angular.element(elementMarkup);
    compile(markdownElement)(scope);
    scope.$digest();
    jasmine.clock().tick(60);

    return markdownElement;
  };

  it('should render provided markdown as html', function () {
    markdownElement = compileMarkdownElement('<div ubr-showdown-markdown-to-html="helpMarkdown"></div>');

    expect(markdownElement.html()).toBe('<h1 id="huppel">huppel</h1>');

    scope.helpMarkdown = '*hi*';
    scope.$apply();
    jasmine.clock().tick(60);
    expect(markdownElement.html()).toBe('<p><em>hi</em></p>');
  });

  it('should render provided markdown as html with the addAnchorsToTitles filter', function () {
    markdownElement = compileMarkdownElement('<div ubr-showdown-markdown-to-html="helpMarkdown" md-filters="addAnchorsToTitles"></div>');

    expect(markdownElement.html()).toBe('<a name="huppel"></a><h1 id="huppel">huppel</h1>');
  });

  it('should render provided markdown as html with the getOnlyTitles filter', function () {
    markdownElement = compileMarkdownElement('<div ubr-showdown-markdown-to-html="helpMarkdown" md-filters="getOnlyTitles"></div>');

    expect(markdownElement.html()).toBe('<ul><li><a href="#huppel">huppel</a></li></ul>');
  });
});
