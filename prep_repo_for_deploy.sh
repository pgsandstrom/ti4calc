#!/bin/bash
set -e
set -u

HASH1=$(sha1sum do_complete_deploy.sh)
HASH2=$(sha1sum prep_repo_for_deploy.sh)

git checkout .

if ! git fetch
then
	chmod -R 755 *
	exit 1
fi

git rebase
chmod -R 755 *


HASH1_NEW=$(sha1sum do_complete_deploy.sh)
HASH2_NEW=$(sha1sum prep_repo_for_deploy.sh)

if [ "$HASH1" != "$HASH1_NEW" ] || [ "$HASH2" != "$HASH2_NEW" ]
then
	echo "$HASH1"
	echo "$HASH1_NEW"
	echo "$HASH2" 
	echo "$HASH2_NEW"
	echo "WARNING!"
	echo "Deploy script has changed! Exiting."
	echo "It should be enough to just do the deploy again. Then the new deploy scripts should be used."
	exit 1
fi