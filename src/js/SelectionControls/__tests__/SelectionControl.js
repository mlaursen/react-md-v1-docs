/* eslint-env jest */
/* eslint-disable max-len */
import React from 'react';
import { shallow, mount } from 'enzyme';
import { renderIntoDocument } from 'react-dom/test-utils';

import AccessibleFakeInkedButton from '../../Helpers/AccessibleFakeInkedButton';
import SelectionControl from '../SelectionControl';
import SwitchTrack from '../SwitchTrack';
import SwitchThumb from '../SwitchThumb';
import { ENTER, SPACE } from '../../constants/keyCodes';

jest.mock('../../Inks/InkContainer'); // can't calc left warning

const PROPS = {
  id: 'test-control',
  name: 'testing',
  type: 'checkbox',
  label: 'Label',
};

function checkKeyHandling(props, keyCode) {
  const onChange = jest.fn();
  const control = mount(<SelectionControl {...props} onChange={onChange} />);

  // While testing, the input.click() doesn't do anything, so mock it in here
  let input = control.find('input').instance();
  input.click = () => onChange();

  let toggle = control.find(AccessibleFakeInkedButton);
  toggle.simulate('keyDown', { which: keyCode, keyCode });

  expect(onChange.mock.calls.length).toBe(1);

  control.setProps({ type: 'radio' });
  input = control.find('input').instance();
  input.click = () => onChange();
  toggle = control.find(AccessibleFakeInkedButton);
  toggle.simulate('keyDown', { which: keyCode, keyCode });
  expect(onChange.mock.calls.length).toBe(2);

  control.setProps({ type: 'switch' });
  input = control.find('input').instance();
  input.click = () => onChange();

  toggle = control.find(SwitchThumb);
  toggle.simulate('keyDown', { which: keyCode, keyCode });
  expect(onChange.mock.calls.length).toBe(3);
}

describe('SelectionControl', () => {
  it('should correctly apply styles and className', () => {
    const props = {
      ...PROPS,
      style: { background: 'red' },
      className: 'some-test-class-name',
    };

    const control = shallow(<SelectionControl {...props} />);
    expect(control.props().style).toBe(props.style);
    expect(control.hasClass(props.className)).toBe(true);
  });

  it('should correctly apply classes returned by className function', () => {
    const checkedClass = 'test-checked';
    const uncheckedClass = 'test-unchecked';
    const props = {
      ...PROPS,
      className: (propSet) => (propSet.checked ? checkedClass : uncheckedClass),
      labelClassName: 'test-label-class',
      labelTextClassName: (propSet, control) => `test-${control.props.label}`,
    };

    const control = shallow(<SelectionControl {...props} />);
    expect(control.hasClass('md-selection-control-container')).toBe(true);
    expect(control.hasClass(checkedClass)).toBe(false);
    expect(control.hasClass(uncheckedClass)).toBe(true);

    expect(control.find('label').hasClass(props.labelClassName)).toBe(true);
    expect(control.find(`#${props.id}-label`).hasClass(`test-${props.label}`)).toBe(true);

    control.setProps({ checked: true });
    expect(control.hasClass('md-selection-control-container')).toBe(true);
    expect(control.hasClass(checkedClass)).toBe(true);
    expect(control.hasClass(uncheckedClass)).toBe(false);
  });

  it('renders an input tag with the correct props', () => {
    const props = { ...PROPS, value: 'hello!', inputClassName: 'test-input-class' };
    const control = mount(<SelectionControl {...props} />);
    let input = control.find('input');
    expect(input.length).toBe(1);
    expect(input.hasClass('md-selection-control-input')).toBe(true);
    expect(input.hasClass(props.inputClassName)).toBe(true);
    input = input.instance();
    expect(input.id).toBe(props.id);
    expect(input.type).toBe(props.type);
    expect(input.name).toBe(props.name);
    expect(input.checked).toBe(false);
    expect(input.value).toBe(props.value);
    expect(input.getAttribute('aria-hidden')).toBe('true');
  });

  it('should render the SwitchTrack component when the type is switch', () => {
    const control = shallow(<SelectionControl {...PROPS} />);
    expect(control.find(SwitchTrack).length).toBe(0);

    control.setProps({ type: 'switch' });
    expect(control.find(SwitchTrack).length).toBe(1);
  });

  it('should render the md-selection-control-toggle when the component type is not switch', () => {
    const control = shallow(<SelectionControl {...PROPS} />);
    expect(control.find('.md-selection-control-toggle').length).toBe(1);
    control.setProps({ type: 'radio' });
    expect(control.find('.md-selection-control-toggle').length).toBe(1);

    control.setProps({ type: 'switch' });
    expect(control.find('.md-selection-control-toggle').length).toBe(0);
  });

  it('should correctly trigger the change event when the spacebar key is pressed while focusing the toggle by clicking the input', () => {
    checkKeyHandling(PROPS, SPACE);
  });

  it('should correctly trigger the change event when the enter key is pressed while focusing the toggle by clicking the input', () => {
    checkKeyHandling({ ...PROPS, changeOnEnter: true }, ENTER);
  });

  it('should call the onChange prop with the correct values', () => {
    const onChange = jest.fn();
    const props = { ...PROPS, value: 'value', onChange, checked: false };
    const control = mount(<SelectionControl {...props} />);

    const event = { shiftKey: false };
    control.find('input').simulate('change', event);
    expect(onChange).toBeCalledWith(true, expect.objectContaining(event));
    onChange.mockClear();

    control.setProps({ type: 'switch' });
    control.find('input').simulate('change', event);
    expect(onChange).toBeCalledWith(true, expect.objectContaining(event));

    onChange.mockClear();
    control.setProps({ type: 'radio' });
    control.find('input').simulate('change', event);
    expect(onChange).toBeCalledWith(props.value, expect.objectContaining(event));
  });

  it('can get the checked value from a ref', () => {
    let _control = null;
    const props = { ...PROPS, ref: c => { _control = c; } };
    let control = renderIntoDocument(<SelectionControl {...props} />);
    expect(_control).not.toBe(null);
    expect(_control.checked).toBe(false);
    expect(control.checked).toBe(false);

    control.setState({ checked: true });
    expect(control.checked).toBe(true);
    expect(_control.checked).toBe(true);

    _control = null;
    props.checked = true;
    control = renderIntoDocument(<SelectionControl {...props} />);
    expect(_control).not.toBe(null);
    expect(_control.checked).toBe(true);
    expect(control.checked).toBe(true);
  });
});
