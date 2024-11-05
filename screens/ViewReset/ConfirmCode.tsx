import React, { useState, useRef } from 'react';
import { TextInput, TouchableOpacity, ImageBackground, Alert, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styled from 'styled-components/native';
import axios, { AxiosError } from 'axios';
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
  
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  const triggerShakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true })
    ]).start();
  };

  const handleConfirmCode = async () => {
    // Validación de código de 6 dígitos
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      Alert.alert("Error", "Por favor ingresa un código de 6 dígitos.");
      triggerShakeAnimation();
      return;
    }

    try {
      const response = await axios.post('https://api.cabreraapp.alexcode.org/cabrera/verify-code', { email, code });

      if (response.status === 200 && response.data.message === 'Código de verificación aprobado') {
        Alert.alert("Código de verificación aprobado", "El código ingresado es correcto.", [
          { text: "OK", onPress: () => navigation.navigate('ResetPassword') }
        ]);
      }
    } catch (error) {
      // Aquí definimos el tipo de error
      const axiosError = error as AxiosError; // Cast al tipo AxiosError
      if (axiosError.response && axiosError.response.status === 400) {
        Alert.alert("Código incorrecto", "El código ingresado no es correcto.", [
          { text: "OK", onPress: () => triggerShakeAnimation() }
        ]);
      } else {
        Alert.alert("Error", "Ocurrió un error al verificar el código.");
      }
    }
  };

  return (
    <Background source={background}>
      <Container>
        <Title>Welcome to</Title>
        <Subtitle>Auto Dealership Cabrera!</Subtitle>
        <Instruction>Enter your confirmation code</Instruction>

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
                  setIsError(false);
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
