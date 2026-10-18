import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

/** One place for the published file names, so the packaged HTML and its
 *  offline checks can never drift apart again. */
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const projectRoot = path.resolve(root, '..');
export const offlineHtml = path.join(projectRoot, '纸环的两面.html');
export const sourcePdf = path.join(projectRoot, '纸环的两面.pdf');
export const offlineUrl = pathToFileURL(offlineHtml).href;

/** The browser checks drive the exhibition directly; the envelope gate needs a
 *  real click, so they bypass it and `qa-browser` tests it separately. */
export const devUrl = 'http://127.0.0.1:4173/';
export const devUrlNoGate = `${devUrl}?nogate=1`;
export const offlineUrlNoGate = `${offlineUrl}?nogate=1`;
