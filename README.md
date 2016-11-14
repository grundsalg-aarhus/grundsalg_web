# Grundsalg Aarhus web

## Currently runs on platform.sh
- For the local setup to work you need to have a user account on platform.sh and have it take part in the grundsalgweb project.

## Local setup
Run these scripts

    site_install.sh

Fetches all files needed to build a site for Grundsalg Aarhus web

    scripts/site_setup.sh

Sets up database for Grundsalg Aarhus web. (This needs to be run within your vagrant)


## Pushing to platform.sh
To add your changes to platforms development site from origin/develop

    git push platform develop

This will create a new build on develop branch.

## Syncing local site from master
- scripts/site_sync.sh: Fetches db and files from platform master. (This needs to be run within your vagrant)

## Composer A-Z
Useful composer commands

Composer install

    composer install

Builds a new site from composer.lock file if one exist, builds a site from composer.json if no lock file exist.

Composer update

    composer update

Builds a site from composer json and adds/updates composer.lock with composer.json changes.

Composer require

    composer require drupal/[module]

Installs a module and adds the requirement of the module to the composer.json and composer.lock files

