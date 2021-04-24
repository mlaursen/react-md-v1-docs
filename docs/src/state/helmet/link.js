
export const UPDATE_CUSTOM_THEME = 'UPDATE_CUSTOM_THEME';
export function updateCustomTheme(href) {
  return { type: UPDATE_CUSTOM_THEME, payload: { href } };
}

export const INITIAL_STATE = [{
  rel: 'stylesheet',
  href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons',
}, {
  rel: 'stylesheet',
  href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.6.3/css/font-awesome.min.css',
}];

const CUSTOM_THEME_ID = 'custom-theme-styles';
export const CUSTOM_THEME_LINK = { id: CUSTOM_THEME_ID, rel: 'stylesheet' };

export default function link(state = INITIAL_STATE, action) {
  switch (action.type) {
    default:
      return state;
  }
}
