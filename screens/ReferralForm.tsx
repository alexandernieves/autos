import React, { useState } from "react";
import { ScrollView, View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Modal } from "react-native";
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
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
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
    setSelectedDealerships(prev => 
      prev.includes(dealership)
        ? prev.filter(d => d !== dealership)
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
              <dealership><![CDATA[${selectedDealerships.join(', ')}]]></dealership>
            </customer>
            <vendor>
              <id source="DealerID"><![CDATA[7250_16]]></id>
              <vendorname><![CDATA[Cabrera Grupo]]></vendorname>
            </vendor>
            <provider>
              <name part="full"><![CDATA[test]]></name>
            </provider>
          </prospect>
        </adf>
      `;

      const publicKey = "678";
      const privateKey = "9DB91AB6-AD6F-440D-98A5-DC13ACAA3518";
      const hmac = CryptoJS.HmacSHA256(xmlBody, privateKey);
      const hash = CryptoJS.enc.Base64.stringify(hmac);
      const authHeader = `${publicKey}:${hash}`;

      console.log('Enviando datos a DealerSocket:', xmlBody);

      const dealerResponse = await fetch('https://oemwebsecure.dealersocket.com/DSOEMLead/US/DCP/ADF/1/SalesLead/223IIV3839', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
          'Authorization': authHeader,
        },
        body: xmlBody,
      });

      console.log('Respuesta de DealerSocket:', await dealerResponse.text());

      console.log('Enviando datos a la base de datos en Azure');

      const dbResponse = await fetch('http://localhost:3000/referrals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          email: email,
          vehicle_status: vehicleStatus,  
          vehicle_brand: vehicleBrand,
          vehicle_model: vehicleModel,
          dealerships: selectedDealerships,
          referred_by_user_id: decoded.id,
          status: 'Pending',
        }),
      });

      console.log('Respuesta de la base de datos:', await dbResponse.json());

      if (dealerResponse.ok && dbResponse.ok) {
        setFirstName('');
        setLastName('');
        setPhoneNumber('');
        setEmail('');
        setVehicleStatus('');
        setVehicleBrand('');
        setVehicleModel('');
        setSelectedDealerships([]);
        setStep(1);
        navigation.navigate('SuccessAnimation', { nextScreen: 'ReferralForm' });
      } else {
        Alert.alert('Error', 'Hubo un problema al guardar la referencia. Verifica los logs para más detalles.');
      }

    } catch (error) {
      console.error('Error al guardar el referral:', error);
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
            <Title>Enter your friend’s details below so the dealership can get in touch and assist them with finding their next vehicle.</Title>
          ) : (
            <FooterText>By submitting this referral, you confirm that you have their permission to share their contact details with us.</FooterText>
          )}

          {step === 1 ? (
            <>
              <InputLabel>First Name</InputLabel>
              <StyledInput 
                placeholder="Enter your first name" 
                value={firstName} 
                onChangeText={setFirstName} 
                style={{ borderColor: firstNameValid ? colors.primary : 'red' }}
              />
              {!firstNameValid && <ErrorText>First Name invalid</ErrorText>}

              <InputLabel>Last Name</InputLabel>
              <StyledInput 
                placeholder="Enter your last name" 
                value={lastName} 
                onChangeText={setLastName} 
                style={{ borderColor: lastNameValid ? colors.primary : 'red' }}
              />
              {!lastNameValid && <ErrorText>Last Name invalid</ErrorText>}

              <InputLabel>Phone number</InputLabel>
              <StyledInput 
                placeholder="+###" 
                keyboardType="phone-pad" 
                value={phoneNumber} 
                onChangeText={setPhoneNumber} 
                style={{ borderColor: phoneNumberValid ? colors.primary : 'red' }}
              />
              {!phoneNumberValid && <ErrorText>Phone number invalid (numbers only)</ErrorText>}

              <InputLabel>E-mail</InputLabel>
              <StyledInput 
                placeholder="Enter your email" 
                keyboardType="email-address" 
                value={email} 
                onChangeText={setEmail} 
                style={{ borderColor: emailValid ? colors.primary : 'red' }}
              />
              {!emailValid && <ErrorText>Email invalid (must include @)</ErrorText>}

              <SubmitButton onPress={nextStep}>
                <Ionicons name="arrow-forward" size={24} color="white" />
              </SubmitButton>

              <FooterText>You’re just a few steps away from earning a commission!</FooterText>
            </>
          ) : (
            <>
              <InputLabel>Vehicle Status</InputLabel>
              <TouchableOpacity
                onPress={() => setDropdownVisible(true)} // Abre el modal
                style={{
                  borderColor: vehicleStatusValid ? colors.primary : 'red',
                  borderWidth: 1,
                  borderRadius: 10,
                  padding: 10,
                  marginVertical: 5,
                  backgroundColor: '#fff',
                  width: '100%', // Ancho completo
                }}
              >
                <Text>{vehicleStatus ? vehicleStatus : 'Select Vehicle Status'}</Text>
              </TouchableOpacity>
              {!vehicleStatusValid && <ErrorText>Vehicle Status invalid</ErrorText>}

              {/* Modal con botones tipo radio */}
              <Modal
                transparent={true}
                visible={isDropdownVisible}
                animationType="fade"
                onRequestClose={() => setDropdownVisible(false)}
              >
                <TouchableOpacity
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                  }}
                  onPress={() => setDropdownVisible(false)}
                >
                  <View
                    style={{
                      width: '80%',
                      backgroundColor: 'white',
                      borderRadius: 10,
                      padding: 10,
                    }}
                  >
                    {/* Botones tipo radio con display flex */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
                      <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}
                        onPress={() => {
                          setVehicleStatus('New');
                          setDropdownVisible(false);
                        }}
                      >
                        <View
                          style={{
                            height: 20,
                            width: 20,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: '#000',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 10,
                          }}
                        >
                          {vehicleStatus === 'New' && (
                            <View
                              style={{
                                height: 10,
                                width: 10,
                                borderRadius: 5,
                                backgroundColor: '#000',
                              }}
                            />
                          )}
                        </View>
                        <Text>New</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}
                        onPress={() => {
                          setVehicleStatus('Used');
                          setDropdownVisible(false);
                        }}
                      >
                        <View
                          style={{
                            height: 20,
                            width: 20,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: '#000',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 10,
                          }}
                        >
                          {vehicleStatus === 'Used' && (
                            <View
                              style={{
                                height: 10,
                                width: 10,
                                borderRadius: 5,
                                backgroundColor: '#000',
                              }}
                            />
                          )}
                        </View>
                        <Text>Used</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              </Modal>

              <InputLabel>Vehicle Brand</InputLabel>
              <StyledInput 
                placeholder="Select Vehicle Brand" 
                value={vehicleBrand} 
                onChangeText={setVehicleBrand} 
                style={{ borderColor: vehicleBrandValid ? colors.primary : 'red' }}
              />
              {!vehicleBrandValid && <ErrorText>Vehicle Brand invalid</ErrorText>}

              <InputLabel>Vehicle Model</InputLabel>
              <StyledInput 
                placeholder="Select Vehicle Model" 
                value={vehicleModel} 
                onChangeText={setVehicleModel} 
                style={{ borderColor: vehicleModelValid ? colors.primary : 'red' }}
              />
              {!vehicleModelValid && <ErrorText>Vehicle Model invalid</ErrorText>}

              {/* Campo para seleccionar dealerships */}
              <InputLabel>Select Dealerships</InputLabel>
              <TouchableOpacity
                style={{
                  borderColor: dealershipsValid ? colors.primary : 'red',
                  borderWidth: 1,
                  borderRadius: 10,
                  padding: 10,
                  marginVertical: 5,
                  backgroundColor: '#fff',
                  width: '100%',
                }}
                onPress={() => setDealershipDropdownVisible(true)}
              >
                <Text>{selectedDealerships.length > 0 ? selectedDealerships.join(', ') : 'Select Dealerships'}</Text>
              </TouchableOpacity>
              {!dealershipsValid && <ErrorText>Please select at least one dealership</ErrorText>}

              {/* Dropdown de dealerships */}
              <Modal
                transparent={true}
                visible={isDealershipDropdownVisible}
                animationType="fade"
                onRequestClose={() => setDealershipDropdownVisible(false)}
              >
                <TouchableOpacity
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                  }}
                  onPress={() => setDealershipDropdownVisible(false)}
                >
                  <View
                    style={{
                      width: '80%',
                      backgroundColor: 'white',
                      borderRadius: 10,
                      padding: 10,
                    }}
                  >
                    {dealerships.map(dealership => (
                      <TouchableOpacity
                        key={dealership}
                        style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}
                        onPress={() => toggleDealership(dealership)}
                      >
                        <View
                          style={{
                            height: 20,
                            width: 20,
                            borderRadius: 5,
                            borderWidth: 1,
                            borderColor: '#000',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 10,
                            backgroundColor: selectedDealerships.includes(dealership) ? '#000' : '#fff',
                          }}
                        >
                          {selectedDealerships.includes(dealership) && (
                            <Ionicons name="checkmark" size={16} color="#fff" />
                          )}
                        </View>
                        <Text>{dealership}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </TouchableOpacity>
              </Modal>

              <ButtonContainer>
                <BackButton onPress={prevStep}>
                  <Ionicons name="arrow-back" size={24} color="white" />
                </BackButton>
                <SaveButton onPress={saveReferral}>
                  <SaveButtonText>Submit</SaveButtonText>
                </SaveButton>
              </ButtonContainer>
            </>
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

const ErrorText = styled.Text`
  color: red;
  font-size: 14px;
  margin-top: 5px;
  margin-top: -2px;
  align-self: flex-start;
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
