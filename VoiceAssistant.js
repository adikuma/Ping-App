import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Audio } from "expo-av";
import * as Font from "expo-font";
import axios from "axios";

const VoiceAssistantScreen = () => {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recordingRef = useRef(null);
  const navigation = useNavigation();

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
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (error) {
      console.log("Failed to start recording", error);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    await recordingRef.current.stopAndUnloadAsync();
    const uri = recordingRef.current.getURI();
    transcribeAudio(uri);
  };

  const transcribeAudio = async (uri) => {
    try {
        const formData = new FormData();
        formData.append("file", {
            uri,
            name: "audio.wav",
            type: "audio/wav",
        });
        
        const response = await axios.post("http://192.168.50.240:5000/transcribe", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        console.log('Response from server:', response.data);

        const { transcription, task_details } = response.data;

        console.log('Transcription:', transcription);
        console.log('Task Details Received:', task_details);

        setMessages((prevMessages) => [
            ...prevMessages,
            { text: transcription, isUser: true },
            { text: `Task: ${task_details.title}, Due: ${task_details.date}`, isUser: false },
        ]);

        navigation.navigate('Home', { newTask: task_details });
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
    onPress={() => navigation.goBack()}
  >
  <Ionicons name="arrow-back" size={24} color="#fff" />
  </TouchableOpacity>
  {/* <Text style={styles.instructionText}>Talk to the me to set a reminder!</Text> */}
</View>
<View style={styles.line}></View>

      <ScrollView style={styles.messagesContainer}>
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageContainer,
              message.isUser
                ? styles.userMessageContainer
                : styles.assistantMessageContainer,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                message.isUser
                  ? styles.userMessageText
                  : styles.assistantMessageText,
              ]}
            >
              {message.text}
            </Text>
          </View>
        ))}
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
        />
        <TouchableOpacity
          style={styles.recordButton}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Ionicons
            name={isRecording ? "stop" : "mic"}
            size={24}
            color="#000"
          />
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
  instructionText: {
    color: "#888888",
    fontSize: 14,
    fontFamily: "Mona-Sans",
    textAlign: "center",
    alignSelf: 'center',
    justifyContent: 'center', // Center vertically
    flex: 1, 
  },  

  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 10,
    maxWidth: "80%",
  },
  userMessageContainer: {
    alignSelf: "flex-end",
    borderRadius: 10,
    padding: 10,
  },
  assistantMessageContainer: {
    alignSelf: "flex-start",
    borderRadius: 10,
    padding: 10,
  },
  messageText: {
    fontSize: 16,
    fontFamily: "Mona-Sans",
  },
  userMessageText: {
    color: "#F28C28",
  },
  assistantMessageText: {
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    justifyContent: 'space-between', 
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
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F28C28",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton:{
    padding: 10,
    backgroundColor: "#444444",
    borderRadius: 100,
  },
  line: {
    height: 0.5, 
    backgroundColor: '#888888', 
    marginTop: 10,
  },


});

export default VoiceAssistantScreen;
