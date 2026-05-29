/**
 * InputBox.js  ─  Universal Input Component
 *
 * Supported types / variants:
 *   text | email | password | number | phone | otp | search |
 *   multiline | url | username
 *
 * Features:
 *  • Password: show/hide toggle eye icon
 *  • Left icon support (any MaterialIcons name)
 *  • Right icon / clear button
 *  • Error / success / disabled states
 *  • allowFontScaling={false} on all inner Text
 *  • Fully responsive via Scale utilities
 *  • Floating label animation on focus
 *
 * Usage:
 *   <InputBox type="email" label="Email" value={val} onChangeText={setVal} />
 *   <InputBox type="password" label="Password" />
 *   <InputBox type="number" label="Amount" />
 *   <InputBox type="otp" maxLength={6} />
 */

import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CText from './CText';
import Colors from './Colors';
import { ms, vs, normFont } from './Scale';

// ─── Type → keyboard / autoComplete config map ───────────────────────────────
const TYPE_CONFIG = {
  text:      { keyboardType: 'default',       autoComplete: 'off',               autoCapitalize: 'sentences' },
  email:     { keyboardType: 'email-address', autoComplete: 'email',             autoCapitalize: 'none' },
  password:  { keyboardType: 'default',       autoComplete: 'password',          autoCapitalize: 'none',  secureEntry: true },
  number:    { keyboardType: 'number-pad',    autoComplete: 'off',               autoCapitalize: 'none' },
  phone:     { keyboardType: 'phone-pad',     autoComplete: 'tel',               autoCapitalize: 'none' },
  otp:       { keyboardType: 'number-pad',    autoComplete: 'one-time-code',     autoCapitalize: 'none' },
  search:    { keyboardType: 'default',       autoComplete: 'off',               autoCapitalize: 'none' },
  multiline: { keyboardType: 'default',       autoComplete: 'off',               autoCapitalize: 'sentences', multiline: true },
  url:       { keyboardType: 'url',           autoComplete: 'url',               autoCapitalize: 'none' },
  username:  { keyboardType: 'default',       autoComplete: 'username',          autoCapitalize: 'none' },
};

// ─── Default left icon per type ───────────────────────────────────────────────
const DEFAULT_ICON = {
  text:      'edit',
  email:     'email',
  password:  'lock',
  number:    'tag',
  phone:     'phone',
  otp:       'dialpad',
  search:    'search',
  multiline: 'notes',
  url:       'link',
  username:  'person',
};

