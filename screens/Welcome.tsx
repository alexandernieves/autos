import React from 'react';
import { Dimensions } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import styled from 'styled-components/native';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../App';

// Obtener dimensiones de la pantalla
const { width, height } = Dimensions.get('window');

// Selección dinámica de la imagen de fondo
const getBackgroundImage = () => {
  if (width >= 1024) {
    // iPad o dispositivos más grandes
    return require('../assets/ford_raptor_forest_ipad.jpg');
  } else {
    // iPhone
    return require('../assets/ford_raptor_forest.jpg');
  }
};

// Ajuste de proporciones dinámicas
const curvedHeight = height * 0.12; // 12% de la altura para el fondo curvo
const logoWidth = width * 0.4; // 40% del ancho para el logo
const logoHeight = logoWidth * 0.24; // Mantener proporción de 250x60
const logoTopMargin = height * 0.05; // Dinámico para ajustar margen superior del logo

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #002368;
`;

const CurvedContainer = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: ${curvedHeight}px;
  background-color: #FFFFFF;
  border-bottom-left-radius: ${curvedHeight}px;
  border-bottom-right-radius: ${curvedHeight}px;
  align-items: center;
  justify-content: center;
  z-index: 1;
`;

const Logo = styled.Image`
  width: ${logoWidth}px;
  height: ${logoHeight}px;
  resize-mode: contain;
  margin-bottom:5px;
  margin-top: ${logoTopMargin}px; /* Ajuste dinámico */
`;

const BackgroundImage = styled.Image`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  resize-mode: cover;
`;

const Footer = styled.View`
  position: absolute;
  bottom: ${height * 0.08}px; /* Mover ligeramente hacia arriba */
  align-items: center;
  width: 100%;
`;

const Button = styled.TouchableOpacity`
  background-color: #002368;
  border-radius: 8px;
  text-align: center;
  justify-content: center;
  padding-vertical: ${height * 0.012}px; /* Botón más compacto */
  margin-bottom: ${height * 0.015}px;
  width: ${width * 0.6}px; /* Botón más estrecho */
`;

const ButtonText = styled.Text`
  font-size: ${width * 0.035}px; /* Texto más pequeño */
  font-weight: bold;
  color: #fff;
  text-align: center;
  justify-content: center;
`;

const LoginText = styled.Text`
  color: #BDBDBD;
  text-align: center;
  margin-top: ${height * 0.005}px; /* Menor separación */
  font-size: ${width * 0.03}px; /* Texto más pequeño */
`;

const SignUpText = styled.Text`
  color: #FF0000;
  font-weight: bold;
  text-align: center;
  font-size: ${width * 0.032}px; /* Texto más pequeño */
`;

export default function Welcome() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { t } = useTranslation();

  return (
    <Container>
      {/* Selección dinámica de la imagen de fondo */}
      <BackgroundImage source={getBackgroundImage()} />
      <CurvedContainer>
        <Logo 
          source={require('../assets/cabrera.png')} 
          onError={(e: { nativeEvent: { error: any; }; }) => console.log('Error loading image:', e.nativeEvent.error)}
        />
      </CurvedContainer>
      <Footer>
        <Button onPress={() => navigation.navigate('Login')}>
          <ButtonText>{t('get_started')}</ButtonText>
        </Button>
        <LoginText>
          {t('sign_up_referral')}
        </LoginText>
      </Footer>
    </Container>
  );
}