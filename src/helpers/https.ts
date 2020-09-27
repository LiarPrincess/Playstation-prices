import { URL } from 'url';
import { get as nodeGet } from 'https';

export function get(url: string | URL) {
  return new Promise((resolve, reject) => {
    nodeGet(url, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (data) => { body += data; });
      res.on('end', () => resolve(body));
    }).on('error', (err) => reject(err));
  });
}
