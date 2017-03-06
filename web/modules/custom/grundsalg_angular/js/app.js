/**
 * @file
 * Contains the App grundsalg.
 */

/**
 * Setup the app.
 */
angular.module('grundsalg', ['ngRoute', 'ngAnimate', 'angular-cache']).config(function($sceProvider) {
  // Completely disable SCE. We need to allow html to be added from Drupal.
  // @see grundsalg_slideshow
  $sceProvider.enabled(false);
});
