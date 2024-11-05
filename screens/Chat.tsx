import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { GiftedChat, IMessage, InputToolbar } from 'react-native-gifted-chat';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';  // Para hacer peticiones a la API
const jwtDecode = require('jwt-decode');
import colors from '../colors';
import { RootStackParamList } from '../App';

type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Chat'>;

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [user, setUser] = useState<any>(null);  // Información del usuario autenticado
  const navigation = useNavigation<ChatScreenNavigationProp>();

  // Obtener la información del usuario desde AsyncStorage
  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem('jwtToken');
      if (token) {
        try {
          // Decodificar el token usando jwtDecode
          const decodedToken = jwtDecode(token);
          setUser(decodedToken);
        } catch (error) {
          console.error('Error verificando la autenticación:', error);
          navigation.replace('Login'); // Redirigir al login si hay un problema con el token
        }
      } else {
        navigation.replace('Login');
      }
    };
    fetchUser();
  }, []);

  const onSignOut = async () => {
    try {
      // Limpiar el token JWT de AsyncStorage
      await AsyncStorage.removeItem('jwtToken');
      navigation.replace('Login');
    } catch (error) {
      console.log('Error logging out: ', error);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 10 }}
          onPress={onSignOut}
        >
          <AntDesign name="logout" size={24} color={colors.gray} />
        </TouchableOpacity>
      )
    });
  }, [navigation]);

  // Cargar mensajes desde el servidor
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get('https://api.cabreraapp.alexcode.org/cabrera/messages'); // Reemplaza con la URL de tu API
        const formattedMessages = response.data.map((msg: any) => ({
          _id: msg._id,
          text: msg.text,
          createdAt: new Date(msg.createdAt),
          user: {
            _id: msg.userId,
            name: msg.userName,
            avatar: msg.userAvatar || 'https://i.pravatar.cc/300'
          }
        }));
        setMessages(formattedMessages);
      } catch (error) {
        console.log('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, []);

  // Enviar mensaje al servidor
  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, newMessages)
    );
    const { _id, createdAt, text, user } = newMessages[0];
    try {
      await axios.post('https://api.cabreraapp.alexcode.org/cabrera/messages', {
        _id,
        createdAt,
        text,
        userId: user._id,
        userName: user.name,
        userAvatar: user.avatar
      });
    } catch (error) {
      console.log("Error sending message: ", error);
    }
  }, []);

  const renderInputToolbar = (props: any) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={styles.inputToolbar}
      />
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <GiftedChat
        messages={messages}
        showAvatarForEveryMessage={false}
        showUserAvatar={false}
        onSend={messages => onSend(messages)}
        messagesContainerStyle={{
          backgroundColor: '#fff'
        }}
        renderInputToolbar={renderInputToolbar}
        user={{
          _id: user?.id || '',  // El ID del usuario autenticado
          name: user?.name || 'Unknown',
          avatar: 'https://i.pravatar.cc/300'  // Puedes ajustar esto según tu lógica
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputToolbar: {
    backgroundColor: '#fff',
    borderRadius: 20,
    margin: 8,
  },
});

export default Chat;
