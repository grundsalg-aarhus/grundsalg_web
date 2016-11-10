# Grundsalg Aarhus web

## Currently runs on platform.sh
- For the local setup to work you need to have a user account on platform.sh and have it take part in the grundsalgweb project.

## Local setup

Fetch files from platform git.

    platform get [project_id] htdocs -y

Change git remote to track our github repo.

    git remote set-url origin git@github.com:grundsalg-aarhus/grundsalg_web.git
    git fetch origin
    git branch master --set-upstream-to origin/master

Fetch files through composer

    composer install

Sync DB