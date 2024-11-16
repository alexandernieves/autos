import React from 'react';
import { Image } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import styled from 'styled-components/native';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../App';

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
  height: 150px;
  background-color: #FFFFFF;
  border-bottom-left-radius: 300px;
  border-bottom-right-radius: 300px;
  align-items: center;
  justify-content: center;
  z-index: 1;
`;

const Logo = styled.Image`
  width: 250px;
  height: 60px;
  resize-mode: contain;
  margin-top: 50px;
  padding-bottom: 30px; /* Padding bottom agregado */
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
  /* Se ha eliminado la opacidad */
`;

const Footer = styled.View`
  position: absolute;
  bottom: 50px;
  align-items: center;
  width: 100%;
`;

const Button = styled.TouchableOpacity`
  background-color: #002368;
  border-radius: 10px;
  text-align: center;
  justify-content: center;
  padding-vertical: 15px;
  margin-bottom: 20px;
  width: 80%;
`;

const ButtonText = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  text-align: center;
  justify-content: center;
`;

const LoginText = styled.Text`
  color: #BDBDBD;
  text-align: center;
  margin-top: 10px;
`;

const SignUpText = styled.Text`
  color: #FF0000;
  font-weight: bold;
  text-align: center;
`;

export default function Welcome() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { t } = useTranslation();

  return (
    <Container>
      <BackgroundImage source={require('../assets/ford_raptor_forest.jpg')} />
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

