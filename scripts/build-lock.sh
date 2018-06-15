
which node
which git
dir=$(pwd)
cd ..
git clone --depth=1 -b v4 --single-branch https://github.com/shang-demo/server-template.git
pwd
ls -la
cd ${dir}
ls -la
node dist/generate-lock.js
ls -la dist/yarn-lock