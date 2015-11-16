'use strict';

(function(){

  var getSafeTitleString = function (string) {
    var spacesToDashes = string.replace(/ /g, '-');
    return spacesToDashes.replace(/[!\"#$%&'\(\)\*\+,\.\/:;<=>\?\@\[\\\]\^`\{\|\}~]/g, '');
  };

  var addAnchorsToTitles = function () {
    return [
      {
        type: 'output',
        filter: function (source) {
          return source.replace(/<h1[a-zA-Z\d\=\"\" ]+>(.+)<\/h1>/gmi, function (fullTitle, titleText) {
              return '<a name="' + getSafeTitleString(titleText) + '"></a>' + fullTitle;
          });
        }
      }
    ];
  };

  // Client-side export
  if (typeof window !== 'undefined' && window.showdown && window.showdown.extension) {
    window.showdown.extension('addanchorstotitles', addAnchorsToTitles);
  }
  // Server-side export
  if (typeof module !== 'undefined') {
    module.exports = addAnchorsToTitles;
  }

}());
