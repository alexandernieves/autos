import React, { useState } from 'react';
import { TouchableOpacity, SafeAreaView, Modal, View, Text, Share, Alert } from 'react-native';
import styled from 'styled-components/native';
import Header from './Header';
import QRCode from 'react-native-qrcode-svg'; // Importamos la librería QR
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

const QRContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #f9f9f9;
  padding: 20px;
`;

const QRName = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #002368;
  margin-bottom: 10px;
  text-align: center;
`;

const QRSubtitle = styled.Text`
  font-size: 16px;
  color: #444;
  margin-top: 25px;
  text-align: center;
  line-height: 22px;
`;

const QRCodeContainer = styled.View`
  width: 240px;
  height: 240px;
  background-color: #ffffff;
  border-radius: 15px;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 5px;
  elevation: 4; /* Para dispositivos Android */
`;

const ActionButton = styled(TouchableOpacity)`
  width: 80%;
  background-color: #002368;
  border-radius: 10px;
  padding: 15px;
  justify-content: center;
  align-items: center;
  margin-top: 12px;
  flex-direction: row;
  shadow-color: #000;
  shadow-opacity: 0.2;
  shadow-radius: 5px;
  elevation: 4; /* Sombra para Android */
`;

const ActionButtonText = styled.Text`
  color: #fff;
  font-size: 17px;
  font-weight: bold;
  margin-left: 8px;
`;

const ModalContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.View`
  width: 85%;
  padding: 25px;
  background-color: white;
  border-radius: 10px;
  justify-content: center;
  align-items: center;
  shadow-color: #000;
  shadow-opacity: 0.2;
  shadow-radius: 5px;
  elevation: 4; /* Sombra para Android */
`;

const CloseButton = styled(TouchableOpacity)`
  background-color: #002368;
  padding: 12px;
  margin-top: 15px;
  border-radius: 8px;
`;

const CloseButtonText = styled.Text`
  color: white;
  font-weight: bold;
`;

const QRScreen: React.FC = ({ navigation }: any) => {
  const [modalVisible, setModalVisible] = useState(false);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const navigateToHome = () => {
    navigation.navigate('Home');
  };

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };
  const { t } = useTranslation();


  const shareLink = async () => {
    try {
      const result = await Share.share({
        message: 'Check out this link: https://www.google.com',
        url: 'https://www.google.com', // URL a compartir
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity: ', result.activityType);
        } else {
          console.log('Link shared');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header />

      <QRContainer>
        <QRName>
        {t('Referral_program_message')}
        </QRName>

        <QRCodeContainer>
          <QRCode value="https://www.google.com" size={200} />
        </QRCodeContainer>

        {/* <ActionButton onPress={openModal}>
          <Ionicons name="qr-code-outline" size={24} color="#fff" />
          <ActionButtonText>Generate QR</ActionButtonText>
        </ActionButton> */}

        <ActionButton onPress={shareLink}>
          <Ionicons name="share-outline" size={24} color="#fff" />
          <ActionButtonText>{t('Share_Link')}
          </ActionButtonText>
        </ActionButton>

        <QRSubtitle>
        {t('Important_referral_note')}
        </QRSubtitle>

        <TouchableOpacity style={{ marginTop: 25 }} onPress={navigateToHome}>
          <Ionicons name="home-outline" size={28} color="#002368" />
        </TouchableOpacity>
      </QRContainer>

      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
        animationType="fade"
      >
        <ModalContainer>
          <ModalContent>
            <Text style={{ marginBottom: 20, fontSize: 18, fontWeight: 'bold' }}>
              Scan this QR Code
            </Text>
            <QRCode value="https://www.google.com" size={200} />
            
            <CloseButton onPress={closeModal}>
              <CloseButtonText>Close</CloseButtonText>
            </CloseButton>
          </ModalContent>
        </ModalContainer>
      </Modal>
    </SafeAreaView>
  );
};

export default QRScreen;
