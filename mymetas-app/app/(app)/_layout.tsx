import { Stack } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function AppLayout() {
  const { toggleTheme, isDark, colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
      }}
    >
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen
        name="profile"
        options={{
          title: "Meu Perfil",
          headerRight: () => (
            <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 15 }}>
              <FontAwesome name={isDark ? "sun-o" : "moon-o"} size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}
