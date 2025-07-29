import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface AuthInputProps extends TextInputProps {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
}

const AuthInput: React.FC<AuthInputProps> = ({ icon, ...props }) => {
  return (
    <View style={styles.container}>
      <FontAwesome name={icon} size={20} color="#888" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholderTextColor="#888"
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#ddd',
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
    color: '#333',
  },
});

export default AuthInput;