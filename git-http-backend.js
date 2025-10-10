const http = require('http');
const git = require('isomorphic-git');
const httpBackend = require('isomorphic-git/http/node');

const dir = '.';

const server = http.createServer((req, res) => {
  req.url = req.url.replace('/git-http-backend', '');
  const backend = httpBackend(req, res);
  git.http(backend, { dir });
});

server.listen(3001, () => {
  console.log('Git HTTP backend listening on port 3001');
});