import React, { useState, forwardRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';

const AuthInput = forwardRef(function AuthInput(
  {
    value,
    onChangeText,
    placeholder,
    isPassword   = false,
    keyboardType = 'default',
    returnKeyType = 'next',
    onSubmitEditing,
    hasError     = false,
    editable     = true,
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused]           = useState(false);

  return (
    <View style={[
      styles.container,
      focused    && styles.containerFocused,
      hasError   && styles.containerError,
      !editable  && styles.containerDisabled,
    ]}>
      <TextInput
        ref={ref}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        secureTextEntry={isPassword && !showPassword}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType={keyboardType}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        editable={editable}
      />
      {isPassword && (
        <TouchableOpacity
          onPress={() => setShowPassword(v => !v)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.eyeBtn}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={focused ? colors.blue : colors.textMuted}
          />
        </TouchableOpacity>
      )}
    </View>
  );
});

export default AuthInput;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 12,
  },
  containerFocused: {
    borderColor: colors.blue + '80',
    backgroundColor: colors.surface,
  },
  containerError: {
    borderColor: '#EF444480',
    backgroundColor: '#EF44440A',
  },
  containerDisabled: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '400',
  },
  eyeBtn: {
    paddingLeft: 8,
  },
});
