import React, { useState, useRef, useEffect } from "react";
import { 
  Text, 
  Image, 
  TouchableOpacity, 
  TextInput, 
  Animated, 
  StatusBar,
  ImageBackground,
  ActivityIndicator,
  View,
  Vibration,
  Alert
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styled from 'styled-components/native';
import { StackNavigationProp } from '@react-navigation/stack'; 
import { RootStackParamList } from '../App'; 
import Signup from "./Signup";
import { useNavigation, useFocusEffect } from '@react-navigation/native';  
import axios from 'axios';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { CheckBox } from 'react-native-elements'; // Asegúrate de instalar esta dependencia o usa el que prefieras

import { t } from "i18next";
import UserSavedCard from "./UserSavedCard/UserSavedCard";
import { useAppContext } from "./AppContext";

const googleIcon = require("../assets/google.png");
const background = require("../assets/volante_ford.jpg");

WebBrowser.maybeCompleteAuthSession();

interface DecodedToken {
  role: string;
}

interface LoginProps {
  navigation: StackNavigationProp<RootStackParamList, 'Login'>;
}

// ios 407124330321-ga4e8juvkib5smbjp3dh5pgecorm0f2f.apps.googleusercontent.com

const CurvedContainer = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 150px;
  background-color: #FFFFFF;
  border-bottom-left-radius: 300px;
  border-bottom-right-radius: 300px;
  align-items: center;
  justify-content: center;
  z-index: 1;
`;

const Logo = styled.Image`
  width: 200px;
  height: 60px;
  resize-mode: contain;
  margin-top: 50px;
`;

const Card = styled.View`
  width: 90%; 
  background-color: white;
  border-radius: 20px;
  padding: 20px;
  align-items: center;
  justify-content: center;
  margin-top: 100px;
`;

const ButtonOptionContainer = styled.View`
  flex-direction: row;
  width: 100%;
  margin-bottom: 20px;
  background-color: #BDBDBD;
  border-radius: 10px;
  padding: 5px;
  position: relative;
`;

const AnimatedSlider = styled(Animated.View)`
  position: absolute;
  top: 5px;
  left: 6px;
  right: 6px;
  width: 50%;
  height: 100%;
  background-color: #002368;
  border-radius: 10px;
`;

const ButtonOption = styled.TouchableOpacity`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding-vertical: 15px;
  z-index: 1;
`;

const SocialButton = styled.TouchableOpacity`
  background-color: #fff;
  border-radius: 10px;
  padding: 5px;
  width: 100%;
  height: 40px;
  justify-content: center;
  align-items: center;
  margin-vertical: 10px;
  flex-direction: row;
  border: 1px solid #BDBDBD;
`;

const InputContainer = styled(Animated.View)`
  flex-direction: row;
  align-items: center;
  background-color: #F6F7FB;
  height: 58px;
  margin-bottom: 20px;
  border-radius: 10px;
  padding-horizontal: 12px;
  width: 100%;
`;

const StyledInput = styled(TextInput)`
  flex: 1;
  font-size: 16px;
  padding-left: 10px;
`;

const Icon = styled(Ionicons)`
  padding-horizontal: 10px;
`;

const ButtonContainer = styled.View`
  align-items: center;
  margin-top: 10px;
  width: 100%;
`;

const RoundedButton = styled(Animated.createAnimatedComponent(TouchableOpacity))`
  background-color: #002368;
  border-radius: 30px;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 60px;
  margin-vertical: 10px;
`;

const RoundedButtonText = styled.Text`
  font-weight: bold;
  color: #fff;
  font-size: 18px;
  border-radius:100px;
`;

const Footer = styled.View`
  margin-top: 20px;
  flex-direction: row;
  align-items: center;
  align-self: center;
`;

const FooterText = styled.Text`
  color: black;
  font-weight: 600;
  font-size: 14px;
`;

const SignUpText = styled.Text`
  color: #002368;
  font-weight: 600;
  font-size: 14px;
`;

const ForgotPasswordText = styled.Text`
  color: #002368;
  font-size: 14px;
  text-decoration: underline;
  align-self: flex-end;
`;

const BackButton = styled.TouchableOpacity`
  position: absolute;
  top: 50px;
  left: 50px;
  background-color: #002368;
  border-radius: 50px;
  padding: 10px;
  z-index: 10;
`;

const ErrorText = styled.Text`
  color: red;
  align-self: flex-start; 
  margin-left: 10px;
  margin-top: -10px;
  margin-bottom: 5px;
`;

function decodeJWT(token: string): DecodedToken | null {
  try {
    const base64Url = token.split('.')[1]; 
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); 
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}



// Función para validar el email
const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Función para validar la contraseña
const validatePassword = (password: string) => {
  return password.length >= 6; // Requerir al menos 6 caracteres
};




export default function Login({ navigation }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isChecked, setIsChecked] = useState(false);
  const { showCards, setShowCards } = useAppContext();
  const [savedUsers, setSavedUsers] = useState<{
    password: string; email: string; logo: string 
}[]>([]);


  const emailShakeAnimation = useRef(new Animated.Value(0)).current;
  const passwordShakeAnimation = useRef(new Animated.Value(0)).current;
  const sliderAnimation = useRef(new Animated.Value(0)).current;


  // Cargar usuarios guardados y limpiar estados al volver
  useFocusEffect(
    React.useCallback(() => {
      const loadSavedUsers = async () => {
        try {
          const storedUsers = await AsyncStorage.getItem("savedUsers");
          const users = storedUsers ? JSON.parse(storedUsers) : [];
  
          // Filtrar usuarios inválidos (sin email, por ejemplo)
          const validUsers = users.filter((user: { email: any; }) => user.email);
          setSavedUsers(validUsers);
  
          // Mostrar tarjetas si hay usuarios guardados
          setShowCards(validUsers.length > 0);
        } catch (error) {
          console.error("Error al cargar usuarios guardados:", error);
        }
      };
  
      loadSavedUsers();
      setEmail(""); // Limpiar el email
      setPassword(""); // Limpiar la contraseña
      setIsChecked(false); // Desactivar el checkbox
    }, [])
  );
  
  // Cargar usuarios guardados
  useEffect(() => {
    const loadSavedUsers = async () => {
      const users = JSON.parse((await AsyncStorage.getItem("savedUsers")) || "[]");
      setSavedUsers(users);
    };
    loadSavedUsers();
  }, []);

  // Iniciar sesión desde la tarjeta

  
  
  

  // Eliminar un usuario guardado
  const handleRemoveUser = async (email: string) => {
    try {
      // Filtrar los usuarios eliminando el que coincide con el email
      const users = savedUsers.filter((user) => user.email !== email);
      await AsyncStorage.setItem("savedUsers", JSON.stringify(users));
      setSavedUsers(users);
  
      // Si ya no hay usuarios guardados, mostrar el formulario de login
      if (users.length === 0) {
        setShowCards(false); // Cambia a false para mostrar el formulario de login
      }
  
      // Limpiar campos del formulario
      setEmail("");
      setPassword("");
      setIsChecked(false); // Desactivar el checkbox
    } catch (error) {
      console.error("Error al eliminar usuario guardado:", error);
    }
  };
  
  
  const handleLogout = async () => {
    setEmail("");
    setPassword("");
    setIsChecked(false); // Desactiva el checkbox
    setShowCards(true); // Muestra las tarjetas
  };
  
  // Guardar credenciales al activar "Guardar sesión"
  const handleRememberMe = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
  
    if (!isEmailValid || !isPasswordValid) {
      setEmailError(!isEmailValid);
      setPasswordError(!isPasswordValid);
  
      if (!isEmailValid) shakeAnimation(emailShakeAnimation);
      if (!isPasswordValid) shakeAnimation(passwordShakeAnimation);
  
      setIsChecked(false);
      return;
    }
  
    try {
      const users = [...savedUsers];
      const existingUser = users.find((user) => user.email === email);
  
      if (existingUser) {
        existingUser.password = password; // Actualiza la contraseña si ya existe
      } else {
        users.push({ email, password, logo: "https://your-logo-url.com/logo.png" });
      }
  
      await AsyncStorage.setItem("savedUsers", JSON.stringify(users));
      setSavedUsers(users);
    } catch (error) {
      console.error("Error al guardar usuario:", error);
    }
  };
  
  

  // Iniciar sesión
  const handleLogin = async (loginEmail: string = email, loginPassword: string = password) => {
    setEmailError(false);
    setPasswordError(false);
  
    const isEmailValid = validateEmail(loginEmail);
    const isPasswordValid = validatePassword(loginPassword);
  
    if (!isEmailValid) {
      setEmailError(true);
      shakeAnimation(emailShakeAnimation);
      return;
    }
  
    if (!isPasswordValid) {
      setPasswordError(true);
      shakeAnimation(passwordShakeAnimation);
      return;
    }
  
    setIsLoading(true);
    try {
      const response = await axios.post("https://api.cabreraapp.alexcode.org/cabrera/login", {
        email: loginEmail,
        password: loginPassword,
      });
  
      const data = response.data;
  
      if (data.token) {
        // Guardar el token en AsyncStorage
        await AsyncStorage.setItem("jwtToken", data.token);
  
        // Redirigir al usuario
        navigation.navigate("PreloaderCircle", { nextScreen: "DrawerNavigator" });
      } else {
        console.error("No se recibió un token válido.");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  
  const handleLoginFromCard = async (email: string) => {
    try {
      const user = savedUsers.find((user) => user.email === email);
  
      if (user) {
        await handleLogin(user.email, user.password || ""); // Pasa los valores explícitamente
      } else {
        console.error("Usuario no encontrado en los perfiles guardados.");
      }
    } catch (error) {
      console.error("Error al iniciar sesión desde la tarjeta:", error);
    }
  };
  
  const refreshToken = async () => {
    const token = await AsyncStorage.getItem('jwtToken');
  
    try {
      const response = await axios.post('https://api.cabreraapp.alexcode.org/cabrera/refresh-token', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.data.token) {
        await AsyncStorage.setItem('jwtToken', response.data.token);
        console.log('Token renovado con éxito');
      }
    } catch (error) {
      console.error('Error al renovar el token:', error);
      Alert.alert('Error', 'Por favor, inicie sesión nuevamente.');
    }
  };
  
  
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const shakeAnimation = (shakeAnimationRef: Animated.Value) => {
    Animated.sequence([
      Animated.timing(shakeAnimationRef, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimationRef, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimationRef, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimationRef, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    Animated.timing(sliderAnimation, {
      toValue: isLogin ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isLogin]);

  const sliderPosition = sliderAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "50%"],
  });

 
    return (
      <ImageBackground source={background} style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <CurvedContainer>
          <Logo source={require("../assets/cabrera.png")} />
        </CurvedContainer>
    
        <BackButton onPress={() => navigation.navigate("Welcome")}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </BackButton>
    
        {showCards ? (
      // Mostrar tarjetas si hay usuarios guardados
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
        {savedUsers.map((user) => (
          <UserSavedCard
            key={user.email}
            user={user}
            onLogin={handleLoginFromCard}
            onRemove={handleRemoveUser}
          />
        ))}
      </View>
      ) : (
          <Card>
            {/* Aquí está el formulario de inicio de sesión */}
            <ButtonOptionContainer>
              <AnimatedSlider style={{ left: sliderPosition }} />
              <ButtonOption onPress={() => setIsLogin(true)}>
                <Text style={{ color: isLogin ? "#fff" : "#000", fontWeight: "bold" }}>{t("log_in")}</Text>
              </ButtonOption>
              <ButtonOption onPress={() => setIsLogin(false)}>
                <Text style={{ color: !isLogin ? "#fff" : "#000", fontWeight: "bold" }}>{t("sign_up")}</Text>
              </ButtonOption>
            </ButtonOptionContainer>
    
            {isLogin ? (
              <>
                {/* Input de email */}
                <Animated.View style={{ transform: [{ translateX: emailShakeAnimation }] }}>
                  <InputContainer style={emailError && { borderColor: "red", borderWidth: 1.5 }}>
                    <Icon name="mail-outline" size={24} color="#888" />
                    <StyledInput
                      placeholder={t("enter_email_or_username_placeholder")}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </InputContainer>
                  {emailError && <ErrorText>{t("email_invalid")}</ErrorText>}
                </Animated.View>
    
                {/* Input de contraseña */}
                <Animated.View style={{ transform: [{ translateX: passwordShakeAnimation }] }}>
                  <InputContainer style={passwordError && { borderColor: "red", borderWidth: 1.5 }}>
                    <Icon name="lock-closed-outline" size={24} color="#888" />
                    <StyledInput
                      placeholder={t("enter_password_placeholder")}
                      autoCapitalize="none"
                      secureTextEntry={!passwordVisible}
                      value={password}
                      onChangeText={setPassword}
                    />
                    <TouchableOpacity onPress={togglePasswordVisibility}>
                      <Ionicons name={passwordVisible ? "eye-outline" : "eye-off-outline"} size={24} color="#888" />
                    </TouchableOpacity>
                  </InputContainer>
                  {passwordError && <ErrorText>{t("password_invalid")}</ErrorText>}
                </Animated.View>
    
                {/* Checkbox y Forgot Password */}
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 10 }}>
                  <CheckBox
                    title={t("remember_me")}
                    checked={isChecked}
                    onPress={async () => {
                      setIsChecked(!isChecked);
                      if (!isChecked) {
                        await handleRememberMe();
                      }
                    }}
                    containerStyle={{ backgroundColor: "transparent", borderWidth: 0, marginLeft: 0, padding: 0 }}
                    textStyle={{ color: "gray" }}
                  />
                  <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
                    <ForgotPasswordText style={{ color: "#000", textDecorationLine: "underline" }}>
                      {t("forgot_password")}
                    </ForgotPasswordText>
                  </TouchableOpacity>
                </View>
    
                {/* Botón de login */}
                <ButtonContainer>
                <RoundedButton onPress={() => handleLogin()}>
  {isLoading ? (
    <ActivityIndicator size="small" color="#FFF" />
  ) : (
    <RoundedButtonText>{t("log_in")}</RoundedButtonText>
  )}
</RoundedButton>

                </ButtonContainer>
              </>
            ) : (
              <Signup />
            )}
    
            <Footer>
              <FooterText>{isLogin ? t("dont_have_account") : t("already_have_account")}</FooterText>
              <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                <SignUpText>{isLogin ? t("sign_up") : t("log_in")}</SignUpText>
              </TouchableOpacity>
            </Footer>
          </Card>
        )}
        <StatusBar barStyle="dark-content" />
      </ImageBackground>
    );
    

}

