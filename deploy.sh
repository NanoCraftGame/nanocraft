#!/bin/bash
# exit on error
set -e

# cd /home/btm/nanocraft
# git pull with specific ssh key
echo "pulling from git..."
GIT_SSH_COMMAND="ssh -i ~/.ssh/id_rsa_bot" git pull
yarn install
yarn build
echo "restarting pm2..."
pm2 restart nanocraft
echo "restart nano-hook..."
pm2 restart nano-hook
echo "deployed successfully"

