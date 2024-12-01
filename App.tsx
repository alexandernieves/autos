import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Login from './screens/Login';
import Signup from './screens/Signup';
import Welcome from './screens/Welcome';
import ForgotPassword from './screens/ViewReset/ForgotPassword';
import ResetPassword from './screens/ViewReset/ForgotPassword';
import ConfirmCode from './screens/ViewReset/ConfirmCode';
import Admin from './screens/Admin';
import Referrals from './screens/Referrals';
import ReferralForm from './screens/ReferralForm';
import Home from './screens/Home';
import Chat from './screens/Chat';
import InactiveUsersTable from './screens/InactiveUsersTable';
import QRScreen from './screens/QRScreen';
import InviteFriendsScreen from './screens/InviteFriendsScreen';
import ImagePreloader from './components/ImagePreloader';
import NoInternet from './screens/NoInternet';
import SuccessAnimation from './components/SuccessAnimation';
import PreloaderCircle from './components/PreloaderCircle';
import UserTable from './screens/UserTable';  // Importa el nuevo componente
import ActiveUsersTable from './screens/ActiveUsersTable';  // Importa el nuevo componente
import ReferralTable from './screens/ReferralTable';  // Importa el nuevo componente
import './i18n'; // Importar el archivo de configuración de i18next
import 'intl-pluralrules'; // Importar el polyfill para pluralización
import Setting from './screens/Setting';


import { CustomDrawerNavigator } from './screens/CustomDrawerNavigator';  // Asegúrate de importar el componente correctamente

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  InactiveUsersTable: undefined;
  ActiveUsersTable: undefined;
  ReferralTable:undefined;
  UserTable: undefined;
  Signup: undefined;
  InviteFriendsScreen: undefined;
  ForgotPassword: undefined;
  ResetPassword : undefined ;
  ConfirmCode: undefined;
  Admin: undefined;
  Home: undefined;
  Referrals: undefined;
  Chat: undefined;
  NoInternet: undefined;
  ReferralForm: undefined;
  Success: { nextScreen: string };
  QRScreen: undefined;  // <--- Añade esto si no está presente
  PreloaderCircle: { nextScreen: keyof RootStackParamList };
  SuccessAnimation: { nextScreen: keyof RootStackParamList };
  DrawerNavigator: undefined; // Asegúrate de que DrawerNavigator esté definido
  Setting: undefined; // <--- Añade esta línea

};

const Stack = createStackNavigator<RootStackParamList>();

function MainStackNavigator() {
  return (

<Stack.Navigator
  initialRouteName="Welcome"
  screenOptions={{
    headerShown: false, // Desactiva encabezados para todas las pantallas
    ...TransitionPresets.FadeFromBottomAndroid, // Transiciones
  }}
>

  

      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="InactiveUsersTable" component={InactiveUsersTable} />
      <Stack.Screen name="ActiveUsersTable" component={ActiveUsersTable} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="ReferralTable" component={ReferralTable} />
      <Stack.Screen name="UserTable" component={UserTable} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="ResetPassword" component={ForgotPassword} />
      <Stack.Screen name="ConfirmCode" component={ConfirmCode} />
      <Stack.Screen name="DrawerNavigator" component={CustomDrawerNavigator} />
      <Stack.Screen name="Admin" component={Admin} />
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Referrals" component={Referrals} />
      <Stack.Screen name="ReferralForm" component={ReferralForm} />
      <Stack.Screen name="Chat" component={Chat} />
      <Stack.Screen name="QRScreen" component={QRScreen} />
      <Stack.Screen name="InviteFriendsScreen" component={InviteFriendsScreen} />
      <Stack.Screen name="SuccessAnimation" component={SuccessAnimation} />
      <Stack.Screen name="PreloaderCircle" component={PreloaderCircle} />
      <Stack.Screen name="Setting" component={Setting} />

    </Stack.Navigator>
  );
}

export default function App() {
  const [isPreloading, setIsPreloading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = await AsyncStorage.getItem('jwtToken');
        await new Promise(resolve => setTimeout(resolve, 10000)); // Simula una espera de 3 segundos

        if (token) {
          // Verificar si el token es válido llamando al servidor
          const response = await axios.post('http://192.168.1.100:3000/verifyToken', { token });
          if (response.data.valid) {
            setIsAuthenticated(true); // El token es válido, el usuario sigue autenticado
          } else {
            await AsyncStorage.clear();
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false); // No hay token en AsyncStorage
        }
      } catch (error) {
        console.error('Error verificando la autenticación:', error);
        setIsAuthenticated(false);
      }
      setIsPreloading(false); // Termina el estado de precarga
    };

    checkAuthentication();
  }, []);




  return (
    <NavigationContainer>
      {isPreloading ? (
        <ImagePreloader onFinish={() => setIsPreloading(false)} />
      ) : !isConnected ? (
        <NoInternet onRetry={() => setIsPreloading(true)} />
      ) : (
        <MainStackNavigator />  // Asegúrate de usar siempre el Stack Navigator aquí
      )}
    </NavigationContainer>
  );
}
