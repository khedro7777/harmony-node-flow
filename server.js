const { exec } = require('child_process');

exec('node git-http-backend.bundle.js', (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stdout);
});