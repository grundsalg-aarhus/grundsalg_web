# Grundsalg Aarhus web
* See readme in ITK vagrant repo about setting up or syncing a grundsalg web site.
* Changelog located in root folder.

## Uses composer
Use composer commands to add/remove/update contrib modules/profiles/themes.

## Structure

### Follows platform.sh d8 example structure
* Uses the recommended drupal structure for composer projects
https://www.drupal.org/docs/develop/using-composer/using-composer-with-drupal
* See
https://github.com/platformsh/platformsh-example-drupal8 for further information.
* Config sync folder located in root folder.

### Module folder divided into contrib and custom.
Contrib modules added and managed by composer and not included in the github repo.

Custom modules manually maintained and added to github.


### Profiles folder containing the itkore profile
ITKore profile is used as a base profile and contains a list of custom modules described within the install profile. https://github.com/aakb/itkore-profile

The profile is detached from github and maintained through composer. Changes to the profile should only happen through a new release of the profile. The profile has it's own release cycle and changelog.

ITKore profile depends on a list of contrib modules added to the grundsalg modules/contrib folder.


### Themes folder holding three themes
Contrib themes are added and managed by composer.
* Adminimal theme used as a base theme (Contrib)
* Grundsalg used as the main theme. (Custom)
* Itkore theme - Unused (Contrib)

## Custom modules

### Grundsalg angular
* Provides angular library and adds the angular modules used across the site.
* Initiates the grundsalg angular app used across the site.

### Grundsalg db client
* Provides connection to the fagsystem database.
* Provides the client used to talk to the fagsystem API.
* Provides example data json file which can be enabled/disabled from a provided config page.
* Requires a link to the remote database (For further information see module readme file).

### Grundsalg front
* Provides config page for changing frontpage
* Hooks into itkore_admin module (From itkore profile) to add a frontpage config tab on site settings page

### Grundsalg plots
* Provides plots to subdivision content type
* Uses angular grundsalg app to fetch plots

### Grundsalg reference tree
* Provides a breadcrumb builder depending on field_parent node reference field.
* Populates field_parent on node save based on the supplied city info and type. (e.g Villa, Malling)

## Grundsalg setup
* A "Catch all" kind of module to perform simple stuff that doesn't want a seperate module.
* Used for new update hooks when adding new modules to the project.
* Provides a comprehensive modification of the node type forms.
* Expands on the itkore_footer module. (Adds a new field for contact information)

### Grundsalg slideshow
* Angular app for turning images provided on content into slideshow.

### Grundsalg tabs
* Angular app for providing tabs on area and subdivision content types.
* Provides controllers for streetview and video display.
* Provides paths for each tab.