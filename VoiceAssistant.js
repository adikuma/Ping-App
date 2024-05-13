import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Vibration,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Audio } from "expo-av";
import * as Font from "expo-font";
import axios from "axios";
import PulsingWaves from "./PulsingWave";
import AsyncStorage from '@react-native-async-storage/async-storage';

const VoiceAssistantScreen = () => {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recordingRef = useRef(null);
  const navigation = useNavigation();
  const [currentMessage, setCurrentMessage] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const animateText = (text) => {
    const words = text.split(" ");
    let localIndex = 0;
    setCurrentMessage("");
    setIsAnimating(true);

    const intervalId = setInterval(() => {
      if (localIndex < words.length) {
        setCurrentMessage((prev) => prev + words[localIndex] + " ");
        localIndex++;
      } else {
        clearInterval(intervalId);
        setIsAnimating(false);
        setWordIndex(0);
      }
    }, 100);
  };

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

  const handleSend = () => {
    if (inputText.trim() !== "") {
      setMessages([...messages, { text: inputText, isUser: true }]);
      setInputText("");
      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: "Hello, I'm here and ready to help!", isUser: false },
        ]);
      }, 500);
    }
    Keyboard.dismiss();
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);

      // Start pulsing vibration
      const intervalId = setInterval(() => {
        Vibration.vibrate(100);
      }, 1000);

      // Store the interval ID to clear it later
      recordingRef.current.vibrationIntervalId = intervalId;
    } catch (error) {
      console.log("Failed to start recording", error);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    await recordingRef.current.stopAndUnloadAsync();
    const uri = recordingRef.current.getURI();
    transcribeAudio(uri);

    clearInterval(recordingRef.current.vibrationIntervalId);
  };

  
  const updateTasksInStorage = async (newTask) => {
    try {
      const storedTasks = await AsyncStorage.getItem('tasks');
      const tasks = storedTasks ? JSON.parse(storedTasks) : {};
  
      const taskDate = newTask.date; // Ensure the date is in "DD/MM/YYYY" format
      if (!tasks[taskDate]) {
        tasks[taskDate] = [];
      }
      tasks[taskDate].push(newTask);
  
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save the new task:', error);
    }
  };


  const transcribeAudio = async (uri) => {
    try {
      const formData = new FormData();
      formData.append("file", { uri, name: "audio.wav", type: "audio/wav" });
  
      const response = await axios.post("http://192.168.50.240:5000/transcribe", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Response from server:", response.data);
  
      const { transcription, task_details } = response.data;
      setMessages((prevMessages) => [...prevMessages, { text: transcription, isUser: true }]);
      animateText(transcription);
  
      updateTasksInStorage(task_details);
      setTimeout(() => {
        navigation.navigate("Home", { newTask: task_details });
      }, 5000);
  
    } catch (error) {
      console.error("Transcription error", error);
    }
  };
  
  if (!fontLoaded) {
    return null;
  }


  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            Vibration.vibrate(50);
            navigation.goBack();
          }}        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        {/* <Text style={styles.instructionText}>Talk to the me to set a reminder!</Text> */}
      </View>

      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContentContainer}
      >
        <Text style={styles.messageText}>{currentMessage}</Text>
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor="#888"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
          onFocus={() => Vibration.vibrate(50)}
        />
        <TouchableOpacity
          style={styles.recordButton}
          onPress={() => {
            Vibration.vibrate(50);
            isRecording ? stopRecording() : startRecording();
          }}
        >
          <Ionicons
            name={isRecording ? "stop" : "mic"}
            size={24}
            color="#000"
          />
          {isRecording && <PulsingWaves />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 16,
    paddingTop: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  messagesContainer: {
    flex: 1,
    paddingLeft: 16,
  },
  messagesContentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  messageText: {
    fontSize: 24,
    fontFamily: "Mona-Sans",
    color: "#FFF",
    textAlign: "left",
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderTopWidth: 1,
    justifyContent: "space-between",
  },
  input: {
    flex: 1,
    backgroundColor: "#000",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    color: "#fff",
    fontFamily: "Mona-Sans",
    fontSize: 14,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 100,
    backgroundColor: "#F28C28",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    padding: 10,
    backgroundColor: "#444444",
    borderRadius: 100,
  },
});
export default VoiceAssistantScreen;
