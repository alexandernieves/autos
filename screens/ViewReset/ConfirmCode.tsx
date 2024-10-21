import React, { useState } from 'react';
import { TextInput, TouchableOpacity, ImageBackground, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styled from 'styled-components/native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';

const background = require('../../assets/volante_ford.jpg');

interface ConfirmCodeProps {
  navigation: NavigationProp<ParamListBase>;
}

export default function ConfirmCode({ navigation }: ConfirmCodeProps) {
  const [code, setCode] = useState("");

  const handleConfirmCode = () => {
    console.log("Code entered:", code);
    // Aquí podrías agregar la lógica para confirmar el código
  };

  return (
    <Background source={background}>
      <Container>
        <Title>Welcome to</Title>
        <Subtitle>Auto Dealership Cabrera!</Subtitle>
        <Instruction>Enter your confirmation code</Instruction>
        
        <CodeInputContainer>
          {[...Array(4)].map((_, index) => (
            <CodeInput
              key={index}
              maxLength={1}
              keyboardType="numeric"
              value={code[index] || ""}
              onChangeText={(text: string) => {
                const newCode = code.split('');
                newCode[index] = text;
                setCode(newCode.join(''));
              }}
            />
          ))}
        </CodeInputContainer>
        
        <ButtonContainer>
          <NavButton onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={30} color="#002368" />
          </NavButton>
          <NavButton onPress={handleConfirmCode}>
            <Ionicons name="arrow-back" size={30} color="#fff" />
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

const CodeInput = styled(TextInput)`
  background-color: #fff;
  border: 2px solid #002368;
  width: 50px;
  height: 50px;
  text-align: center;
  font-size: 24px;
  border-radius: 10px;
  color: #002368;
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