const InputBox = React.forwardRef(({
  type = 'text',
  label,
  value,
  onChangeText,
  placeholder,
  errorMsg,
  successMsg,
  disabled = false,
  leftIcon,          // MaterialIcons name override
  hideLeftIcon = false,
  rightIcon,         // extra right icon name (besides password-eye / clear)
  onRightIconPress,
  showClear = false, // show × when text is present
  maxLength,
  countryCode,       // string, e.g. '+91'
  onCountryCodePress, // callback for country code picker
  containerStyle,
  inputStyle,
  onFocus,
  onBlur,
  returnKeyType = 'done',
  onSubmitEditing,
  ...rest
}, ref) => {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.text;
  const [secure, setSecure] = useState(!!config.secureEntry);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  // ─── State helpers ─────────────────────────────────────────────────────────
  const hasError   = !!errorMsg;
  const hasSuccess = !!successMsg && !hasError;
  const isEmpty    = !value || value.length === 0;

  const borderColor = disabled
    ? Colors.border
    : hasError
    ? Colors.error
    : hasSuccess
    ? Colors.success
    : focused
    ? Colors.primary
    : Colors.border;

  const bgColor = disabled
    ? Colors.surface
    : Colors.white;

  // ─── Icons ─────────────────────────────────────────────────────────────────
  const iconName   = leftIcon ?? DEFAULT_ICON[type] ?? 'edit';
  const iconColor  = focused ? Colors.primary : Colors.gray500;

  const handleFocus = (e) => { setFocused(true);  onFocus?.(e); };
  const handleBlur  = (e) => { setFocused(false); onBlur?.(e);  };

  const handleClear = () => { onChangeText?.(''); inputRef.current?.focus(); };

  return (
    <View style={[styles.wrapper, containerStyle]}>

      {/* Label */}
      {label ? (
        <CText variant="label" weight="semibold" color={Colors.textSecondary} style={styles.label}>
          {label}
        </CText>
      ) : null}

      {/* Input row */}
      <View
        style={[
          styles.inputRow,
          { borderColor, backgroundColor: bgColor },
          config.multiline ? styles.inputRowMultiline : styles.inputRowSingle,
          focused && styles.inputRowFocused,
          disabled && styles.inputRowDisabled,
        ]}
      >
        {/* Left icon */}
        {!hideLeftIcon && !countryCode && (
          <MaterialIcons name={iconName} size={ms(20)} color={iconColor} style={styles.leftIcon} />
        )}

        {/* Country Code Selector (Phone Input) */}
        {countryCode && (
          <View style={styles.countryCodeContainer}>
            <View style={[styles.countryCodeButton, { paddingRight: ms(8) }]}>
              <CText variant="body" weight="semibold" color={Colors.textPrimary}>
                {countryCode}
              </CText>
            </View>
            <View style={styles.verticalDivider} />
          </View>
        )}

        {/* TextInput */}
        <TextInput
          ref={ref ?? inputRef}
          style={[styles.input, config.multiline && styles.multilineInput, inputStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder ?? label ?? ''}
          placeholderTextColor={Colors.placeholder}
          keyboardType={config.keyboardType}
          autoComplete={config.autoComplete}
          autoCapitalize={config.autoCapitalize ?? 'none'}
          secureTextEntry={secure}
          editable={!disabled}
          multiline={!!config.multiline}
          numberOfLines={config.multiline ? 4 : 1}
          textAlignVertical={config.multiline ? 'top' : 'center'}
          maxLength={maxLength}
          returnKeyType={config.multiline ? 'default' : returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={handleFocus}
          onBlur={handleBlur}
          allowFontScaling={false}
          selectionColor={Colors.primary}
          {...rest}
        />

        {/* Right actions */}
        <View style={styles.rightArea}>
          {/* Clear button */}
          {showClear && !isEmpty && !config.secureEntry && (
            <TouchableOpacity onPress={handleClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialIcons name="cancel" size={ms(18)} color={Colors.gray400} />
            </TouchableOpacity>
          )}

          {/* Password eye */}
          {config.secureEntry && (
            <TouchableOpacity
              onPress={() => setSecure((s) => !s)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialIcons
                name={secure ? 'visibility-off' : 'visibility'}
                size={ms(20)}
                color={Colors.gray500}
              />
            </TouchableOpacity>
          )}

          {/* Custom right icon */}
          {rightIcon && !config.secureEntry && (
            <TouchableOpacity onPress={onRightIconPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialIcons name={rightIcon} size={ms(20)} color={Colors.gray500} />
            </TouchableOpacity>
          )}

          {/* Status icon */}
          {hasError   && <MaterialIcons name="error-outline"        size={ms(18)} color={Colors.error}   />}
          {hasSuccess && <MaterialIcons name="check-circle-outline" size={ms(18)} color={Colors.success} />}
        </View>
      </View>

      {/* Helper text & Character Counter Row */}
      <View style={styles.footerRow}>
        <View style={styles.helperContainer}>
          {hasError   && <CText variant="caption" color={Colors.error}   style={styles.helper}>{errorMsg}</CText>}
          {hasSuccess && <CText variant="caption" color={Colors.success} style={styles.helper}>{successMsg}</CText>}
        </View>
        {config.multiline && maxLength && (
          <CText variant="caption" color={Colors.textMuted} style={styles.counter}>
            {`${value ? value.length : 0}/${maxLength}`}
          </CText>
        )}
      </View>

    </View>
  );
});

// ─── OTP / Verification Code Group Input Component ───────────────────────────
export const OTPGroupInput = ({
  length = 6,
  value = '',
  onChangeText,
  disabled = false,
  errorMsg,
  containerStyle,
}) => {
  const inputsRef = useRef([]);
  const codeArray = (value || '').split('');

  const handleChange = (text, index) => {
    const newCode = [...codeArray];
    // Keep only the last character entered
    newCode[index] = text.slice(-1);
    const newCodeString = newCode.join('');
    onChangeText?.(newCodeString);

    // Auto focus next box if we typed something
    if (text && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!codeArray[index] && index > 0) {
        // Clear previous cell and focus it
        const newCode = [...codeArray];
        newCode[index - 1] = '';
        onChangeText?.(newCode.join(''));
        inputsRef.current[index - 1]?.focus();
      }
    }
  };

  const [focusedIndex, setFocusedIndex] = useState(-1);

  return (
    <View style={[otpStyles.wrapper, containerStyle]}>
      <View style={otpStyles.row}>
        {Array.from({ length }).map((_, index) => {
          const char = codeArray[index] || '';
          const isFocused = focusedIndex === index;
          const hasError = !!errorMsg;

          const boxBorderColor = disabled
            ? Colors.border
            : hasError
            ? Colors.error
            : isFocused
            ? Colors.primary
            : Colors.border;

          const boxBgColor = disabled
            ? Colors.surface
            : Colors.white;

          return (
            <TextInput
              key={index}
              ref={(ref) => (inputsRef.current[index] = ref)}
              style={[
                otpStyles.box,
                {
                  borderColor: boxBorderColor,
                  backgroundColor: boxBgColor,
                },
                isFocused && otpStyles.boxFocused,
                disabled && otpStyles.boxDisabled,
              ]}
              value={char}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(-1)}
              keyboardType="number-pad"
              maxLength={2}
              selectTextOnFocus
              editable={!disabled}
              allowFontScaling={false}
              textAlign="center"
              selectionColor={Colors.primary}
            />
          );
        })}
      </View>
      {errorMsg ? (
        <CText variant="caption" color={Colors.error} style={otpStyles.helper}>
          {errorMsg}
        </CText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: vs(16),
  },
  label: {
    marginBottom: vs(5),
    marginLeft: ms(2),
  },
  inputRow: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderRadius: ms(12),
    paddingHorizontal: ms(14),
    backgroundColor: Colors.white,
  },
  inputRowSingle: {
    alignItems: 'center',
    minHeight: vs(58),
  },
  inputRowMultiline: {
    alignItems: 'flex-start',
    paddingTop: vs(4),
  },
  inputRowFocused: {},
  inputRowDisabled: {
    opacity: 0.6,
  },
  leftIcon: {
    marginRight: ms(10),
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: ms(2),
  },
  countryChevron: {
    marginLeft: ms(2),
  },
  verticalDivider: {
    width: 1.5,
    height: vs(22),
    backgroundColor: Colors.border,
    marginLeft: ms(8),
    marginRight: ms(12),
  },
  input: {
    flex: 1,
    fontSize: normFont(16),
    fontFamily: 'Poppins-Medium',
    color: Colors.textPrimary,
    paddingVertical: Platform.OS === 'ios' ? vs(12) : vs(8),
  },
  multilineInput: {
    minHeight: vs(100),
    paddingTop: vs(12),
  },
  rightArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(8),
    marginLeft: ms(8),
    paddingVertical: vs(10),
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: vs(4),
    paddingHorizontal: ms(4),
  },
  helperContainer: {
    flex: 1,
  },
  helper: {
    marginTop: 0,
  },
  counter: {
    marginLeft: ms(8),
  },
});

const otpStyles = StyleSheet.create({
  wrapper: {
    marginBottom: vs(16),
    alignSelf: 'stretch',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: ms(4),
  },
  box: {
    flex: 1,
    height: vs(58),
    borderWidth: 1.5,
    borderRadius: ms(12),
    fontSize: normFont(20),
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  boxFocused: {},
  boxDisabled: {
    opacity: 0.6,
  },
  helper: {
    marginTop: vs(6),
    alignSelf: 'center',
  },
});

export default InputBox;
