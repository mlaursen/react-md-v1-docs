import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Media, Card, CardTitle } from 'react-md';

import { ROOT_PATH } from 'constants/application';

const SVGCard = ({ src, alt, title, to, ...props }) => (
  <Card {...props} component={Link} to={`${ROOT_PATH}${to}`}>
    <CardTitle title={title} />
    <Media aspectRatio="1-1">
      <img src={src} alt={alt} />
    </Media>
  </Card>
);

SVGCard.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
};

export default SVGCard;
