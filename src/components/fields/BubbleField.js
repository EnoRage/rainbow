import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '../../context/ThemeContext';
import { MiniButton } from '../buttons';
import { ExchangeInput } from '../exchange';
import { Column, Row } from '../layout';
import { useDimensions } from '@rainbow-me/hooks';

const BubbleInput = styled(ExchangeInput).attrs(
  ({ isSmallPhone, isTinyPhone, theme: { isDarkMode } }) => ({
    disableTabularNums: true,
    keyboardAppearance: isDarkMode ? 'dark' : 'light',
    letterSpacing: 'roundedTightest',
    lineHeight: android
      ? isTinyPhone
        ? 27
        : android || isSmallPhone
        ? 31
        : 38
      : undefined,
    size: isTinyPhone ? 'big' : isSmallPhone ? 'bigger' : 'h3',
    weight: 'semibold',
  })
)`
  ${({ isTinyPhone }) =>
    android ? (isTinyPhone ? 'height: 40' : 'height: 46;') : ''}}
  ${android ? 'padding-bottom: 0;' : ''}
  ${android ? 'padding-top: 0;' : ''}
  margin-right: 10;
`;

const defaultFormatter = string => string;

const BubbleField = (
  {
    autoFocus,
    buttonText,
    colorForAsset,
    format = defaultFormatter,
    keyboardType,
    mask,
    maxLabelColor,
    maxLength,
    onBlur,
    onChange,
    onFocus,
    onPressButton,
    placeholder,
    testID,
    value: valueProp,
    ...props
  },
  ref
) => {
  const { isSmallPhone, isTinyPhone } = useDimensions();

  const [isFocused, setIsFocused] = useState(autoFocus);
  const [value, setValue] = useState(valueProp);
  const [wasButtonPressed, setWasButtonPressed] = useState(false);

  const formattedValue = useMemo(() => format(String(value || '')), [
    format,
    value,
  ]);

  const handleBlur = useCallback(
    event => {
      setIsFocused(false);
      onBlur?.(event);
    },
    [onBlur]
  );

  const handleButtonPress = useCallback(
    event => {
      ref.current?.focus?.();
      setWasButtonPressed(true);
      onPressButton?.(event);
    },
    [onPressButton]
  );

  const handleChangeText = useCallback(
    text => {
      const formattedValue = format(text);

      if (value !== formattedValue) {
        setValue(formattedValue);
        onChange?.(formattedValue);
      }
    },
    [format, onChange, value]
  );

  const handleFocus = useCallback(
    event => {
      setIsFocused(true);
      onFocus?.(event);
    },
    [onFocus]
  );

  useEffect(() => {
    if (
      valueProp !== value &&
      (!ref.current?.isFocused?.() || wasButtonPressed)
    ) {
      setValue(valueProp);
      setWasButtonPressed(false);
    }
  }, [ref, value, valueProp, wasButtonPressed]);

  const { colors, isDarkMode } = useTheme();

  return (
    <Column flex={1} {...props}>
      <Row align="center" justify="space-between">
        <BubbleInput
          autoFocus={autoFocus}
          color={colorForAsset}
          isDarkMode={isDarkMode}
          isSmallPhone={android || isSmallPhone}
          isTinyPhone={isTinyPhone}
          keyboardType={keyboardType}
          mask={mask}
          maxLength={maxLength}
          onBlur={handleBlur}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          placeholder={placeholder}
          placeholderTextColor={
            maxLabelColor
              ? colors.alpha(colors.blueGreyDark, 0.32)
              : colors.alpha(colorForAsset, 0.4)
          }
          ref={ref}
          testID={testID + '-input'}
          value={formattedValue}
        />
        {buttonText && isFocused && (
          <MiniButton
            backgroundColor={
              maxLabelColor
                ? colors.alpha(colorForAsset, 0.048)
                : colors.alpha(colorForAsset, 0.06)
            }
            color={colorForAsset}
            letterSpacing="roundedMedium"
            onPress={handleButtonPress}
            small
            weight="heavy"
          >
            {buttonText}
          </MiniButton>
        )}
      </Row>
    </Column>
  );
};

export default React.forwardRef(BubbleField);
