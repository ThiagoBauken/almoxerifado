import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';

// Screens (vamos criar depois)
import LoginScreen from './src/screens/Auth/LoginScreen';
import HomeScreen from './src/screens/Home/HomeScreen';
import ItemsListScreen from './src/screens/Items/ItemsListScreen';
import ItemDetailScreen from './src/screens/Items/ItemDetailScreen';
import QRScannerScreen from './src/screens/QR/QRScannerScreen';
import TransferSelectItemsScreen from './src/screens/Transfer/TransferSelectItemsScreen';
import TransferGenerateQRScreen from './src/screens/Transfer/TransferGenerateQRScreen';
import TransferReceiveScreen from './src/screens/Transfer/TransferReceiveScreen';
import HistoryScreen from './src/screens/History/HistoryScreen';
import ProfileScreen from './src/screens/Profile/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator (após login)
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#6B7280',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Início' }}
      />
      <Tab.Screen
        name="Items"
        component={ItemsListScreen}
        options={{ tabBarLabel: 'Itens' }}
      />
      <Tab.Screen
        name="QRScanner"
        component={QRScannerScreen}
        options={{ tabBarLabel: 'Scanner' }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ tabBarLabel: 'Histórico' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
        <Stack.Screen name="TransferSelectItems" component={TransferSelectItemsScreen} />
        <Stack.Screen name="TransferGenerateQR" component={TransferGenerateQRScreen} />
        <Stack.Screen name="TransferReceive" component={TransferReceiveScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
