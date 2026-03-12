import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/colors';

export default function AppTextInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  editable = true,
  multiline,
  numberOfLines,
  error,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
  autoCapitalize = 'none',
  autoCorrect = false,
}) {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <TextInput
          style={[styles.input, multiline && styles.multilineInput, inputStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType || 'default'}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
        />
        {rightIcon && (
          <TouchableOpacity style={styles.rightIcon} onPress={onRightIconPress}>
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.md },
  label: {
    fontSize: FONTS.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: FONTS.base,
    color: COLORS.textPrimary,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: SPACING.md,
  },
  inputError: { borderColor: COLORS.danger },
  rightIcon: { padding: SPACING.xs },
  errorText: { color: COLORS.danger, fontSize: FONTS.xs, marginTop: 3 },
});
