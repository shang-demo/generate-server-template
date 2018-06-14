import rp from 'request-promise';
import { exec } from 'shelljs';

async function parseNpmName(name) {
  let result = await exec(`yarnpkg info ${name} --json`);
  let info = JSON.parse(result);

  if (info.error) {
    throw new Error(info.data);
  }

  return info.data.name;
}

async function parseGitName(name) {
  let arr = name.split(/#/);
  let url = `https://raw.githubusercontent.com/${arr[0]}/${arr[1] || 'master'}/package.json`;
  let body = await rp({ url });

  let info = JSON.parse(body);

  return info.name;
}

async function parseName(name) {
  if (/^@/.test(name)) {
    return parseNpmName(name);
  }
  else if (/\//.test(name)) {
    return parseGitName(name);
  }

  return parseNpmName(name);
}

export { parseGitName, parseNpmName, parseName };
export default { parseGitName, parseNpmName, parseName };
