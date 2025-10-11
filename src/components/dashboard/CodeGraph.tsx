import { useState, useEffect } from 'react';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';

const CodeGraph = () => {
  const [log, setLog] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchGitLog = async () => {
    try {
      const commits = await git.log({
        fs: {} as any, // git.log does not require fs with http
        http,
        dir: '.',
        depth: 10,
        corsProxy: 'http://localhost:8080'
      });
      setLog(commits);
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => {
    fetchGitLog();

    const ws = new WebSocket('ws://localhost:3001');

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'git-update') {
        fetchGitLog();
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Code Graph</h2>
      <div className="space-y-4">
        {log.map(commit => (
          <div key={commit.oid} className="border p-4 rounded-md">
            <p className="font-bold">{commit.commit.message}</p>
            <p>Author: {commit.commit.author.name}</p>
            <p>Date: {new Date(commit.commit.author.timestamp * 1000).toLocaleString()}</p>
            <p>Commit: {commit.oid}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CodeGraph;
