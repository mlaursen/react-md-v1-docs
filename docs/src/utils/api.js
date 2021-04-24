import { get } from 'lodash';
import { API_ENDPOINT, SEARCH_ENDPOINT } from 'constants/application';

/**
 * This is a simple wrapper to search for prop types, SassDoc, or components
 * on the documentation website.
 *
 * @param {Object} searchParams - An object for the search params.
 * @param {String=} searchParams.href - An optional href to search for. This is usually
 *    set when querying the next result list.
 * @param {String=} searchParams.query - The query string to be searched for.
 * @param {number=} searchParams.start - The optional start index to search from.
 * @param {String=''} server - the server to query from.
 * @return {Promise} a promise to the fetch api call.
 */
export function search({ href, query, start }, server = '') {
  const endpoint = href || `${server}${API_ENDPOINT}${SEARCH_ENDPOINT}?q=${encodeURIComponent(query)}&start=${start}`;
  return fetch(endpoint);
}

/**
 * Gets docgen from a specific endpoint.
 *
 * @param {String} endpoint - The endpoint to query for.
 * @param {String=''} server - An optional server to query from.
 * @return {Promise} a promise to the fetch api call.
 */
export async function fetchDocgen(endpoint) {
  const docgen = await import('databases/docgens.json');
  return get(docgen, endpoint.replace(/\//g, '.'));
}

/**
 * Gets SassDoc from a specific endpoint.
 *
 * @param {String} endpoint - The endpoint to query for.
 * @param {String=''} server - An optional server to query from.
 * @return {Promise} a promise to the fetch api call.
 */
export async function fetchSassdoc(endpoint) {
  const sassdocs = await import('databases/sassdocs.json');
  return get(sassdocs, endpoint.replace(/^.+\//g, ''));
}
