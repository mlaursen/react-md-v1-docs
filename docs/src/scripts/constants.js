import path from 'path';
import { flattenDeep } from 'lodash/array';
import definedRoutes, {
  componentRoutes as definedComponentRoutes,
} from 'constants/navigationRoutes';
import { GITHUB_URL, ROOT_PATH } from 'constants/application';
import { Version } from 'react-md';

const REACT_MD_SRC = path.resolve(process.cwd(), '..', 'src');

export const REACT_MD_JS = path.join(REACT_MD_SRC, 'js');
export const REACT_MD_SCSS = path.join(REACT_MD_SRC, 'scss');
export const REACT_MD_PROP_TYPES = path.join(REACT_MD_JS, 'utils', 'PropTypes');

export const NESTED_GROUPS = ['helpers', 'pickers', 'progress'];

const DBS_PATH = path.join('src', 'databases');
export const JSDOC_DATABASE = path.join(DBS_PATH, 'jsdocs.json');
export const DOCGEN_DATABASE = path.join(DBS_PATH, 'docgens.json');
export const PROP_TYPE_DATABASE = path.join(DBS_PATH, 'proptypeLinks.json');
export const SASSDOC_DATABASE = path.join(DBS_PATH, 'sassdocs.json');
export const SASSDOC_LINKS_DATABASE = path.join(DBS_PATH, 'sassdocLinks.json');
export const EXAMPLES_LINKS_DATABASE = path.join(DBS_PATH, 'examplesLinks.json');

export const BASE_SOURCE_PATH = `${GITHUB_URL}/blob/v${Version}`;


function extractRealRoute(route, parents = []) {
  const prefix = `${ROOT_PATH}${parents.join('/')}${parents.length ? '/' : ''}`;
  if (typeof route === 'string') {
    return `${prefix}${route}`;
  }
  const { routes, to } = route;

  if (routes) {
    const newParents = parents.length ? [...parents, to] : [to];
    return routes.map(route => extractRealRoute(route, newParents));
  }

  return to;
}

export const baseRoutes = flattenDeep(definedRoutes.map(route => extractRealRoute(route))).filter(r => !!r);
export const componentRoutes = flattenDeep(definedComponentRoutes.map(route => extractRealRoute(route, ['components']))).filter(r => !!r);


export const routes = baseRoutes.slice();
routes.push(ROOT_PATH);
// add redirects
routes.push(
  `${ROOT_PATH}getting-started`,
  `${ROOT_PATH}customization`,
  `${ROOT_PATH}discover-more`,
  `${ROOT_PATH}components`,
);
