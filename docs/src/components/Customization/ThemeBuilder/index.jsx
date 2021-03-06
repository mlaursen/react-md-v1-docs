import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connectAdvanced } from 'react-redux';
import shallowEqual from 'shallowequal';
import Helmet from 'react-helmet';
import { Grid, Cell } from 'react-md';

import { updateTheme, clearTheme } from 'state/theme';
import Markdown from 'components/Markdown';
import withMinHeight from 'components/hoc/withMinHeight';

import './_styles.scss';
import Preview from './Preview';
import Configuration from './Configuration';

/* eslint-disable */
const ABOUT_LIVE_PREVIEW = `
# Live Preview has been disabled

## Since this documentation site no longer uses a custom server, the live preview behavior will no longer work. Please check out the [latest react-md Theme Builder](https://react-md.dev/colors-and-theming/theme-builder) instead.
`;

const ABOUT_THEME_BUILDER = `
### Custom CSS Theme Builder

Select a primary color, a secondary color, the secondary color's hue, and optionally toggle the light theme
to view a specific theme. When you have selected colors you like, either reference [Using with Sass](#using-with-sass)
or [pre-compiled themes](#pre-compiled-themes). Not all themes will already be compiled and hosted on \`unpkg\`.
`;

export class PureThemeBuilder extends PureComponent {
  static propTypes = {
    style: PropTypes.object,
    primary: PropTypes.string.isRequired,
    secondary: PropTypes.string.isRequired,
    hue: PropTypes.number.isRequired,
    light: PropTypes.bool.isRequired,
    saved: PropTypes.bool.isRequired,
    saveDisabled: PropTypes.bool.isRequired,
    href: PropTypes.string,
    filteredPrimaries: PropTypes.arrayOf(PropTypes.string).isRequired,
    filteredSecondaries: PropTypes.arrayOf(PropTypes.string).isRequired,
    clearTheme: PropTypes.func.isRequired,
    updateTheme: PropTypes.func.isRequired,
  };

  constructor(props) {
    super();

    this.state = this.getNextState(props);
  }

  componentWillReceiveProps(nextProps) {
    const { primary, secondary, hue } = this.props;
    if (primary !== nextProps.primary || secondary !== nextProps.secondary || hue !== nextProps.hue) {
      this.setState(this.getNextState(nextProps));
    }
  }

  componentWillUnmount() {
    if (!this.props.saved) {
      this.props.clearTheme();
    }
  }

  getNextState = ({ primary, secondary, hue }) => ({
    primaryColor: `$md-${primary}-500`,
    secondaryColor: `$md-${secondary}-a-${hue}`,
  });

  handleChange = (e) => {
    const { updateTheme } = this.props;
    const { value, checked, type } = e.target;
    let { id } = e.target;
    if (id === 'save-theme') {
      id = 'saved';
    }

    updateTheme(id, type === 'checkbox' ? checked : value);
  };

  handleSelectChange = (value, items, e, field) => {
    this.handleChange({ target: field });
  };

  render() {
    const { primaryColor, secondaryColor } = this.state;
    const { light, hue, style } = this.props;
    const { href, updateTheme, clearTheme, ...props } = this.props; // eslint-disable-line no-unused-vars
    let howToUse = `
#### Using with Sass

\`\`\`scss
@import '~react-md/src/scss/react-md';

$md-light-theme: ${light};${light ? ' // optional for light theme' : ''}
$md-primary-color: ${primaryColor};
$md-secondary-color: ${secondaryColor};

@include react-md-everything;

// Or for a subsection
@include react-md-theme-everything(${primaryColor}, ${secondaryColor}, $md-light-theme, 'custom-theme');
\`\`\`

#### Pre-compiled Themes
    `;

    if (hue === 400 && light) {
      howToUse = `${howToUse}
##### SCSS Import
\`\`\`scss
@import '~react-md/dist/${href}';
\`\`\`

##### CDN
\`\`\`html
<link rel="stylesheet" href="//unpkg.com/react-md/dist/${href}">
\`\`\`
`;
    } else {
      howToUse = `${howToUse}
This current theme is unavailable as a precomiled package. Only accents of \`400\` and the \`light-theme\` have been
precompiled.
`;
    }
    return (
      <Grid style={style}>
        <Helmet title="Theme Builder" />
        <Cell size={12} style={{ marginBottom: '5rem' }}>
          <Markdown markdown={ABOUT_LIVE_PREVIEW} />
        </Cell>
        <Configuration {...props} onChange={this.handleChange} onSelectChange={this.handleSelectChange} />
        <Cell component="section" size={8} desktopSize={6}>
          <Markdown markdown={ABOUT_THEME_BUILDER} className="md-text-container" />
          <Preview />
        </Cell>
        <Markdown markdown={howToUse} component={Cell} size={12} />
      </Grid>
    );
  }
}

const WithMinHeight = withMinHeight(PureThemeBuilder);

export default connectAdvanced((dispatch) => {
  let result;
  const actions = bindActionCreators({ updateTheme, clearTheme }, dispatch);
  return (state) => {
    const nextResult = { ...state.theme, ...actions };
    if (!shallowEqual(result, nextResult)) {
      result = nextResult;
    }

    return result;
  };
})(WithMinHeight);
