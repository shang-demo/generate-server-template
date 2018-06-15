
which node
which git
dir=$(pwd)
cd ..
git clone --depth=1 -b v4 --single-branch https://github.com/shang-demo/server-template.git
sudo echo "{\"templateDir\":\"${dir}/server-template\"}" > /var/local/.generate-server-template.json
sudo cat /var/local/.generate-server-template.json
pwd
ls -la
cd ${dir}
ls -la
node dist/generate-lock.js
ls -la dist/yarn-lock

cd dist
npm install
npm link