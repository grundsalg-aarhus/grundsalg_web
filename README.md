# Grundsalg Aarhus web

#### Setup

Assuming you have followed the steps in 
https://github.com/aakb/vagrant/blob/development/grundsalg_web/README.md, continue by completing the following: 

Connect with platform.sh:

```sh
cd /vagrant/htdocs
platform    # login
platform project:set-remote [Project ID]
```

Setup drush aliases:

```sh
platform drush-aliases
```

Pull database:
```sh
cd /vagrant/htdocs/web
drush pull-prod
```

## Uses composer
Use composer commands to add/remove/update contrib modules/profiles/themes.

## Structure

Follows platform.sh d8 example structure
* Uses the recommended drupal structure for composer projects
https://www.drupal.org/docs/develop/using-composer/using-composer-with-drupal
* See
https://github.com/platformsh/platformsh-example-drupal8 for further information.
* Config sync folder located in root folder.

## Module folder divided into contrib and custom.
Contrib modules added and managed by composer and not included in the github repo.

Custom modules manually maintained and added to github.


## Profiles folder containing the itkore profile
ITKore profile is used as a base profile and contains a list of custom modules described within the install profile. https://github.com/aakb/itkore-profile

The profile is detached from github and maintained through composer. Changes to the profile should only happen through a new release of the profile. The profile has it's own release cycle and changelog.

ITKore profile depends on a list of contrib modules added to the grundsalg modules/contrib folder.


## Themes folder holding three themes
Contrib themes are added and managed by composer.
* Adminimal theme used as a base theme (Contrib)
* Grundsalg used as the main theme. (Custom)
* Itkore theme - Unused (Contrib)

## Custom modules

#### Grundsalg angular
* Provides angular library and adds the angular modules used across the site.
* Initiates the grundsalg angular app used across the site.

#### Grundsalg db client
* Provides connection to the fagsystem database.
* Provides the client used to talk to the fagsystem API.
* Provides example data json file which can be enabled/disabled from a provided config page.
* Requires a link to the remote database (For further information see module readme file).

#### Grundsalg front
* Provides config page for changing frontpage
* Hooks into itkore_admin module (From itkore profile) to add a frontpage config tab on site settings page

#### Grundsalg plots
* Provides plots to subdivision content type
* Uses angular grundsalg app to fetch plots

#### Grundsalg reference tree
* Provides a breadcrumb builder depending on field_parent node reference field.
* Populates field_parent on node save based on the supplied city info and type. (e.g Villa, Malling)

## Grundsalg setup
* A "Catch all" kind of module to perform simple stuff that doesn't want a seperate module.
* Used for new update hooks when adding new modules to the project.
* Provides a comprehensive modification of the node type forms.
* Expands on the itkore_footer module. (Adds a new field for contact information)

#### Grundsalg slideshow
* Angular app for turning images provided on content into slideshow.

#### Grundsalg tabs
* Angular app for providing tabs on area and subdivision content types.
* Provides controllers for streetview and video display.
* Provides paths for each tab.

## platform.sh

There are included two platform.sh apps in the project (app and styleguide).

#### Connect with platform.sh

```sh
cd /vagrant/htdocs
platform    # login
platform project:set-remote [Project ID]
```

#### Push to platform.sh

Read more about environments here: https://docs.platform.sh/administration/web/environments.html

When building a new branch, the parent branch (default master) will be used as reference, this might cause a unresponsive environment. Therefore it is important to make sure to set parent branch before pushing.

##### Environment scructure
* Master
  * Release
    * release/name_of_release
  * develop
    * feature/JIRA_ISSUE_ID_name_of_branch

Make sure you have checked out the branch you want to push:
```sh
git checkout branch_name
```

Push the branch to platform so we can set the parent. Note: this will not trigger a build.
```sh
git push platform branch_name
```

Setting a branch to use develop as parent (using the branch you have checked out)
```sh
platform environment:info parent develop
```

Activate environment
```sh
platform environment:activate environment_name
```

Pushing develop
```sh
git push platform develop       # or master
```
