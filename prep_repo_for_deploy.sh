#!/bin/bash
set -e
set -u

git checkout .

if ! git fetch
then
	chmod -R 755 *
	exit 1
fi

git rebase
chmod -R 755 *

