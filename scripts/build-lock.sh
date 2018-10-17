
which node
which git
dir=$(pwd)
cd ..
git clone --depth=1 -b v5 --single-branch https://github.com/shang-demo/server-template.git
templateDir=$(pwd)/server-template
ls -la
cd ${dir}
ls -la
TEMPLATE_DIR=${templateDir} node dist/generate-lock.js
ls -la dist/yarn-lock

cd dist
npm install
npm link