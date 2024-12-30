// pages/api/robots.txt.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'text/plain');
  res.write(`
    User-agent: *
    Disallow:

    Sitemap: https://orbits.miketsak.gr/sitemap.xml
  `);
  res.end();
}
