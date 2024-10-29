import React, { useState } from 'react';
import { TextInput, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styled from 'styled-components/native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';

interface ResetPasswordProps {
  navigation: NavigationProp<ParamListBase>;
}

export default function ResetPassword({ navigation }: ResetPasswordProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const handleSavePassword = () => {
    console.log("New password:", password);
    console.log("Confirm password:", confirmPassword);
    
    // Aquí navegas a la vista de éxito
    navigation.navigate('Success');
  };

  return (
    <>
      <Title>Welcome to</Title>
      <Subtitle>Auto Dealership Cabrera!</Subtitle>
      <Instruction>Enter your new password</Instruction>
      
      <InputContainer>
        <StyledInput
          placeholder="New password"
          placeholderTextColor="#aaa"
          secureTextEntry={!passwordVisible}
          value={password}
          onChangeText={(text: React.SetStateAction<string>) => setPassword(text)}
        />
        <TouchableOpacity onPress={togglePasswordVisibility}>
          <Ionicons
            name={passwordVisible ? "eye-outline" : "eye-off-outline"}
            size={24}
            color="#888"
          />
        </TouchableOpacity>
      </InputContainer>
      <Hint>
        Create a strong password with a combination of letters, numbers, and symbols. Max 8 characters.
      </Hint>

      <InputContainer>
        <StyledInput
          placeholder="Repeat New password"
          placeholderTextColor="#aaa"
          secureTextEntry={!confirmPasswordVisible}
          value={confirmPassword}
          onChangeText={(text: React.SetStateAction<string>) => setConfirmPassword(text)}
        />
        <TouchableOpacity onPress={toggleConfirmPasswordVisibility}>
          <Ionicons
            name={confirmPasswordVisible ? "eye-outline" : "eye-off-outline"}
            size={24}
            color="#888"
          />
        </TouchableOpacity>
      </InputContainer>

    </>
  );
}

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
  flex-direction: row;
  align-items: center;
  background-color: #F6F7FB;
  height: 58px;
  border-radius: 10px;
  padding-horizontal: 12px;
  font-size: 16px;
  color: #002368;
  margin-bottom: 10px;
  border: 1px solid #002368;
`;

const StyledInput = styled(TextInput)`
  flex: 1;
  font-size: 16px;
  color: #002368;
`;

const Hint = styled.Text`
  font-size: 12px;
  color: #002368;
  text-align: center;
  margin-bottom: 20px;
`;




