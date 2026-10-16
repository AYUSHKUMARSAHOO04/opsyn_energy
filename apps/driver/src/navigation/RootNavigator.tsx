import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DriverTripScreen } from '../screens/DriverTripScreen';
import { StopDetailsScreen } from '../screens/StopDetailsScreen';

const Stack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="DriverTrip"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#090D16' },
      }}
    >
      <Stack.Screen name="DriverTrip" component={DriverTripScreen} />
      <Stack.Screen name="StopDetails" component={StopDetailsScreen} />
    </Stack.Navigator>
  );
};
