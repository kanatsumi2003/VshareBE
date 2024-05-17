# Pull code
sudo -s
cd /data/vshare/api/
git checkout develop
git checkout -- .
git pull origin develop

# Build and deploy
npm install
npm run migrate
pm2 reload "vshare api"