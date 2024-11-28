import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Para almacenar y recuperar el token
import styled from 'styled-components/native';
import Header from './Header';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SettingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const Footer = styled.View`
  position: absolute;
  bottom: 40px;
  width: 100%;
  align-items: center;
  padding: 10px;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: #002368;
  text-align: center;
  margin-top: 10px;
`;

const DeleteButton = styled.TouchableOpacity`
  background-color: #ff4d4d;
  padding: 15px 30px;
  border-radius: 5px;
`;

const DeleteButtonText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
`;

const Setting: React.FC = ({ navigation }: any) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Recuperar el token del almacenamiento seguro
  useEffect(() => {
    const getToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('jwtToken'); // Usa 'jwtToken' que se usa en Login.tsx
        if (storedToken) {
          const tokenWithBearer = `Bearer ${storedToken}`; // Prefija con 'Bearer'
          setToken(tokenWithBearer);
          console.log('Token recuperado desde AsyncStorage:', tokenWithBearer); // Imprimir el token
        } else {
          console.error('Token no encontrado en AsyncStorage');
        }
      } catch (error) {
        console.error('Error al recuperar el token:', error);
      }
    };
    getToken();
  }, []);

  const handleDeleteAccount = async () => {
    if (!token) {
      Alert.alert('Error', 'No se encontró el token de usuario.');
      return;
    }
  
    console.log('Token enviado al servidor:', token); // Imprime el token para verificar
  
    setLoading(true);
  
    try {
      const response = await fetch(
        'https://api.cabreraapp.alexcode.org/cabrera/delete-account',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token, // Enviar el token en el header
          },
        }
      );
  
      if (response.ok) {
        Alert.alert('Cuenta Eliminada', 'Tu cuenta ha sido eliminada exitosamente.');
        await AsyncStorage.removeItem('jwtToken'); // Eliminar el token
        navigation.navigate('Welcome'); // Navegar a la pantalla de bienvenida
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'No se pudo eliminar la cuenta.');
      }
    } catch (error) {
      console.error('Error al eliminar la cuenta:', error);
      Alert.alert('Error', 'Ocurrió un problema al intentar eliminar tu cuenta.');
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9f9f9' }}>
      {/* Encabezado */}
      <Header />

      {/* Título debajo del encabezado */}
      <Title>Settings</Title>

      {/* Contenedor principal */}
      <SettingContainer>
        {/* Botón de Eliminar cuenta centrado */}
        <DeleteButton onPress={() => setModalVisible(true)}>
          <DeleteButtonText>Delete Account</DeleteButtonText>
        </DeleteButton>
      </SettingContainer>

      {/* Footer con la casita */}
      <Footer>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home-outline" size={28} color="#002368" />
        </TouchableOpacity>
      </Footer>

      {/* Modal de confirmación */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Are you sure you want to delete your account?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleDeleteAccount}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ccc',
    padding: 12,
    borderRadius: 5,
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    textAlign: 'center',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#ff4d4d',
    padding: 12,
    borderRadius: 5,
    marginLeft: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Setting;
