import React, { useState, useRef } from 'react';
import { TextInput, TouchableOpacity, ImageBackground, Alert, Vibration, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styled from 'styled-components/native';
import axios from 'axios';
import { NavigationProp, ParamListBase } from '@react-navigation/native';

const background = require('../../assets/volante_ford.jpg');

interface ConfirmCodeProps {
  navigation: NavigationProp<ParamListBase>;
  route: any;
}

export default function ConfirmCode({ navigation, route }: ConfirmCodeProps) {
  const { email } = route.params;
  const [code, setCode] = useState("");
  const [isError, setIsError] = useState(false);
  
  // Animation reference for shake effect
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  // Function to trigger shake animation
  const triggerShakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true })
    ]).start();
  };

  const handleConfirmCode = async () => {
    if (code.length !== 6 || !/^\d{6}$/.test(code)) { // Validar que el código tenga 6 dígitos completos y sea numérico
      setIsError(true);
      Vibration.vibrate(300); // Vibrar si el código es incorrecto
      triggerShakeAnimation(); // Activar la animación de vibración
      Alert.alert("Código incorrecto", "Por favor ingresa un código de 6 dígitos.");
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/verify-code', { email, code });

      if (response.status === 200) {
        navigation.navigate('ResetPassword'); // Navegar a la pantalla de restablecimiento de contraseña
      }
    } catch (error) {
      setIsError(true);
      Vibration.vibrate(300); // Hacer vibrar los cuadros de entrada
      Alert.alert("Código incorrecto", "El código ingresado no es correcto."); // Mostrar mensaje de alerta
    }
  };

  return (
    <Background source={background}>
      <Container>
        <Title>Welcome to</Title>
        <Subtitle>Auto Dealership Cabrera!</Subtitle>
        <Instruction>Enter your confirmation code</Instruction>

        {/* Shake Animation */}
        <Animated.View style={{ transform: [{ translateX: shakeAnimation }] }}>
          <CodeInputContainer>
            {[...Array(6)].map((_, index) => (
              <TextInput
                key={index}
                maxLength={1}
                keyboardType="numeric"
                value={code[index] || ""}
                style={{
                  backgroundColor: '#fff',
                  borderColor: isError ? 'red' : '#002368',
                  borderWidth: 2,
                  width: 50,
                  height: 50,
                  textAlign: 'center',
                  fontSize: 24,
                  borderRadius: 10,
                  color: '#002368',
                }}
                onChangeText={(text: string) => {
                  const newCode = code.split('');
                  newCode[index] = text;
                  setCode(newCode.join(''));
                  setIsError(false); // Resetear el estado de error al cambiar el código
                }}
              />
            ))}
          </CodeInputContainer>
        </Animated.View>

        <ButtonContainer>
          <NavButton onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={30} color="#002368" />
          </NavButton>
          <NavButton onPress={handleConfirmCode}>
            <Ionicons name="arrow-forward" size={30} color="#fff" />
          </NavButton>
        </ButtonContainer>
      </Container>
    </Background>
  );
}

const Background = styled(ImageBackground)`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const Container = styled.View`
  width: 80%;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 20px;
  align-items: center;
`;

const Title = styled.Text`
  font-size: 24px;
  color: #002368;
  font-weight: bold;
  margin-bottom: 10px;
`;

const Subtitle = styled.Text`
  font-size: 20px;
  color: #002368;
  font-weight: bold;
  margin-bottom: 20px;
`;

const Instruction = styled.Text`
  font-size: 16px;
  color: #002368;
  margin-bottom: 20px;
`;

const CodeInputContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  margin-top: 20px;
`;

const NavButton = styled(TouchableOpacity)`
  background-color: #002368;
  border-radius: 30px;
  padding: 10px;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
`;
