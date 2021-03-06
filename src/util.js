import { spawn } from 'child_process';

function colorEcho(str, fg = 31, bg = 40, style = 1) {
  // FgBlack = "\x1b[30m"
  // FgRed = "\x1b[31m"
  // FgGreen = "\x1b[32m"
  // FgYellow = "\x1b[33m"
  // FgBlue = "\x1b[34m"
  // FgMagenta = "\x1b[35m"
  // FgCyan = "\x1b[36m"
  // FgWhite = "\x1b[37m"

  // BgBlack = "\x1b[40m"
  // BgRed = "\x1b[41m"
  // BgGreen = "\x1b[42m"
  // BgYellow = "\x1b[43m"
  // BgBlue = "\x1b[44m"
  // BgMagenta = "\x1b[45m"
  // BgCyan = "\x1b[46m"
  // BgWhite = "\x1b[47m"

  // Reset = "\x1b[0m"
  // Bright = "\x1b[1m"
  // Dim = "\x1b[2m"
  // Underscore = "\x1b[4m"
  // Blink = "\x1b[5m"
  // Reverse = "\x1b[7m"
  // Hidden = "\x1b[8m"

  // eslint-disable-next-line no-console
  console.log(`\x1b[${fg}m\x1b[${bg}m\x1b[${style}m${str}`);
}

async function exec(cmd, opt = {}) {
  console.info(cmd);
  return new Promise((resolve, reject) => {
    let child = spawn(
      cmd,
      Object.assign(
        {
          shell: true,
          stdio: 'inherit',
        },
        opt
      )
    );

    child.on('error', (err) => {
      reject(err);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      }
      reject(code);
    });
  });
}

export { colorEcho, exec };
export default { colorEcho, exec };
