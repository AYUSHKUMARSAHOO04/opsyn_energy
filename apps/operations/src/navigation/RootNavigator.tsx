import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OperationsCommandScreen } from '../screens/OperationsCommandScreen';
import { OperationalIssueDetailScreen } from '../screens/OperationalIssueDetailScreen';

const Stack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="OperationsCommand"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#090D16' },
      }}
    >
      <Stack.Screen name="OperationsCommand" component={OperationsCommandScreen} />
      <Stack.Screen name="OperationalIssueDetail" component={OperationalIssueDetailScreen} />
    </Stack.Navigator>
  );
};
