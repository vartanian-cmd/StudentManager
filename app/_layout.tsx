import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StudentProvider } from '../contexts/StudentContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <StudentProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="student/[id]"
            options={{
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="student/new"
            options={{
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="student/edit/[id]"
            options={{
              presentation: 'modal',
            }}
          />
        </Stack>
      </StudentProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
