import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

const Circle = () => {
  const rotateAnim = new Animated.Value(0);
  const rotateBeforeAnim = new Animated.Value(0);
  const rotateAfterAnim = new Animated.Value(0);

  React.useEffect(() => {
    startAnimation();
  }, []);

  const startAnimation = () => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 35000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(rotateBeforeAnim, {
        toValue: -2,
        duration: 35000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(rotateAfterAnim, {
        toValue: 2,
        duration: 35000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const rotateBeforeInterpolate = rotateBeforeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-720deg'],
  });

  const rotateAfterInterpolate = rotateAfterAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '720deg'],
  });

  const animatedStyles = {
    bubble: {
      transform: [{ rotate: rotateInterpolate }],
    },
    bubbleBefore: {
      transform: [{ rotate: rotateBeforeInterpolate }],
    },
    bubbleAfter: {
      transform: [{ rotate: rotateAfterInterpolate }],
    },
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.bubble, animatedStyles.bubble]}>
        <Animated.View style={[styles.bubbleBefore, animatedStyles.bubbleBefore]} />
        <Animated.View style={[styles.bubbleAfter, animatedStyles.bubbleAfter]} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'hsl(212, 100%, 91%)',
  },
  bubble: {
    width: '50vmin',
    height: '50vmin',
    backgroundColor: 'hsl(212, 100%, 71%)',
    borderWidth: '4.5vmin',
    borderColor: 'hsl(212, 100%, 81%)',
    borderRadius: '48% 40% 62% 47% / 61% 49% 64% 43%',
    position: 'absolute',
    top: 'calc(50% - 24.5vmin)',
    left: 'calc(50% - 24.5vmin)',
    overflow: 'visible',
    zIndex: 1,
  },
  bubbleBefore: {
    position: 'absolute',
    top: '5vmin',
    left: '5vmin',
    width: 'calc(100% - 15vmin)',
    height: 'calc(100% - 15vmin)',
    backgroundColor: 'hsl(212, 100%, 51%)',
    borderWidth: '3.25vmin',
    borderColor: 'hsl(212, 100%, 61%)',
    borderRadius: '41% 40% 50% 55% / 49% 52% 51% 43%',
    zIndex: -2,
  },
  bubbleAfter: {
    position: 'absolute',
    top: '10vmin',
    left: '10vmin',
    width: 'calc(100% - 25vmin)',
    height: 'calc(100% - 25vmin)',
    backgroundColor: 'hsl(212, 100%, 31%)',
    borderWidth: '2.5vmin',
    borderColor: 'hsl(212, 100%, 41%)',
    borderRadius: '42% 63% 51% 60% / 47% 62% 42% 52%',
  },
});

export default Circle;