import React, { useState } from "react";
import { ScrollView, View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from "react-native";
import styled from 'styled-components/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native'; 
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import CryptoJS from 'crypto-js';

// Definir el tipo de navegación
type ReferralFormNavigationProp = StackNavigationProp<RootStackParamList, 'ReferralForm'>;

function decodeJWT(token: string): { id: number } | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

// Función para generar el encabezado de autenticación
function generateAuthHeader(body: string, publicKey: string, privateKey: string) {
  const hmac = CryptoJS.HmacSHA256(body, privateKey);
  const hash = CryptoJS.enc.Base64.stringify(hmac);
  return `${publicKey}:${hash}`;
}

const ReferralForm: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [vehicleStatus, setVehicleStatus] = useState(''); // Estado para el radio button
  const [vehicleBrand, setVehicleBrand] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [selectedDealerships, setSelectedDealerships] = useState<string[]>([]); // Almacena los dealerships seleccionados
  const [isDealershipDropdownVisible, setDealershipDropdownVisible] = useState(false); // Dropdown visibility
  const [step, setStep] = useState(1);
  
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  // Estados para las validaciones del primer paso
  const [firstNameValid, setFirstNameValid] = useState(true);
  const [lastNameValid, setLastNameValid] = useState(true);
  const [phoneNumberValid, setPhoneNumberValid] = useState(true);
  const [emailValid, setEmailValid] = useState(true);

  // Estados para las validaciones del segundo paso
  const [vehicleStatusValid, setVehicleStatusValid] = useState(true);
  const [vehicleBrandValid, setVehicleBrandValid] = useState(true);
  const [vehicleModelValid, setVehicleModelValid] = useState(true);
  const [dealershipsValid, setDealershipsValid] = useState(true); // Validación de dealerships

  const navigation = useNavigation<ReferralFormNavigationProp>();

  // Lista de opciones de dealerships
  const dealerships = ['GM', 'Ford', 'Nissan', 'CDJR', 'Usados'];

  // Función para validar los campos del primer paso
  const validateFirstStepInputs = () => {
    let isValid = true;

    if (!firstName) {
      setFirstNameValid(false);
      isValid = false;
    } else {
      setFirstNameValid(true);
    }

    if (!lastName) {
      setLastNameValid(false);
      isValid = false;
    } else {
      setLastNameValid(true);
    }

    const phoneNumberRegex = /^[0-9]*$/;
    if (!phoneNumber || !phoneNumberRegex.test(phoneNumber)) {
      setPhoneNumberValid(false);
      isValid = false;
    } else {
      setPhoneNumberValid(true);
    }

    if (!email || !email.includes('@')) {
      setEmailValid(false);
      isValid = false;
    } else {
      setEmailValid(true);
    }

    return isValid;
  };

  // Función para validar los campos del segundo paso
  const validateSecondStepInputs = () => {
    let isValid = true;

    if (!vehicleStatus) {
      setVehicleStatusValid(false);
      isValid = false;
    } else {
      setVehicleStatusValid(true);
    }

    if (!vehicleBrand) {
      setVehicleBrandValid(false);
      isValid = false;
    } else {
      setVehicleBrandValid(true);
    }

    if (!vehicleModel) {
      setVehicleModelValid(false);
      isValid = false;
    } else {
      setVehicleModelValid(true);
    }

    if (selectedDealerships.length === 0) {
      setDealershipsValid(false);
      isValid = false;
    } else {
      setDealershipsValid(true);
    }

    return isValid;
  };

  // Función para manejar la selección de dealerships
  const toggleDealership = (dealership: string) => {
    setSelectedDealerships((prev) =>
      prev.includes(dealership)
        ? prev.filter((d) => d !== dealership)
        : [...prev, dealership]
    );
  };

  const nextStep = () => {
    if (validateFirstStepInputs()) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  const saveReferral = async () => {
    if (!validateSecondStepInputs()) return;

    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) {
        Alert.alert('Error', 'No se encontró un token, por favor inicie sesión.');
        return;
      }
      const decoded = decodeJWT(token);
      if (!decoded || !decoded.id) {
        Alert.alert('Error', 'No se pudo obtener el ID del usuario autenticado.');
        return;
      }

      navigation.navigate('PreloaderCircle', { nextScreen: 'SuccessAnimation' });

      // Datos del lead en formato XML
      const xmlBody = `
        <adf>
          <prospect>
            <id sequence="1" source="Vendor-lead-id"><![CDATA[Test-00001]]></id>
            <requestdate><![CDATA[${new Date().toISOString()}]]></requestdate>
            <customer>
              <contact>
                <name part="full"><![CDATA[${firstName} ${lastName}]]></name>
                <phone><![CDATA[${phoneNumber}]]></phone>
                <email><![CDATA[${email}]]></email>
              </contact>
              <vehicle>
                <status><![CDATA[${vehicleStatus}]]></status>
                <brand><![CDATA[${vehicleBrand}]]></brand>
                <model><![CDATA[${vehicleModel}]]></model>
              </vehicle>
            </customer>
            <vendor>
              <id source="DealerID"><![CDATA[7250_16]]></id>
              <vendorname><![CDATA[Cabrera Grupo]]></vendorname>
              <contact>
                <name part="full"><![CDATA[test]]></name>
              </contact>
            </vendor>
            <provider>
              <name part="full"><![CDATA[test]]></name>
              <service><![CDATA[test]]></service>
            </provider>
          </prospect>
        </adf>
      `;

      // Generar encabezado de autenticación
      const publicKey = "678";
      const privateKey = "9DB91AB6-AD6F-440D-98A5-DC13ACAA3518";
      const authHeader = generateAuthHeader(xmlBody, publicKey, privateKey);

      // Enviar los datos al endpoint de DealerSocket
      const endpoint = "https://oemwebsecure.dealersocket.com/DSOEMLead/US/DCP/ADF/1/SalesLead/223IIV3839";
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
          'Authorization': authHeader,
        },
        body: xmlBody,
      });

      if (response.ok) {
        setFirstName('');
        setLastName('');
        setPhoneNumber('');
        setEmail('');
        setVehicleStatus('');
        setVehicleBrand('');
        setVehicleModel('');
        setSelectedDealerships([]); // Limpiar selección de dealerships
        setStep(1);
        navigation.navigate('SuccessAnimation', { nextScreen: 'ReferralForm' });
      } else {
        const data = await response.text();
        Alert.alert('Error', data);
      }
    } catch (error) {
      console.error('Error saving referral:', error);
      Alert.alert('Error', 'Failed to save referral');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <Container>
          {step === 1 ? (
            <View>
              <Title>Enter your friend’s details below so the dealership can get in touch and assist them with finding their next vehicle.</Title>
              <InputLabel>First Name</InputLabel>
              <StyledInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter first name"
                style={{ borderColor: firstNameValid ? colors.primary : 'red' }}
              />
              <InputLabel>Last Name</InputLabel>
              <StyledInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter last name"
                style={{ borderColor: lastNameValid ? colors.primary : 'red' }}
              />
              <InputLabel>Phone Number</InputLabel>
              <StyledInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                style={{ borderColor: phoneNumberValid ? colors.primary : 'red' }}
              />
              <InputLabel>Email</InputLabel>
              <StyledInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter email"
                keyboardType="email-address"
                style={{ borderColor: emailValid ? colors.primary : 'red' }}
              />
              <SubmitButton onPress={nextStep}>
                <Ionicons name="arrow-forward" size={30} color="white" />
              </SubmitButton>
            </View>
          ) : (
            <View>
              <InputLabel>Vehicle Status</InputLabel>
              <StyledInput
                value={vehicleStatus}
                onChangeText={setVehicleStatus}
                placeholder="Enter vehicle status"
                style={{ borderColor: vehicleStatusValid ? colors.primary : 'red' }}
              />
              <InputLabel>Vehicle Brand</InputLabel>
              <StyledInput
                value={vehicleBrand}
                onChangeText={setVehicleBrand}
                placeholder="Enter vehicle brand"
                style={{ borderColor: vehicleBrandValid ? colors.primary : 'red' }}
              />
              <InputLabel>Vehicle Model</InputLabel>
              <StyledInput
                value={vehicleModel}
                onChangeText={setVehicleModel}
                placeholder="Enter vehicle model"
                style={{ borderColor: vehicleModelValid ? colors.primary : 'red' }}
              />
              <InputLabel>Dealerships</InputLabel>
              {dealerships.map((dealership) => (
                <TouchableOpacity key={dealership} onPress={() => toggleDealership(dealership)}>
                  <Text style={{ color: selectedDealerships.includes(dealership) ? colors.primary : 'black' }}>
                    {dealership}
                  </Text>
                </TouchableOpacity>
              ))}
              <ButtonContainer>
                <BackButton onPress={prevStep}>
                  <Ionicons name="arrow-back" size={30} color="white" />
                </BackButton>
                <SaveButton onPress={saveReferral}>
                  <SaveButtonText>Save</SaveButtonText>
                </SaveButton>
              </ButtonContainer>
            </View>
          )}
        </Container>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ReferralForm;

// Estilos personalizados
const Container = styled.View`
  flex: 1;
  justify-content: flex-start;
  align-items: center;
  background-color: #f5f5f5;
  padding: 20px;
  padding-top: 10px;
  border-radius: 20px;
`;

const Title = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${colors.primary};
  text-align: center;
  margin-bottom: 20px;
`;

const InputLabel = styled.Text`
  font-size: 16px;
  color: ${colors.primary};
  align-self: flex-start;
  margin-top: 10px;
`;

const StyledInput = styled.TextInput`
  width: 100%;
  height: 40px;
  border: 1px solid ${colors.primary};
  border-radius: 10px;
  margin-top: 5px;
  margin-bottom: 5px;
  padding-left: 10px;
  background-color: white;
`;

const SubmitButton = styled.TouchableOpacity`
  margin-top: 20px;
  width: 60px;
  height: 60px;
  background-color: ${colors.primary};
  justify-content: center;
  align-items: center;
  border-radius: 30px;
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  margin-top: 20px;
`;

const BackButton = styled.TouchableOpacity`
  width: 60px;
  height: 60px;
  background-color: ${colors.primary};
  justify-content: center;
  align-items: center;
  border-radius: 30px;
`;

const SaveButton = styled.TouchableOpacity`
  background-color: ${colors.primary};
  width: 100px;
  height: 50px;
  justify-content: center;
  align-items: center;
  border-radius: 25px;
`;

const SaveButtonText = styled.Text`
  color: white;
  font-size: 18px;
  font-weight: bold;
`;

const FooterText = styled.Text`
  color: ${colors.primary};
  font-size: 16px;
  text-align: center;
  margin-top: 5px;
`;
