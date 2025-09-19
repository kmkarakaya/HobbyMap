// Wrapper to suppress deprecation warnings for webpack-dev-server during development
// It sets process.noDeprecation = true and then runs react-scripts start

process.noDeprecation = true;

const { spawn } = require('child_process');
// Use shell:true so the command works across PowerShell/cmd on Windows
const command = 'npx react-scripts start';
// Inherit env and add NODE_OPTIONS to suppress deprecation warnings
const env = Object.assign({}, process.env, { NODE_OPTIONS: '--no-deprecation' });
const child = spawn(command, { stdio: 'inherit', shell: true, env });

child.on('close', (code) => {
  process.exit(code);
});

child.on('error', (err) => {
  console.error('Failed to start react-scripts:', err);
  process.exit(1);
});
