import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { Audio } from "expo-av";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import * as Font from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const VoiceAssistantScreen = () => {
  const navigation = useNavigation(); // Hook to access navigation
  const [recording, setRecording] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [isMorphing, setIsMorphing] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scalePulseAnim = useRef(new Animated.Value(0)).current;
  const [isTranscriptionVisible, setIsTranscriptionVisible] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        "Mona-Sans": require("./assets/Mona-Sans-Light.ttf"),
        "Mona-Sans-Bold": require("./assets/Mona-Sans-Medium.ttf"),
        DotFont: require("./assets/dot.ttf"),
      });
      setFontLoaded(true);
    }
    loadFonts();
  }, []);
  const startPulsing = () => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scalePulseAnim, {
            toValue: 1.5,
            duration: 1000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scalePulseAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  };

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
      console.error("Failed to start recording", err);
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
    formData.append("file", {
      uri: audioUri,
      type: "audio/wav",
      name: "audio.wav",
    });

    try {
      const response = await fetch("http://192.168.50.240:5000/transcribe", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const result = await response.json();
      if (result.transcription) {
        setTranscription(result.transcription);
        setIsTranscriptionVisible(true); // Show the transcription dialog
      } else if (result.error) {
        console.error("Error:", result.error);
      }
    } catch (err) {
      console.error("Error sending audio:", err);
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
    outputRange: ["0deg", "0deg"],
  });

  const animatedStyle = {
    transform: [{ scale: scaleAnim }, { rotate: rotateInterpolation }],
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="close-circle" size={50} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity onPress={toggleRecording}>
        <View style={styles.pulseContainer}>
          <Animated.View
            style={[
              styles.pulse,
              {
                opacity: opacityAnim,
                transform: [{ scale: scalePulseAnim }],
              },
            ]}
          />
        </View>
        <Animated.View style={[styles.blob, animatedStyle]}>
          <BlurView intensity={50} style={styles.blur} />
          <View style={styles.innerBlob}>
            {fontLoaded && (
              <Text style={styles.recordingText}>
                {recording ? "Stop" : "Start"}
              </Text>
            )}
          </View>
        </Animated.View>
      </TouchableOpacity>
      {isTranscriptionVisible && (
        <View style={styles.transcriptionDialog}>
          <Text style={styles.transcriptionHeader}>Transcription</Text>
          <ScrollView style={styles.transcriptionContent}>
            <Text style={styles.transcriptionText}>{transcription}</Text>
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setIsTranscriptionVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={() => {
                console.log("Submit transcription");
                setIsTranscriptionVisible(false);
              }}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  closeButton: {
    position: "absolute",
    top: 30,
    right: 20,
  },
  blob: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: "hidden",
    position: "relative",
  },
  blur: {
    flex: 1,
    borderRadius: 100,
  },
  innerBlob: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#D71921",
    alignItems: "center",
    justifyContent: "center",
  },
  recordingText: {
    fontFamily: "DotFont",
    fontSize: 24,
    color: "#fff",
  },
  transcription: {
    marginTop: 20,
    fontSize: 18,
    color: "#888888",
    fontFamily: "Mono-Sans",
  },
  transcriptionDialog: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#000",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderColor: "#fff",
    borderWidth: 0.5,
  },
  transcriptionHeader: {
    fontSize: 24,
    color: "#fff",
    marginBottom: 10,
    justifyContent: "left",
    fontFamily: "Mona-Sans-Bold",
  },
  transcriptionContent: {
    width: "100%",
    maxHeight: 100,
  },
  transcriptionText: {
    color: "#FFF",
    fontSize: 14,
    fontFamily: "Mona-Sans",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 100,
    margin: 5,
  },

  cancelButton: {
    backgroundColor: "#FF6347", 
  },
  submitButton: {
    backgroundColor: "#F28C28", 
  },
  buttonText:{
    color: "#fff",
  }
});

export default VoiceAssistantScreen;
