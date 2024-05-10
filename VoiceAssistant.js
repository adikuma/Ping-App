import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Audio } from 'expo-av';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import * as Font from 'expo-font';

const VoiceAssistantScreen = () => {
  const [recording, setRecording] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [isMorphing, setIsMorphing] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Load the dot.ttf font
    async function loadFont() {
      await Font.loadAsync({
        'DotFont': require('./assets/dot.ttf') // Adjust the path as needed
      });
      setFontLoaded(true);
    }
    loadFont();
  }, []);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(recording);
      startMorphing();
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    setRecording(null);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    sendAudioToServer(uri);
    stopMorphing();
  };

  const sendAudioToServer = async (audioUri) => {
    const formData = new FormData();
    formData.append('file', {
      uri: audioUri,
      type: 'audio/wav',
      name: 'audio.wav',
    });

    try {
      const response = await fetch('http://192.168.50.240:5000/transcribe', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const result = await response.json();
      if (result.transcription) {
        setTranscription(result.transcription);
      } else if (result.error) {
        console.error('Error:', result.error);
      }
    } catch (err) {
      console.error('Error sending audio:', err);
    }
  };

  const toggleRecording = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const startMorphing = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1600,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopMorphing = () => {
    scaleAnim.stopAnimation();
    rotateAnim.stopAnimation();
  };

  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '0deg'],
  });

  const animatedStyle = {
    transform: [{ scale: scaleAnim }, { rotate: rotateInterpolation }],
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleRecording}>
        <Animated.View style={[styles.blob, animatedStyle]}>
          <BlurView intensity={50} style={styles.blur} />
          <View style={styles.innerBlob}>
            {fontLoaded && (
              <Text style={styles.recordingText}>{recording ? 'Stop' : 'Start'}</Text>
            )}
          </View>
        </Animated.View>
      </TouchableOpacity>
      <Text style={styles.transcription}>{transcription}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  blob: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    position: 'relative',
  },
  blur: {
    flex: 1,
    borderRadius: 100,
  },
  innerBlob: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#D71921',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingText: {
    fontFamily: 'DotFont',
    fontSize: 24,
    color: '#fff',
  },
  transcription: {
    marginTop: 20,
    fontSize: 18,
    color: '#000',
  },
});

export default VoiceAssistantScreen;
