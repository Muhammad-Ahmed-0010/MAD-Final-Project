import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

// Placeholder logo component
const Logo: React.FC = () => {
  return (
    <View style={styles.logoContainer}>
      <View style={[styles.logoIcon, { backgroundColor: '#fffff' }]}>
        <Image source={require('../assets/logo.png')} 
          style={styles.logoImage} 
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

// Custom Loader to mimic CSS animation
const MatrixLoader: React.FC = () => {
  const translateY1 = useRef(new Animated.Value(0)).current;
  const translateY2 = useRef(new Animated.Value(0)).current;
  const translateY3 = useRef(new Animated.Value(0)).current;

  const animate = (anim: Animated.Value, delay: number) => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: -40,
          duration: 1000,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    animate(translateY1, 0);
    animate(translateY2, 200);
    animate(translateY3, 400);
  }, []);

  return (
    <View style={styles.loaderContainer}>
      {[translateY1, translateY2, translateY3].map((translateY, index) => (
        <Animated.View
          key={index}
          style={[
            styles.loaderBar,
            {
              transform: [{ translateY }],
              backgroundColor: index % 2 === 0 ? '#5DB872' : '#2F93AB',
            },
          ]}
        />
      ))}
    </View>
  );
};

const SplashScreen: React.FC = () => {
  const { isPinSet, isAuthenticated } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isPinSet) {
        navigation.navigate('SetupPIN' as never);
      } else if (!isAuthenticated) {
        navigation.navigate('PIN' as never);
      } else {
        navigation.navigate('Main' as never);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [isPinSet, isAuthenticated, navigation]);

  return (
    <View style={[styles.container]}>
      <Logo />
      <MatrixLoader />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIconText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loaderContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: 40,
  },
  loaderBar: {
    width: 10,
    height: 30,
    marginHorizontal: 5,
    borderRadius: 2,
  },
  logoImage: {
    width: 300,
    height: 300,
    borderRadius: 40,
    marginBottom: 250,
  },
});

export default SplashScreen;
