import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

/** One place for the published file names, so the packaged HTML and its
 *  offline checks can never drift apart again. */
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const projectRoot = path.resolve(root, '..');
export const offlineHtml = path.join(projectRoot, '纸环的两面.html');
export const sourcePdf = path.join(projectRoot, '纸环的两面.pdf');
export const offlineUrl = pathToFileURL(offlineHtml).href;
