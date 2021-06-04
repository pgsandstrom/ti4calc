#!/bin/bash
set -e
set -u

cd "$(dirname "$0")"

./prep_repo_for_deploy.sh

npm install --only=prod

npm run build

mkdir -p /apps/ti4calc

# currently we copy the whole project into the prod folder
# TODO find out exactly which parts are required, and only copy in those
rsync -a . /apps/ti4calc

# find a neat solution to not only restart pm2, but to add if it is not already there
pm2 restart ti4calc
