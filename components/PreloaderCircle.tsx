import React, { useEffect } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

const PreloaderCircle = () => {
  const rotation = new Animated.Value(0);
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: { nextScreen: string } }, 'params'>>();

  useEffect(() => {
    // Animación de rotación
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Redirección a la pantalla especificada en `nextScreen`
    const timeoutId = setTimeout(() => {
      navigation.navigate(route.params.nextScreen as never);
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [navigation, route.params.nextScreen, rotation]);

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          transform: [{ rotate: rotateInterpolate }],
        }}
      >
        <View style={styles.svgContainer}>
          <View style={styles.circle} />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  svgContainer: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 8,
    borderColor: '#002368',
    borderStyle: 'solid',
    borderTopColor: 'transparent',
    borderRightColor: '#002368',
    borderBottomColor: '#002368',
    borderLeftColor: '#002368',
    shadowColor: '#002368',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
});

export default PreloaderCircle;