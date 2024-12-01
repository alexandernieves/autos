import React, { useState, useEffect } from 'react';
import { Dimensions, Animated, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';

// Obtener dimensiones de la pantalla
const { width, height } = Dimensions.get('window');

// Selección dinámica de imágenes según el dispositivo
const getImages = () => {
  if (width >= 1024) {
    // iPad
    return [
      require('../assets/ram_2500_power_wagon_ipad.jpg'),
      require('../assets/hyundai_elantra_ipad.jpg'),
      require('../assets/ford_raptor_autumn_ipad.jpg'),
      require('../assets/ford_raptor_forest_ipad.jpg'),
      require('../assets/ram_2500_power_wagon_ipad.jpg'),
    ];
  } else {
    // iPhone
    return [
      require('../assets/ram_2500_power_wagon.jpg'),
      require('../assets/hyundai_elantra.jpg'),
      require('../assets/ford_raptor_autumni.jpg'),
      require('../assets/ford_raptor_foresty.jpg'),


    ];
  }
};

// Proporciones para tamaños responsivos
const textFontSize = width * 0.045; // Tamaño del texto dinámico
const spinnerBottomMargin = height * 0.08; // Margen inferior dinámico

const ImagePreloaderContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #002368;
`;

const SpinnerContainer = styled.View`
  position: absolute;
  bottom: ${spinnerBottomMargin}px;
  align-items: center;
  flex-direction: row;
`;

const LoadingText = styled.Text`
  color: #fff;
  margin-left: 10px;
  font-size: ${textFontSize}px;
`;

const StyledImage = styled(Animated.Image)`
  width: 100%;
  aspect-ratio: 1.5; /* Ajusta la relación de aspecto según la imagen */
  resize-mode: contain;
  opacity: 0.75;
`;

const CustomSpinner = () => (
  <SpinnerContainer>
    <ActivityIndicator size="large" color="#fff" />
    <LoadingText>Loading</LoadingText>
  </SpinnerContainer>
);

const ImagePreloader: React.FC<{ onFinish?: () => void }> = ({ onFinish }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const opacity = useState(new Animated.Value(0.75))[0];
  const [hasPreloadFinished, setHasPreloadFinished] = useState(false);
  const images = getImages();

  useEffect(() => {
    const preloaderTimeout = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setHasPreloadFinished(true);
        if (onFinish) {
          onFinish();
        }
      });
    }, 10000); // Mantener el preloader durante 10 segundos

    return () => clearTimeout(preloaderTimeout);
  }, [onFinish, opacity]);

  useEffect(() => {
    const imageCycleTimeout = setTimeout(() => {
      if (currentImageIndex < images.length - 1) {
        setCurrentImageIndex(currentImageIndex + 1);
      } else {
        setCurrentImageIndex(0);
      }
    }, 2000); // Mostrar cada imagen durante 2 segundos

    return () => clearTimeout(imageCycleTimeout);
  }, [currentImageIndex, images]);

  if (hasPreloadFinished) {
    return null;
  }

  return (
    <ImagePreloaderContainer>
      <StyledImage source={images[currentImageIndex]} style={{ opacity }} />
      <CustomSpinner />
    </ImagePreloaderContainer>
  );
};

export default ImagePreloader;
