#!/bin/bash
# exit on any error
set -e

tar_name=react-md.tar.bz2
# ssh_alias=mlaursen
# server_location=/var/www/react-md/master
ssh_alias=react-md
server_location="~/react-md-v1"

yarn && yarn build

cd docs
# yarn && PUBLIC_URL="https://react-md.mlaursen.com" yarn build
yarn && ROOT_PATH="/v1/" yarn build

cd ..
rm -f "$tar_name"
tar --exclude='docs/src/server/databases/.gitkeep' \
  --exclude='docs/src/server/databases/airQuality.json' \
  --exclude='docs/public/.DS_STORE' \
  --exclude='docs/public/robots.txt' \
  --exclude='docs/public/favicon.ico' \
  --exclude='docs/public/react-md.png' \
  -jcf "$tar_name" \
    lib \
    docs/dist \
    docs/public \
    docs/src/constants/scssColors.js \
    docs/src/server/databases \
    docs/webpack-assets.json

rm_assets="rm -rf public/sassdoc dist && find public ! -name 'robots.txt' ! -name 'react-md.png' ! -name 'favicon.ico' ! -path '**/themes/**' -type f -exec rm -f {} +"

ssh "$ssh_alias" "cd $server_location && git pull && yarn && rm -rf lib && cd docs && $rm_assets && yarn --production"
scp "$tar_name" "$ssh_alias":"$server_location"

# ssh "$ssh_alias" "cd $server_location && tar jxvf $tar_name && git clean -f && cd .. && pm2 start processes.yml"
ssh "$ssh_alias" "cd $server_location && tar jxf $tar_name && git clean -f && cd .. && pm2 restart react-md@v1"
