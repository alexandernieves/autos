import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import colors from '../colors';
import { RootStackParamList } from '../App';  
import { StackNavigationProp } from '@react-navigation/stack';

// Tipo para la navegación
type AdminScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Admin'>;

interface DecodedToken {
  id: number;
  email: string;
  name?: string;
  role: string;
  exp: number;
  iat: number;
}

// Función para decodificar el JWT
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

const Profile: React.FC = () => {
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('User');
  const [email, setEmail] = useState('');
  const navigation = useNavigation<AdminScreenNavigationProp>();

  // Función para desloguear al usuario
  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      
      if (token) {
        // Hacer la solicitud al backend para actualizar is_active a 0
        await fetch('https://api.cabreraapp.alexcode.org/cabrera/logout', {
          method: 'POST',
          headers: {
            Authorization: `${token}`,
          },
        });

        // Borrar el token del almacenamiento local
        await AsyncStorage.removeItem('jwtToken');

        // Navegar a la pantalla de login
        navigation.navigate('Login');
      }
    } catch (error) {
      console.log('Error al hacer logout:', error);
    }
  };

  // Función para obtener el total de referidos desde el backend
  const fetchTotalReferrals = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) {
        Alert.alert('Error', 'No se encontró un token, por favor inicie sesión.');
        return;
      }

      const response = await fetch('https://api.cabreraapp.alexcode.org/cabrera/referrals/count', {
        headers: {
          Authorization: `${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setTotalReferrals(data.totalReferrals);
      } else if (data.message === "jwt expired") {
        Alert.alert('Error', 'La sesión ha expirado, por favor inicie sesión nuevamente.');
      } else {
        Alert.alert('Error', data.message || 'Error al obtener los referidos.');
      }
    } catch (error) {
      console.error('Error fetching total referrals:', error);
      Alert.alert('Error', 'Error al obtener los referidos.');
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener los datos del usuario desde el token
  const getUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (token) {
        const decoded = decodeJWT(token);
        setUsername(decoded?.name || 'User');
        setEmail(decoded?.email || '');
      }
    } catch (error) {
      console.error('Error al obtener el token:', error);
    }
  };

  useEffect(() => {
    fetchTotalReferrals(); // Obtener los referidos
    getUserData(); // Obtener el nombre y el email
  }, []);

  return (
    <Container>
      <Header />
      <ProfileInfo>
        <AvatarContainer>
          {/* Icono de persona con fondo azul */}
          <AvatarBackground>
            <Ionicons name="person" size={60} color="#0A3068" />
          </AvatarBackground>
        </AvatarContainer>
        <ProfileName>{username}</ProfileName>
        <ProfileEmail>{email}</ProfileEmail>
      </ProfileInfo>

      <StatsContainer>
        <ReferralsCount>
          <Ionicons name="people" size={40} color={colors.primary} />
          {loading ? (
            <CountText>Cargando...</CountText>
          ) : (
            <CountText>{totalReferrals}</CountText>
          )}
          <LabelText>Total Referrals</LabelText>
        </ReferralsCount>
      </StatsContainer>

      <MenuOptions>
        <MenuOption onPress={handleLogout}>
          <MenuIconContainer>
            <Ionicons name="log-out" size={20} color={colors.primary} />
          </MenuIconContainer>
          <MenuText>Log Out</MenuText>
          <ArrowIcon>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </ArrowIcon>
        </MenuOption>
      </MenuOptions>
    </Container>
  );
};

export default Profile;

// Estilos personalizados
const Container = styled.View`
  flex: 1;
  background-color: #fff;
  align-items: center;
`;

const Header = styled.View`
  width: 100%;
  height: 100px;
  background-color: ${colors.primary};
  justify-content: center;
  align-items: flex-end;
  padding-right: 20px;
`;

const ProfileInfo = styled.View`
  align-items: center;
  margin-top: -50px;
`;

const AvatarContainer = styled.View`
  width: 100px;
  height: 100px;
  position: relative;
  margin-bottom: 10px;
`;

const AvatarBackground = styled.View`
  width: 100px;
  height: 100px;
  border-radius: 50px;
  background-color: #ccc; /* Azul de la empresa */
  justify-content: center;
  align-items: center;
`;

const StatsContainer = styled.View`
  margin-top: 20px;
  align-items: center;
`;

const ReferralsCount = styled.View`
  align-items: center;
`;

const CountText = styled.Text`
  font-size: 40px;
  font-weight: bold;
  color: ${colors.primary};
  margin-top: 5px;
`;

const LabelText = styled.Text`
  font-size: 16px;
  color: ${colors.primary};
  margin-top: 5px;
`;

const MenuOptions = styled.View`
  width: 100%;
  padding: 20px;
`;

const MenuOption = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 15px 0;
  border-bottom-width: 1px;
  border-bottom-color: #eee;
`;

const MenuIconContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 40px;
`;

const MenuText = styled.Text`
  font-size: 18px;
  color: ${colors.primary};
  flex: 1;
`;

const ArrowIcon = styled.View`
  width: 40px;
  align-items: center;
  justify-content: center;
`;

const ProfileName = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${colors.primary};
  margin-top: 10px;
`;

const ProfileEmail = styled.Text`
  font-size: 16px;
  color: #555;
  margin-top: 5px;
`;
