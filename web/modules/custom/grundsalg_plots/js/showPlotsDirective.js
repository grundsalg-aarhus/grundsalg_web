/**
 * @file
 * Contains the show plots component
 */

/**
 * Plots component directive.
 *
 * html parameters:
 */
angular.module('grundsalg').directive('plots', ['$window', function($window) {
  var tpl = drupalSettings.variables.plots_module_dir + '/templates/plots.html';
  if (drupalSettings.variables.form_template > 0) {
    tpl = drupalSettings.variables.plots_module_dir + '/templates/plots-form.html';
  }
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      plots: '=',
      displayLimit: '=',
      fetchPlots: '='
    },
    link: function(scope) {
      scope.modulepath = drupalSettings.variables.plots_module_dir + "/..";

      /**
       * Expose the Drupal.t() function to angular templates.
       *
       * @param str
       *   The string to translate.
       * @returns string
       *   The translated string.
       */
      scope.Drupal = {
        "t": function (str) {
          return $window.Drupal.t(str);
        }
      };
    },
    templateUrl: tpl
  };
}]);

