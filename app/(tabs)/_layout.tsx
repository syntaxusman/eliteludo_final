import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(10,8,4,0.97)',
          borderTopColor: 'rgba(212,175,55,0.4)',
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
          elevation: 0,
        },
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.3)',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          href: '/home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: '/profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}