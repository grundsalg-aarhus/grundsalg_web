/**
 * @file
 * Contains the show plots component
 */

/**
 * Plots component directive.
 *
 * html parameters:
 */
angular.module('grundsalg').directive('plots', function() {
  var tpl = drupalSettings.variables.plots_module_dir + '/templates/plots.html';
  if (drupalSettings.variables.form_template > 0) {
    tpl = drupalSettings.variables.plots_module_dir + '/templates/plots-form.html';
  }
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      plots: '=',
      displayLimit: '='
    },
    link: function(scope) {
      scope.modulepath = drupalSettings.variables.plots_module_dir + "/..";
    },
    templateUrl: tpl
  };
});
