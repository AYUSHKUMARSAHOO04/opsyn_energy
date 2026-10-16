import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CustomerOrdersScreen } from '../screens/CustomerOrdersScreen';
import { OrderDetailsScreen } from '../screens/OrderDetailsScreen';

const Stack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="CustomerOrders"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#090D16' },
      }}
    >
      <Stack.Screen name="CustomerOrders" component={CustomerOrdersScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
    </Stack.Navigator>
  );
};
