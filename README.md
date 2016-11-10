# Grundsalg Aarhus web

## Currently runs on platform.sh
- For the local setup to work you need to have a user account on platform.sh and have it take part in the grundsalgweb project.

## Local setup

### I don't care whats going on just give me the scripts!!!
Run these scripts
- site_install.sh: Fetches all files needed to build a site for Grundsalg Aarhus web
- scripts/site_setup.sh: Sets up database for Grundsalg Aarhus web. (This needs to be run within your vagrant in the document root (/vagrant/htdocs/web)
- scripts/site_sync.sh: Fetches files and db from platform.sh (This needs to be run within your vagrant in the document root (/vagrant/htdocs/web)


### I want to setup my local environment manually!
Fetch files from platform git.

    platform get [project_id] htdocs -y

Change git remote to track our github repo.

    git remote set-url origin git@github.com:grundsalg-aarhus/grundsalg_web.git
    git fetch origin
    git branch master --set-upstream-to origin/master
    git checkout -b develop origin/develop

Fetch files through composer

    composer install

### Is everything now as it should be?

#### Git status

    git status

Should tell you: Your branch is up-to-date with 'origin/master'

    git remote -v

Should show something like this:

    origin	git@github.com:XYZ/XYZ.git (fetch)
    origin	git@github.com:XYZ/XYZ.git (push)
    platform	XYZ@git.eu.platform.sh:XYZ.git (fetch)
    platform	XYZ@git.eu.platform.sh:XYZ.git (push)

#### Drupal status
- web/profiles/contrib should hold the itkore install profile
- web/modules/contrib should hold modules fetched by composer
- web/themes/contrib should hold modules fetched bu composer
- A web/core folder should be available

#### Site
 - An empty drupal 8 installation should be available @ http://grundsalg-web.vm

You should now have all required files for your drupal 8 setup with nothing to commit.


### DB setup
From document root run site setup (This will create a new drupal database for your local setup.)
    drush --yes site-install itkore --db-url='mysql://root:vagrant@localhost/grundsalg'

Fetch db and files from platform.sh
    drush pull-prod

## Pushing to platform.sh
To add your changes to platforms development site from origin/develop

    git push platform develop


