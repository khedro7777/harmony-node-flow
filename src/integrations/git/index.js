import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'fs';
import { broadcast } from '../web-socket.js';

export default async function handler(req, res) {
  const { method, url } = req;

  try {
    await git.serve({
      fs,
      http,
      dir: '.git',
      req,
      res,
      onPostReceive: async () => {
        broadcast({ type: 'git-update' });
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
