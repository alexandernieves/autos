import React, { useState, useEffect, useRef } from 'react';
import { Switch, View, Animated, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native'; 
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';  
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerContentComponentProps } from '@react-navigation/drawer';
import { FontAwesome, MaterialIcons, Entypo } from '@expo/vector-icons';
import styled from 'styled-components/native';
import Home from './Home'; 
import QRScreen from './QRScreen'; 
import InviteFriendsScreen from './InviteFriendsScreen'; 
import colors from '../colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next'; // Importar useTranslation

const Drawer = createDrawerNavigator();
type AdminScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Admin'>;

interface DecodedToken {
  id: number;
  email: string;
  name?: string;
  role: string;
  exp: number;
  iat: number;
}

function decodeJWT(token: string): DecodedToken | null {
  try {
    const base64Url = token.split('.')[1]; 
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); 
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decodificando el JWT", error);
    return null;
  }
}

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { t, i18n } = useTranslation(); // Usar el hook de traducción
  const [notificationsEnabled, setNotificationsEnabled] = useState(true); // Switch activado por defecto
  const [isLanguageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language === 'en' ? 'English' : 'Español'); // Setear idioma inicial según el idioma actual
  const navigation = useNavigation<AdminScreenNavigationProp>();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const heightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const getUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('jwtToken');
        if (token) {
          const decoded = decodeJWT(token);
          setUsername(decoded?.name || '');
          setEmail(decoded?.email || '');
        }
      } catch (error) {
        console.log('Error al obtener el token:', error);
      }
    };
    getUserData();
  }, [props]);

  // Función para desloguear al usuario
  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      
      if (token) {
        await fetch('https://api.cabreraapp.alexcode.org/cabrera/logout', {
          method: 'POST',
          headers: {
            Authorization: `${token}`,
          },
        });
        await AsyncStorage.removeItem('jwtToken');
        navigation.navigate('Login');
      }
    } catch (error) {
      console.log('Error al hacer logout:', error);
    }
  };

  const toggleLanguageMenu = () => {
    if (isLanguageMenuOpen) {
      Animated.timing(heightAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setLanguageMenuOpen(false));
    } else {
      setLanguageMenuOpen(true);
      Animated.timing(heightAnim, {
        toValue: 80,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const changeLanguage = (language: string) => {
    setSelectedLanguage(language); // Cambia el idioma seleccionado visualmente
    const langCode = language === 'English' ? 'en' : 'es';
    i18n.changeLanguage(langCode) // Cambia el idioma en i18next
      .then(() => console.log(`Idioma cambiado a ${langCode}`))
      .catch(err => console.error('Error al cambiar el idioma:', err));
  };
  
  
  return (
    <DrawerContentScrollView {...props}>
      <DrawerContentContainer>
        <View>
          <DrawerHeader>
            <AvatarIcon>
              <Ionicons name="person" size={40} color="#fff" />
            </AvatarIcon>
            <UserInfo>
              <UsernameText>{t('Hi')}, {username}</UsernameText>
              <EmailText>{email}</EmailText>
            </UserInfo>
          </DrawerHeader>

          <DrawerItemContainer> 
            <DrawerItemStyled onPress={() => props.navigation.navigate("QRScreen")}>
              <IconContainer>
                <FontAwesome name="qrcode" size={24} color={colors.primary} />
              </IconContainer>
              <DrawerLabel>{t('share_qr')}</DrawerLabel>
              <ArrowIcon name="chevron-right" size={24} color={colors.primary} />
            </DrawerItemStyled>

            <DrawerItemStyled>
              <IconContainer>
                <MaterialIcons name="notifications" size={24} color={colors.primary} />
              </IconContainer>
              <DrawerLabel>{t('Notifications')}</DrawerLabel>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#767577', true: colors.primary }} // Color del fondo cuando está activo/inactivo
                thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'} // Pulgar permanece blanco
                style={{ marginLeft: 'auto' }}
              />
            </DrawerItemStyled>

            <DrawerItemStyled onPress={toggleLanguageMenu}>
              <IconContainer>
                <FontAwesome name="globe" size={24} color={colors.primary} />
              </IconContainer>
              <DrawerLabel>{t('Language')}</DrawerLabel>
              <ArrowIcon name={isLanguageMenuOpen ? 'chevron-up' : 'chevron-down'} size={24} color={colors.primary} />
            </DrawerItemStyled>

            {isLanguageMenuOpen && (
              <Animated.View style={{ height: heightAnim, overflow: 'hidden', paddingLeft: 20 }}>
                <SubMenuItem onPress={() => changeLanguage('English')}>
                  <SubMenuLabel>English</SubMenuLabel>
                  {selectedLanguage === 'English' && <CheckIcon name="check" size={20} color={colors.primary} />}
                </SubMenuItem>
                <SubMenuItem onPress={() => changeLanguage('Español')}>
                  <SubMenuLabel>Español</SubMenuLabel>
                  {selectedLanguage === 'Español' && <CheckIcon name="check" size={20} color={colors.primary} />}
                </SubMenuItem>
              </Animated.View>
            )}

          </DrawerItemContainer>
        </View>

        <LogoutButtonContainer>
          <LogoutButton onPress={handleLogout}>
            <FontAwesome name="sign-out" size={24} color="#fff" />
            <LogoutButtonText>{t('Log_Out')}</LogoutButtonText>
          </LogoutButton>
        </LogoutButtonContainer>
      </DrawerContentContainer>
    </DrawerContentScrollView>
  );
}

export function CustomDrawerNavigator() {
  return (
    <Drawer.Navigator drawerContent={props => <CustomDrawerContent {...props} />}>
      <Drawer.Screen name="Home" component={Home} />
      <Drawer.Screen name="Profile" component={Home} />
      <Drawer.Screen name="Settings" component={Home} />
      <Drawer.Screen name="QRScreen" component={QRScreen} /> 
      <Drawer.Screen name="InviteFriendsScreen" component={InviteFriendsScreen} /> 
    </Drawer.Navigator>
  );
}


// Estilos personalizados
const DrawerContentContainer = styled.View`
  flex: 1;
  justify-content: space-between; /* Empuja el botón de logout hacia el fondo */
`;

const DrawerHeader = styled.View`
  padding: 20px;
  flex-direction: row;
  align-items: center;
  background-color: ${colors.lightGray};
`;

const AvatarIcon = styled.View`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background-color: ${colors.primary}; /* Azul de la empresa */
  justify-content: center;
  align-items: center;
  margin-right: 20px;
`;

const UserInfo = styled.View`
  flex-direction: column;
`;

const UsernameText = styled.Text`
  font-size: 18px;
  color: ${colors.primary};
  font-weight: bold;
`;

const EmailText = styled.Text`
  font-size: 14px;
  color: ${colors.gray};
`;

const DrawerItemContainer = styled.View`
  margin-top: 10px;
`;

const DrawerItemStyled = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 10px 20px;
  margin-bottom: 10px;
`;

const IconContainer = styled.View`
  width: 40px;
  height: 40px;
  background-color: #F0F0F0;
  border-radius: 10px;
  justify-content: center;
  align-items: center;
`;

const DrawerLabel = styled.Text`
  font-size: 16px;
  color: ${colors.primary};
  margin-left: 15px;
  flex: 1;
`;

const ArrowIcon = styled(Entypo)`
  margin-left: auto;
`;

const SubMenuItem = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 10px 0;
`;

const SubMenuLabel = styled.Text`
  font-size: 16px;
  color: ${colors.primary};
`;

const CheckIcon = styled(Entypo)`
  margin-left: auto;
  padding-right: 15px; /* Añadir margen a la derecha del check */
`;

const LogoutButtonContainer = styled.View`
  padding: 20px;
  background-color: transparent;
`;

const LogoutButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  background-color: #002368;
  padding: 15px;
  border-radius: 10px;
  margin-top: 100%;
  justify-content: center;
`;

const LogoutButtonText = styled.Text`
  color: #fff;
  font-size: 16px;
  margin-left: 10px;
`;

export default CustomDrawerContent;
