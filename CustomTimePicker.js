import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import moment from "moment";
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const CustomTimePicker = ({ visible, onConfirm, onCancel }) => {
  const [selectedHour, setSelectedHour] = useState(moment().hour() % 12 || 12);
  const [selectedMinute, setSelectedMinute] = useState(moment().minute() - (moment().minute() % 10));
  const [selectedAmPm, setSelectedAmPm] = useState(moment().format("A"));

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 6 }, (_, i) => i * 10);

  const handleConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const hour = selectedAmPm === "AM" ? selectedHour % 12 : (selectedHour % 12) + 12;
    const selectedTime = moment().set({ hour, minute: selectedMinute });
    onConfirm(selectedTime);
  };

  const handleCancel = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    onCancel();
  };

  if (!visible) return null;

  const handleScroll = () => {
    Haptics.selectionAsync();
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel}>
            <Ionicons name="close" size={24} color="#FF6347" style = {styles.cancel}/>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleConfirm}>
            <Ionicons name="checkmark" size={24} color="#F28C28" style = {styles.submit} />
          </TouchableOpacity>
        </View>
        <View style={styles.pickerContainer}>
          <ScrollView 
            style={styles.scrollContainer}
            onScroll={handleScroll}
          >
            {hours.map((hour) => (
              <TouchableOpacity
                key={hour}
                style={[
                  styles.timeItem,
                  selectedHour === hour ? styles.selectedItem : null,
                ]}
                onPress={() => setSelectedHour(hour)}
              >
                <Text
                  style={[
                    styles.timeText,
                    selectedHour === hour ? styles.selectedText : null,
                  ]}
                >
                  {hour}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.separator}>:</Text>
          <ScrollView 
            style={styles.scrollContainer}
            onScroll={handleScroll}
          >
            {minutes.map((minute) => (
              <TouchableOpacity
                key={minute}
                style={[
                  styles.timeItem,
                  selectedMinute === minute ? styles.selectedItem : null,
                ]}
                onPress={() => setSelectedMinute(minute)}
              >
                <Text
                  style={[
                    styles.timeText,
                    selectedMinute === minute ? styles.selectedText : null,
                  ]}
                >
                  {minute < 10 ? `0${minute}` : minute}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.amPmContainer}>
            <TouchableOpacity
              style={[
                styles.amPmItem,
                selectedAmPm === "AM" ? styles.selectedItem : null,
              ]}
              onPress={() => setSelectedAmPm("AM")}
            >
              <Text
                style={[
                  styles.amPmText,
                  selectedAmPm === "AM" ? styles.selectedText : null,
                ]}
              >
                AM
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.amPmItem,
                selectedAmPm === "PM" ? styles.selectedItem : null,
              ]}
              onPress={() => setSelectedAmPm("PM")}
            >
              <Text
                style={[
                  styles.amPmText,
                  selectedAmPm === "PM" ? styles.selectedText : null,
                ]}
              >
                PM
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cancel:{
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 100
  },
  submit:{
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 100
  },
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scrollContainer: {
    height: 200,
    width: 70,
  },
  timeRow: {
    flexDirection: "row",
  },
  timeItem: {
    paddingVertical: 10,
    alignItems: "center",
  },
  timeText: {
    color: "#FFF",
    fontFamily: "Mona-Sans",
    fontSize: 14,
  },
  separator: {
    color: "#FFF",
    fontFamily: "Mona-Sans-Bold",
    fontSize: 14,
    marginHorizontal: 10,
  },
  amPmContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amPmItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  amPmText: {
    color: "#FFF",
    fontFamily: "Mona-Sans",
    fontSize: 14,
  },
  selectedItem: {

  },
  selectedText: {
    color: "#F28C28",
  },
});

export default CustomTimePicker;
