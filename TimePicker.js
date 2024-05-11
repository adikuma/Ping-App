import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const TimePicker = ({ onTimeChange }) => {
  const [time, setTime] = useState(new Date());

  const onChange = (event, selectedTime) => {
    if (selectedTime) {
      setTime(selectedTime);
      onTimeChange(selectedTime);
    }
  };
  const [showPicker, setShowPicker] = useState(false);

  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  return (
    <DateTimePicker
      value={time}
      mode="time"
      is24Hour={false}
      display="default"
      onChange={onChange}
    />
  );
};

const styles = StyleSheet.create({
  timeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default TimePicker;