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
  Vibration
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
  width: 250px;
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
  left: 20px;
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

  const emailShakeAnimation = useRef(new Animated.Value(0)).current;
  const passwordShakeAnimation = useRef(new Animated.Value(0)).current;

  const sliderAnimation = useRef(new Animated.Value(0)).current;

  // Google Auth setup
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: '407124330321-ga4e8juvkib5smbjp3dh5pgecorm0f2f.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    if (response?.type === 'success' && response.authentication) {
      const { accessToken } = response.authentication;
      fetchUserInfo(accessToken);
    }
  }, [response]);
  

  const fetchUserInfo = async (token: string) => {
    let response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const user = await response.json();
    await AsyncStorage.setItem('userInfo', JSON.stringify(user));
    console.log('User Info:', user);
  };

  const shakeAnimation = (shakeAnimationRef: Animated.Value) => {
    Animated.sequence([
      Animated.timing(shakeAnimationRef, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimationRef, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimationRef, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimationRef, { toValue: 0, duration: 100, useNativeDriver: true })
    ]).start();
  };

  useFocusEffect(
    React.useCallback(() => {
      setEmail(""); 
      setPassword(""); 
    }, [])
  );

  useEffect(() => {
    Animated.timing(sliderAnimation, {
      toValue: isLogin ? 0 : 1, 
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isLogin]);

  const sliderPosition = sliderAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '50%'],
  });

  const handleLogin = async () => {
    setEmailError(false);
    setPasswordError(false);
  
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
  
    if (!isEmailValid) {
      setEmailError(true);
      shakeAnimation(emailShakeAnimation);
    }
  
    if (!isPasswordValid) {
      setPasswordError(true);
      shakeAnimation(passwordShakeAnimation);
    }
  
    if (isEmailValid && isPasswordValid) {
      setIsLoading(true);
      try {
        const response = await axios.post('http://localhost:3000/login', {
          email,
          password
        });
  
        const data = response.data;
  
        if (data.token) {
          // Guardar el token en AsyncStorage
          await AsyncStorage.setItem('jwtToken', data.token);
          console.log("Token guardado correctamente en AsyncStorage");
  
          const token = await AsyncStorage.getItem('jwtToken');
          if (token) {
            const decodedToken = decodeJWT(token);
            setIsLoading(false);
  
            if (decodedToken) {
              const nextScreen = decodedToken.role === 'admin' ? 'Admin' : 'DrawerNavigator';
              navigation.navigate('PreloaderCircle', { nextScreen }); // Redirige a PreloaderCircle con la pantalla siguiente
            }
          }
        } else {
          setIsLoading(false);
          setEmailError(true);
          setPasswordError(true);
          shakeAnimation(emailShakeAnimation);
          shakeAnimation(passwordShakeAnimation);
        }
      } catch (err) {
        setIsLoading(false);
        const error = err as any; // Conversión explícita
        if (error.response && error.response.status === 401) {
          // Error de credenciales incorrectas (usuario no encontrado o contraseña incorrecta)
          setEmailError(true);
          setPasswordError(true);
          shakeAnimation(emailShakeAnimation);
          shakeAnimation(passwordShakeAnimation);
          // console.error("Credenciales incorrectas");
        } else {
          console.error("Error en el inicio de sesión:", error);
        }
      }
    }
  };
  
  

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <ImageBackground source={background} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <CurvedContainer>
        <Logo source={require('../assets/cabrera.png')} />
      </CurvedContainer>
      
      <BackButton onPress={() => navigation.navigate('Welcome')}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </BackButton>

      <Card>
        <ButtonOptionContainer>
          <AnimatedSlider style={{ left: sliderPosition }} />

          <ButtonOption onPress={() => setIsLogin(true)}>
            <Text style={{ color: isLogin ? "#fff" : "#000", fontWeight: "bold" }}>Log in</Text>
          </ButtonOption>

          <ButtonOption onPress={() => setIsLogin(false)}>
            <Text style={{ color: !isLogin ? "#fff" : "#000", fontWeight: "bold" }}>Sign Up</Text>
          </ButtonOption>
        </ButtonOptionContainer>

        {isLogin ? (
          <>
            {/* <SocialButton onPress={() => promptAsync()}>
              <Image source={googleIcon} style={{ width: 20, height: 20, marginRight: 5 }} />
              <Text style={{ fontSize: 14 }}>Continue with Google</Text>
            </SocialButton> */}

            <Animated.View style={{ transform: [{ translateX: emailShakeAnimation }] }}>
              <InputContainer style={emailError && { borderColor: 'red', borderWidth: 1.5 }}>
                <Icon name="mail-outline" size={24} color="#888" />
                <StyledInput
                  placeholder="Enter email or username"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </InputContainer>
              {emailError && <ErrorText>Email invalid</ErrorText>}
            </Animated.View>

            <Animated.View style={{ transform: [{ translateX: passwordShakeAnimation }] }}>
              <InputContainer style={passwordError && { borderColor: 'red', borderWidth: 1.5 }}>
                <Icon name="lock-closed-outline" size={24} color="#888" />
                <StyledInput
                  placeholder="Enter password"
                  autoCapitalize="none"
                  secureTextEntry={!passwordVisible}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={togglePasswordVisibility}>
                  <Ionicons name={passwordVisible ? "eye-outline" : "eye-off-outline"} size={24} color="#888" />
                </TouchableOpacity>
              </InputContainer>
              {passwordError && <ErrorText>Password invalid</ErrorText>}
            </Animated.View>

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <ForgotPasswordText>Forgot Password?</ForgotPasswordText>
            </TouchableOpacity>
            <ButtonContainer>
              <RoundedButton onPress={handleLogin}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <RoundedButtonText>Log in</RoundedButtonText>
                )}
              </RoundedButton>
            </ButtonContainer>
          </>
        ) : (
          <Signup />
        )}

        <Footer>
          <FooterText>{isLogin ? "Don't have an account? " : "Already have an account? "}</FooterText>
          <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
            <SignUpText>{isLogin ? "Sign Up" : "Log in"}</SignUpText>
          </TouchableOpacity>
        </Footer>
      </Card>
      <StatusBar barStyle="dark-content" />
    </ImageBackground>
  );
}
