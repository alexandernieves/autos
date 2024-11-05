import React, { useState, useRef } from 'react';
import { 
  TextInput, 
  TouchableOpacity, 
  ImageBackground, 
  Alert, 
  Vibration, 
  Animated 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styled from 'styled-components/native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import ResetPassword from './ResetPassword';
import axios from 'axios';

const background = require('../../assets/volante_ford.jpg');

interface ForgotPasswordProps {
  navigation: NavigationProp<ParamListBase>;
}

export default function ForgotPassword({ navigation }: ForgotPasswordProps) {
  const [email, setEmail] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeConfirmed, setIsCodeConfirmed] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const [sentCode, setSentCode] = useState("");
  const [showButtons, setShowButtons] = useState(true); // Nuevo estado para controlar los botones

  const triggerShakeAnimation = () => {
    Vibration.vibrate(300);
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true })
    ]).start();
  };

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Por favor ingresa tu correo electrónico.");
      return;
    }
  
    if (!isCodeSent) {
      try {
        const response = await axios.post('https://api.cabreraapp.alexcode.org/cabrera/forgot-password', { email });
        if (response.status === 200) {
          const codeFromServer = response.data.code;
          setSentCode(codeFromServer.toString());
          setIsCodeSent(true);
        }
      } catch (error) {
        Alert.alert("Error", "El correo no existe o ocurrió un error. Intenta de nuevo.");
      }
    } else if (!isCodeConfirmed) {
      if (code.some((digit) => digit === "")) {
        Alert.alert("Error", "Por favor ingresa todos los dígitos del código.");
        triggerShakeAnimation();
        return;
      }
  
      const enteredCode = code.join("");
  
      if (enteredCode === sentCode) {
        Alert.alert("Código correcto", "Ahora puedes restablecer tu contraseña.", [
          {
            text: "OK",
            onPress: () => {
              setIsCodeConfirmed(true);
              setShowButtons(false); // Oculta los botones al confirmar el código
            },
          },
        ]);
      } else {
        Alert.alert("Error", "El código ingresado no es correcto. Intenta nuevamente.");
        triggerShakeAnimation();
      }
    }
  };

  const handleUpdatePassword = async (newPassword: string) => {
    try {
      const response = await axios.post('https://api.cabreraapp.alexcode.org/cabrera/update-password', {
        email,
        newPassword,
      });
      if (response.status === 200) {
        Alert.alert('Éxito', 'Tu contraseña ha sido actualizada');
        navigation.navigate('Login');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la contraseña. Intenta de nuevo.');
    }
  };

  return (
    <Background source={background}>
      <Container>
        {!isCodeConfirmed ? (
          <>
            <Title>Welcome to</Title>
            <Subtitle>Auto Dealership Cabrera!</Subtitle>
            {isCodeSent ? (
              <>
                <Instruction>Enter your confirmation code</Instruction>
                <Animated.View style={{ transform: [{ translateX: shakeAnimation }] }}>
                  <CodeInputContainer>
                    {code.map((value, index) => (
                      <CodeInput
                        key={index}
                        maxLength={1}
                        keyboardType="numeric"
                        value={value}
                        onChangeText={(text: string) => {
                          const newCode = [...code];
                          newCode[index] = text;
                          setCode(newCode);
                        }}
                        style={{
                          borderColor: code[index] === "" ? "red" : "#002368",
                          borderWidth: 2,
                        }}
                      />
                    ))}
                  </CodeInputContainer>
                </Animated.View>
              </>
            ) : (
              <>
                <Instruction>Enter your e-mail</Instruction>
                <InputContainer>
                  <StyledInput
                    placeholder="E-mail"
                    placeholderTextColor="#aaa"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={(text: React.SetStateAction<string>) => setEmail(text)}
                  />
                  <Hint>A confirmation code will be sent to your phone number</Hint>
                </InputContainer>
              </>
            )}
          </>
        ) : (
          <ResetPassword navigation={navigation} onUpdatePassword={handleUpdatePassword} email={''} />
        )}

        {showButtons && ( // Mostrar botones solo si showButtons es true
          <ButtonContainer>
            <NavButton onPress={() => navigation.navigate('Login')}>
              <Ionicons name="arrow-back" size={30} color="#fff" />
            </NavButton>
            <NavButton onPress={() => {
              if (isCodeConfirmed) {
                navigation.navigate('ResetPassword');
              } else {
                handleResetPassword();
              }
            }}>
              <Ionicons name={isCodeConfirmed ? 'save' : 'arrow-forward'} size={30} color="#fff" />
            </NavButton>
          </ButtonContainer>
        )}
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

const InputContainer = styled.View`
  width: 100%;
  margin-bottom: 20px;
`;

const StyledInput = styled(TextInput)`
  background-color: #F6F7FB;
  height: 58px;
  border-radius: 10px;
  padding-horizontal: 12px;
  font-size: 16px;
  color: #002368;
  margin-bottom: 10px;
  border: 1px solid #002368;
`;

const Hint = styled.Text`
  font-size: 12px;
  color: #002368;
  text-align: center;
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

const CodeInputContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const CodeInput = styled(TextInput)`
  background-color: #F6F7FB;
  border-radius: 10px;
  height: 58px;
  width: 58px;
  text-align: center;
  font-size: 24px;
  color: #002368;
`;
