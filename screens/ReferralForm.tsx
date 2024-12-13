import React, { useState } from "react";
import { ScrollView, View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Modal, ActivityIndicator } from "react-native";
import styled from 'styled-components/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native'; 
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import CryptoJS from 'crypto-js';
import { create } from 'xmlbuilder2';
import { useTranslation } from 'react-i18next';


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
  const [email, setEmail] = useState('');
  const [vehicleStatus, setVehicleStatus] = useState(''); // Estado para el radio button
  const [vehicleBrand, setVehicleBrand] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [selectedDealerships, setSelectedDealerships] = useState<string[]>([]);
  const [selectedDealer, setSelectedDealer] = useState<string[]>([]);
  const [isDealershipDropdownVisible, setDealershipDropdownVisible] = useState(false);
  const [isDealerDropdownVisible, setDealerDropdownVisible] = useState(false);
  const [step, setStep] = useState(1);
  const { t } = useTranslation();

  const [isDropdownVisible, setDropdownVisible] = useState(false);

  // Estados para las validaciones del primer paso
  const [firstNameValid, setFirstNameValid] = useState(true);
  const [lastNameValid, setLastNameValid] = useState(true);
  const [emailValid, setEmailValid] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('+1 ');
  const [phoneNumberValid, setPhoneNumberValid] = useState(true);
  
  const handlePhoneNumberChange = (text: string) => {
    // Mantener siempre el prefijo "+1 " en el campo
    if (!text.startsWith("+1 ")) {
      text = "+1 " + text.replace(/^\+1\s*/, "");
    }
  
    // Extrae solo los dígitos después del prefijo "+1 "
    const phoneDigits = text.slice(3).replace(/\D/g, '');
    
    // Si tiene 10 dígitos después de "+1 ", entonces es válido
    const isValid = phoneDigits.length === 10;
  
    setPhoneNumberValid(isValid);
    setPhoneNumber("+1 " + phoneDigits);
  };
  

  
  
  

  // Estados para las validaciones del segundo paso
  const [vehicleStatusValid, setVehicleStatusValid] = useState(true);
  const [vehicleBrandValid, setVehicleBrandValid] = useState(true);
  const [vehicleModelValid, setVehicleModelValid] = useState(true);
  const [dealershipsValid, setDealershipsValid] = useState(true);
  const [dealerValid, setDealerValid] = useState(true);
  const [loading, setLoading] = useState(false);


  const navigation = useNavigation<ReferralFormNavigationProp>();

  // Lista de opciones de dealerships
  const dealerships = [
    { name: 'Cabrera Hermanos', id: '9677_2' },
    { name: 'Cabrera Bayamon', id: '9675_5' },
    { name: 'Cabrera Chrysler', id: '9675_3' },
    { name: 'Cabrera Ford', id: '9675_4' },
    { name: 'Cabrera Nissan', id: '9675_1' },
  ];
  

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
  
    const phoneDigits = phoneNumber.slice(3).replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
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
 
  

  // Función para manejar la selección de dealerships
  const toggleDealership = (dealership: string) => {
    setSelectedDealerships([dealership]); // Reemplaza cualquier selección previa con la nueva
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
    console.log('saveReferral fue llamado'); // Confirmar que la función se llama
  
    // Verificar que los inputs son válidos antes de continuar

  
    setLoading(true); // Mostrar el preloader
  
    try {
      // Obtener el token de autenticación del almacenamiento local
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) {
        console.log('No se encontró un token, por favor inicie sesión.');
        return;
      }
      console.log('Token encontrado:', token);
  
      const decoded = decodeJWT(token);
      if (!decoded || !decoded.id) {
        console.log('No se pudo obtener el ID del usuario autenticado.');
        return;
      }
      console.log('Usuario autenticado con ID:', decoded.id);
  
      const fixedDate = '2024-10-21T12:00:00.000Z'; // Fecha fija para pruebas
  
      // Definir el XML para enviar a DealerSocket
      const xmlBody = `<adf>
        <prospect>
          <id sequence="1" source="Vendor-lead-id"><![CDATA[Test-00001]]></id>
          <requestdate><![CDATA[${fixedDate}]]></requestdate>
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
            <dealership><![CDATA[${selectedDealerships}]]></dealership>
          </customer>
          <vendor>
            <id source="DealerID"><![CDATA[${selectedDealer}]]></id>
            <vendorname><![CDATA[Cabrera Grupo]]></vendorname>
          </vendor>
          <provider>
            <name part="full"><![CDATA[test]]></name>
          </provider>
        </prospect>
      </adf>`.trim();
  
      console.log('XML generado:', xmlBody);
  
      // Generar el hash HMAC-SHA256 usando el XML y la clave secreta
      const privateKey = "9DB91AB6-AD6F-440D-98A5-DC13ACAA3518";
      const hmac = CryptoJS.HmacSHA256(xmlBody, privateKey);
      const hash = CryptoJS.enc.Base64.stringify(hmac);
      const publicKey = "678";
      const authHeader = `${publicKey}:${hash}`;
      console.log('Hash generado:', hash);
      console.log('Authorization Header:', authHeader);
  
      // Enviar los datos a DealerSocket
      const dealerResponse = await fetch('https://oemwebsecure.dealersocket.com/DSOEMLead/US/DCP/ADF/1/SalesLead/223IIV3839', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
          'Authorization': '861OST7574:967VHW1918',
        },
        body: xmlBody,
      });
  
      const dealerResponseText = await dealerResponse.text();
      console.log('Respuesta de DealerSocket:', dealerResponseText);
      console.log('DealerSocket Status:', dealerResponse.status);
  
      if (dealerResponse.status !== 200) {
        console.error('Error en la llamada a DealerSocket:', dealerResponseText);
      }
  
      // Enviar los datos a la base de datos en Azure
      const dbPayload = {
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
      };
      console.log('Datos enviados a la base de datos:', dbPayload);
  
      const dbResponse = await fetch('https://api.cabreraapp.alexcode.org/cabrera/referrals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
        },
        body: JSON.stringify(dbPayload),
      });
  
      const dbResponseJson = await dbResponse.json();
      console.log('Respuesta de la base de datos:', dbResponseJson);
      console.log('DB Status:', dbResponse.status);
  
      if (dbResponse.status === 201) {
        console.log('Datos guardados en la base de datos de Azure exitosamente.');
      } else {
        console.error('Error al guardar los datos en la base de datos:', dbResponseJson);
      }
  
      navigation.navigate('SuccessAnimation', { nextScreen: 'ReferralForm' });
    } catch (error) {
      console.error('Error al guardar el referral:', error);
    } finally {
      setLoading(false); // Ocultar el preloader
      console.log('Finalizó el flujo de saveReferral');
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
            <Title>{t('Enter_your_friends_details')}</Title>
          ) : (
            <FooterText>{t('Referral_confirmation')}
</FooterText>
          )}

          {step === 1 ? (
            <>
              <InputLabel>{t('First_Name')}</InputLabel>
              <StyledInput 
                placeholder="Enter your first name" 
                value={firstName} 
                onChangeText={setFirstName} 
                style={{ borderColor: firstNameValid ? colors.primary : 'red' }}
              />
              {!firstNameValid && <ErrorText>First Name invalid</ErrorText>}

              <InputLabel>{t('Last_Name')}
              </InputLabel>
              <StyledInput 
                placeholder="Enter your last name" 
                value={lastName} 
                onChangeText={setLastName} 
                style={{ borderColor: lastNameValid ? colors.primary : 'red' }}
              />
              {!lastNameValid && <ErrorText>Last Name invalid</ErrorText>}
              <InputLabel>{t('Phone_Number')}
              </InputLabel>
                <StyledInput
                  placeholder="+1"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={handlePhoneNumberChange}
                  style={{ borderColor: phoneNumberValid ? colors.primary : 'red' }}
                />
                {!phoneNumberValid && <ErrorText>Phone number invalid (10 digits required)</ErrorText>}

              <InputLabel>{t('E_mail')}
              </InputLabel>
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

              <FooterText>{t('Commission_steps')}
              </FooterText>
            </>
          ) : (
            <>
              <InputLabel>{t('Vehicle_Status')}
              </InputLabel>
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
                        <Text>{t('New')}
                        </Text>
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
                        <Text>{t('Used')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              </Modal>

              <InputLabel>{t('Vehicle_Brand')}
              </InputLabel>
              <StyledInput 
                placeholder="Select Vehicle Brand" 
                value={vehicleBrand} 
                onChangeText={setVehicleBrand} 
                style={{ borderColor: vehicleBrandValid ? colors.primary : 'red' }}
              />
              {!vehicleBrandValid && <ErrorText>Vehicle Brand invalid</ErrorText>}

              <InputLabel>{t('Vehicle_Model')}
              </InputLabel>
              <StyledInput 
                placeholder="Select Vehicle Model" 
                value={vehicleModel} 
                onChangeText={setVehicleModel} 
                style={{ borderColor: vehicleModelValid ? colors.primary : 'red' }}
              />
              {!vehicleModelValid && <ErrorText>Vehicle Model invalid</ErrorText>}

              {/* Campo para seleccionar dealerships */}
              <InputLabel>{t('Dealerships')}
              </InputLabel>
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
{dealerships.map(({ name, id }) => (
  <TouchableOpacity
    key={id}
    style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}
    onPress={() => toggleDealership(id)} // Guarda solo el ID
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
        backgroundColor: selectedDealerships.includes(id) ? '#000' : '#fff',
      }}
    >
      {selectedDealerships.includes(id) && (
        <Ionicons name="checkmark" size={16} color="#fff" />
      )}
    </View>
    <View>
      {/* Muestra el nombre del concesionario */}
      <Text style={{ fontSize: 16, color: '#000' }}>{name}</Text>
    </View>
  </TouchableOpacity>
))}



                  </View>
                </TouchableOpacity>
              </Modal>

              <ButtonContainer>
                <BackButton onPress={prevStep}>
                  <Ionicons name="arrow-back" size={24} color="white" />
                </BackButton>
                <SaveButton onPress={saveReferral} disabled={loading}>
                    {loading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <SaveButtonText>Submit</SaveButtonText>
                    )}
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

const SaveButton = styled.TouchableOpacity<{ disabled: boolean }>`
  background-color: ${(props: { disabled: any; }) => (props.disabled ? '#ccc' : colors.primary)};
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
