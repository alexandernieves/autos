import React, { useState } from 'react';
import { TextInput, TouchableOpacity, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styled from 'styled-components/native';
import axios from 'axios';

interface ResetPasswordProps {
  email: string; // Añadir email aquí
  navigation: any;
  onUpdatePassword: (newPassword: string) => Promise<void>;
}

export default function ResetPassword({ email, navigation, onUpdatePassword }: ResetPasswordProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const handlePasswordSave = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Error", "La contraseña debe tener al menos 8 caracteres.");
      return;
    }
  
    try {
      await axios.post('http://localhost:3000/update-password', {  // Cambia aquí la URL
        email,
        newPassword: password,
      });
      Alert.alert("Éxito", "Contraseña actualizada correctamente.");
      navigation.navigate("Login"); // Navegar a Login si es necesario
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar la contraseña. Intenta de nuevo.");
      console.error("Error al actualizar la contraseña:", error);
    }
  };
  

  return (
    <>
      <Title>Welcome to</Title>
      <Subtitle>Auto Dealership Cabrera!</Subtitle>
      <Instruction>Enter your new password</Instruction>

      <InputContainer>
        <StyledInput
          placeholder="New password"
          secureTextEntry={!isPasswordVisible}
          value={password}
          onChangeText={setPassword}
        />
        <ToggleIcon onPress={() => setPasswordVisible(!isPasswordVisible)}>
          <Ionicons name={isPasswordVisible ? "eye-outline" : "eye-off-outline"} size={24} color="#888" />
        </ToggleIcon>
      </InputContainer>
      
      <InputContainer>
        <StyledInput
          placeholder="Repeat New password"
          secureTextEntry={!isConfirmPasswordVisible}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <ToggleIcon onPress={() => setConfirmPasswordVisible(!isConfirmPasswordVisible)}>
          <Ionicons name={isConfirmPasswordVisible ? "eye-outline" : "eye-off-outline"} size={24} color="#888" />
        </ToggleIcon>
      </InputContainer>

      <SaveButton onPress={handlePasswordSave}>
        <Ionicons name="save" size={28} color="#fff" />
      </SaveButton>
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
  flex-direction: row;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: #002368;
  margin-bottom: 15px;
  padding: 10px 0;
`;

const StyledInput = styled(TextInput)`
  flex: 1;
  font-size: 16px;
  color: #002368;
`;

const ToggleIcon = styled(TouchableOpacity)`
  padding-left: 10px;
`;

const SaveButton = styled(TouchableOpacity)`
  background-color: #002368;
  border-radius: 50px;
  padding: 15px;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  width: 60px;
  height: 60px;
  align-self: center;
`;