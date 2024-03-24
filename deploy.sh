#!/bin/bash

cd /home/btm/nanocraft
# git pull with specific ssh key
GIT_SSH_COMMAND="ssh -i ~/.ssh/id_rsa_bot" git pull
yarn install
yarn build
pm2 restart nanocraft
