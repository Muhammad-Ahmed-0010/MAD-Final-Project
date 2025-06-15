import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Toaster } from 'sonner-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

// Screens
import HomeScreen from "./screens/HomeScreen";
import FinanceScreen from './screens/FinanceScreen';
import GroupScreen from './screens/GroupScreen';
import SavingsScreen from './screens/SavingsScreen';
import TipsScreen from './screens/TipsScreen';
import SettingsScreen from './screens/SettingsScreen';
import SplashScreen from './screens/SplashScreen';
import PINScreen from './screens/PINScreen';
import SetupPINScreen from './screens/SetupPINScreen';

// Context providers
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main tab navigator for the app's primary screens
function TabNavigator() {
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.tabBarBg,
          borderTopColor: theme.border,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.subtext,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'HomeTab') {
            iconName = 'home';
          } else if (route.name === 'FinanceTab') {
            iconName = 'dollar-sign'; // Update from 'money'
          } else if (route.name === 'GroupTab') {
            iconName = 'users';
          } else if (route.name === 'SavingsTab') {
            iconName = 'piggy-bank';
          } else if (route.name === 'TipsTab') {
            iconName = 'lightbulb'; // Drop '-o', use regular style
          } else if (route.name === 'SettingsTab') {
            iconName = 'cog';
          }
          
          return <FontAwesome5 name={iconName} size={size} color={color} solid />;
        },
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{ tabBarLabel: 'Home' }} 
      />
      <Tab.Screen 
        name="FinanceTab" 
        component={FinanceScreen} 
        options={{ tabBarLabel: 'Finance' }} 
      />
      <Tab.Screen 
        name="GroupTab" 
        component={GroupScreen} 
        options={{ tabBarLabel: 'Groups' }} 
      />
      <Tab.Screen 
        name="SavingsTab" 
        component={SavingsScreen} 
        options={{ tabBarLabel: 'Savings' }} 
      />
      <Tab.Screen 
        name="TipsTab" 
        component={TipsScreen} 
        options={{ tabBarLabel: 'Tips' }} 
      />
      <Tab.Screen 
        name="SettingsTab" 
        component={SettingsScreen} 
        options={{ tabBarLabel: 'Settings' }} 
      />
    </Tab.Navigator>
  );
}

// Root navigator that includes authentication flow and main app
function RootStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false
    }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="SetupPIN" component={SetupPINScreen} />
      <Stack.Screen name="PIN" component={PINScreen} />
      <Stack.Screen name="Main" component={TabNavigator} />
    </Stack.Navigator>
  );
}

// Wrap TabNavigator with ThemeProvider
function ThemedTabNavigator() {
  return (
    <ThemeProvider>
      <TabNavigator />
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider style={styles.container}>
      <ThemeProvider>
        <AuthProvider>
          <FinanceProvider>
            <Toaster />
            <NavigationContainer>
              <RootStack />
            </NavigationContainer>
          </FinanceProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    userSelect: "none"
  }
});