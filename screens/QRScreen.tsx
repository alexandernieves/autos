import React, { useState } from 'react';
import {
  TouchableOpacity,
  SafeAreaView,
  View,
  Text,
  Share,
  Alert,
  Clipboard,
  StyleSheet,
} from 'react-native';
import Header from './Header';
import QRCode from 'react-native-qrcode-svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

const QRScreen: React.FC = ({ navigation }: any) => {
  const [isCopied, setIsCopied] = useState(false);
  const { t } = useTranslation();
  const qrLink = 'https://www.google.com';

  const copyToClipboard = () => {
    Clipboard.setString(qrLink);
    setIsCopied(true); // Cambiar el ícono a check
    setTimeout(() => setIsCopied(false), 2000); // Volver al portapapeles después de 2 segundos
  };

  const shareLink = async () => {
    try {
      const result = await Share.share({
        message: `Check out this link: ${qrLink}`,
        url: qrLink,
      });

      if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <View style={styles.qrContainer}>
        <Text style={styles.qrName}>{t('Referral_program_message')}</Text>

        <View style={styles.qrCodeContainer}>
          <QRCode value={qrLink} size={200} />
        </View>

        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>{qrLink}</Text>
          <TouchableOpacity onPress={copyToClipboard}>
            <Ionicons
              name={isCopied ? 'checkmark-circle-outline' : 'copy-outline'} // Alternar íconos
              size={24}
              color={isCopied ? '#4caf50' : '#002368'} // Cambiar color según el estado
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.actionButton} onPress={shareLink}>
          <Ionicons name="share-outline" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>{t('Share_Link')}</Text>
        </TouchableOpacity>

        <Text style={styles.qrSubtitle}>{t('Important_referral_note')}</Text>

        <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home-outline" size={28} color="#002368" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  qrContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 20,
  },
  qrName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#002368',
    marginBottom: 10,
    textAlign: 'center',
  },
  qrCodeContainer: {
    width: 240,
    height: 240,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6e6e6',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    width: '90%',
    justifyContent: 'space-between',
  },
  linkText: {
    fontSize: 14,
    color: '#444',
    flex: 1,
    marginRight: 10,
  },
  actionButton: {
    width: '80%',
    backgroundColor: '#002368',
    borderRadius: 10,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  qrSubtitle: {
    fontSize: 16,
    color: '#444',
    marginTop: 25,
    textAlign: 'center',
    lineHeight: 22,
  },
  homeButton: {
    marginTop: 25,
  },
});

export default QRScreen;
