import Fuse from 'fuse.js';
import { flattenDeep } from 'lodash';
import { put, throttle, call } from 'redux-saga/effects';
import { SEARCH_REQUEST, searchSuccess } from 'state/search';
import { toTitle } from 'utils/strings';
import { ROOT_PATH } from 'constants/application';
import definedRoutes from 'constants/navigationRoutes';

let indexer;

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

const DB_NAMES = ['proptypeLinks.json', 'sassdocLinks.json', 'examplesLinks.json'];

async function getIndexer() {
  if (indexer) {
    return indexer;
  }

  const baseRoutes = flattenDeep(definedRoutes.map(route => extractRealRoute(route))).filter(r => !!r);
  const searchRoutes = baseRoutes.map((route) => {
    let upgrade = false;
    let name = route.replace(/.*\/(components(\/helpers)?|customization|getting-started|discover-more)\//, '');
    if (name.match(/pickers|progress/)) {
      const [section, component] = name.split('/');
      name = `${component}-${section}`;
    } else if (name.match(/upgrade/)) {
      upgrade = true;
      const [, version] = name.split('/');
      name = `Upgrade to ${version}`;
    }

    return {
      type: route.indexOf('components') !== -1 ? 'Examples' : 'Info',
      name: upgrade ? name : toTitle(name),
      ref: route,
    };
  });

  const imports = await Promise.all(DB_NAMES.map(name => import(`databases/${name}`)));
  const database = flattenDeep(imports, searchRoutes);
  indexer = new Fuse(database, {
    keys: [{
      name: 'name',
      weight: 0.50,
    }, {
      name: 'type',
      weight: 0.35,
    }, {
      name: 'description',
      weight: 0.15,
    }],
  });
  return indexer;
}

async function search({ query, start }) {
  const indexer = await getIndexer();
  const results = indexer.search(query);

  return {
    meta: {
      next: null,
      previous: null,
    },
    data: results.slice(start, 10),
  };
}

export function* handleSearch(action) {
  const { query, start, href } = action.payload;
  if (!query && !href) {
    return;
  }

  const { meta, data } = yield call(search, { query, start, href });
  yield put(searchSuccess({ meta, data }));
}

export default function* watchSearches() {
  yield throttle(250, SEARCH_REQUEST, handleSearch);
}
