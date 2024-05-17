#!/bin/bash

DEPLOY_SERVER=$DEPLOY_SERVER
SSH_USER=$SSH_USER

echo "Deploying to ${DEPLOY_SERVER}"
ssh ${SSH_USER}@${DEPLOY_SERVER} 'bash' < ./deploy/server.sh