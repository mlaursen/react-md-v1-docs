import { combineReducers } from 'redux';

import helmet from './helmet';
import docgens from './docgens';
import search from './search';
import theme from './theme';
import media from './media';
import drawer from './drawer';
import messages from './messages';
import locale from './locale';
import quickNav from './quickNav';
import sassdocs from './sassdocs';
import sassdocFab from './sassdocFab';
import routing from './routing'; // until react-router-redux@5

export default combineReducers({
  docgens,
  helmet,
  locale,
  theme,
  search,
  media,
  messages,
  drawer,
  quickNav,
  sassdocs,
  sassdocFab,
  routing,
});
