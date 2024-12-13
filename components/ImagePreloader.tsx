import React, { useState, useRef, useEffect } from 'react';
import {
  Dimensions,
  ScrollView,
  Animated,
  View,
  Text,
} from 'react-native';
import styled from 'styled-components/native';
import ReactDOM from 'react-dom/client'; // Importa ReactDOM correctamente

const { width, height } = Dimensions.get('window');

// Selección dinámica de imágenes según el dispositivo
const getImages = () => {
  if (width >= 1024) {
    return [
      require('../assets/ram_2500_power_wagon_ipad.jpg'),
      require('../assets/hyundai_elantra_ipad.jpg'),
      require('../assets/ford_raptor_autumn_ipad.jpg'),
      require('../assets/ford_raptor_forest_ipad.jpg'),
    ];
  } else {
    return [
      require('../assets/ram_2500_power_wagon.jpg'),
      require('../assets/hyundai_elantra.jpg'),
      require('../assets/ford_raptor_autumni.jpg'),
      require('../assets/ford_raptor_foresty.jpg'),
    ];
  }
};

const ImageSliderContainer = styled.View`
  flex: 1;
  background-color: #002368;
`;

const StyledImageBackground = styled.ImageBackground`
  width: ${width}px;
  height: ${height}px;
`;

const CircularIndicator = styled.View`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background-color: #ffffffaa;
  justify-content: center;
  align-items: center;
  position: absolute;
  bottom: 60px;
  align-self: center;
`;

const DotsContainer = styled.View`
  position: absolute;
  bottom: 20px;
  width: 100%;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const Dot = styled.View`
  width: 15px;
  height: 5px;
  margin: 0 5px;
  border-radius: 2.5px;
  background-color: ${(props: { active: boolean }) => (props.active ? '#ffffff' : '#555555')};
`;

interface ImageSliderProps {
  onFinish?: () => void;
}

const ImageSlider: React.FC<ImageSliderProps> = ({ onFinish }) => {
  const images = getImages();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [opacity] = useState(new Animated.Value(0.75));
  const [fadeOutOpacity] = useState(new Animated.Value(1));
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentIndex < images.length - 1) {
        scrollViewRef.current?.scrollTo({ x: (currentIndex + 1) * width, animated: true });
        setCurrentIndex((prevIndex) => prevIndex + 1);
      } else {
        clearInterval(interval);
        Animated.sequence([
          Animated.timing(fadeOutOpacity, {
            toValue: 0,
            duration: 300, // Reducción de la duración
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200, // Reducción de la duración
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (onFinish) onFinish();
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [currentIndex, onFinish, opacity, fadeOutOpacity]);

  return (
    <ImageSliderContainer>
      <Animated.View style={{ flex: 1, opacity: fadeOutOpacity }}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
        >
          {images.map((image, index) => (
            <StyledImageBackground key={index} source={image} resizeMode="cover" />
          ))}
        </ScrollView>
        <DotsContainer>
          {images.map((_, index) => (
            <Dot key={index} active={currentIndex === index} />
          ))}
        </DotsContainer>
      </Animated.View>
      <Animated.View style={{ opacity }}>
        <CircularIndicator>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#002368' }}>
            {currentIndex === images.length - 1 ? 'GO!' : images.length - currentIndex}
          </Text>
        </CircularIndicator>
      </Animated.View>
    </ImageSliderContainer>
  );
};

export default ImageSlider;