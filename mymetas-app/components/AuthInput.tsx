import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface AuthInputProps extends TextInputProps {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
}

const AuthInput: React.FC<AuthInputProps> = ({ icon, ...props }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <FontAwesome name={icon} size={20} color={colors.textSecondary} style={styles.icon} />
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholderTextColor={colors.placeholder}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    height: 50,
  },
  icon: {
    padding: 10,
  },
  input: {
    flex: 1,
    paddingRight: 10,
    fontSize: 16,
  },
});

export default AuthInput;
