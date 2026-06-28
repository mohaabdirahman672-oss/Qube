import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen    from '../screens/HomeScreen';
import SavedScreen   from '../screens/SavedScreen';
import SolveScreen   from '../screens/SolveScreen';
import PracticeScreen from '../screens/PracticeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BottomNav     from '../components/BottomNav';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <BottomNav {...props} />}
      screenOptions={{ headerShown: false }}
      initialRouteName="home"
    >
      <Tab.Screen name="home"     component={HomeScreen}     />
      <Tab.Screen name="saved"    component={SavedScreen}    />
      <Tab.Screen name="scan"     component={SolveScreen}    />
      <Tab.Screen name="practice" component={PracticeScreen} />
      <Tab.Screen name="profile"  component={ProfileScreen}  />
    </Tab.Navigator>
  );
}
