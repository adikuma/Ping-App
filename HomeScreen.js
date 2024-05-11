import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  RefreshControl,
} from "react-native";
import * as Font from "expo-font";
import moment from "moment";
import { Ionicons } from "@expo/vector-icons";

const HomeScreen = () => {
  const [fontLoaded, setFontLoaded] = useState(false);
  const today = new Date();
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const calculateTimeLeft = (startTime) => {
    const currentTime = moment();
    const startTimeMoment = moment(startTime, "h:mm A");
    const duration = moment.duration(startTimeMoment.diff(currentTime));

    if (duration.asMilliseconds() <= 0) {
      return "Incomplete";
    }

    const hours = duration.hours();
    const minutes = duration.minutes();

    if (hours === 0) {
      return `${minutes} min`;
    } else if (minutes === 0) {
      return `${hours} hr`;
    } else {
      return `${hours} hr ${minutes} min`;
    }
  };

  const days = [];
  for (let i = 0; i <= 10; i++) {
    const day = new Date(today);
    day.setDate(today.getDate() + i);
    days.push({
      weekday: day.toLocaleString("en-US", { weekday: "long" }),
      date: day.getDate(),
      isToday: i === 0,
    });
  }

  const [tasks, setTasks] = useState({
    [today.getDate()]: [
      {
        id: 1,
        title: "Robin Buenos",
        subtitle: "Create personas through user research and data",
        startTime: "2:00 PM", // Example time
        progress: "89%",
        done: false,
        timeLeft: "2 hours",
      },
      {
        id: 2,
        title: "John De Palace",
        subtitle: "Developing wireframes and task flows based on user needs",
        startTime: "1:00 PM", // Example time
        progress: "100%",
        done: false,
        timeLeft: "3 hours",
      },
      {
        id: 1,
        title: "Birthday party",
        subtitle: "Create personas through user research and data",
        startTime: "4:00 PM", // Example time
        progress: "89%",
        done: false,
        timeLeft: "2 hours",
      },
    ],
  });

  const [borderAnimations, setBorderAnimations] = useState({});
  const getAnimatedValue = (id) => {
    if (!borderAnimations[id]) {
      const animatedValue = new Animated.Value(0);
      setBorderAnimations((prev) => ({ ...prev, [id]: animatedValue }));
      return animatedValue;
    }
    return borderAnimations[id];
  };

  const animateBorder = (id, toValue) => {
    const animatedValue = getAnimatedValue(id);
    Animated.timing(animatedValue, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleRemoveTask = (day, id) => {
    const updatedTasks = { ...tasks };
    updatedTasks[day] = updatedTasks[day].filter((task) => task.id !== id);
    setTasks(updatedTasks);
  };

  const handleMarkDone = (day, id) => {
    const updatedTasks = { ...tasks };
    updatedTasks[day] = updatedTasks[day].map((task) => {
      if (task.id === id) {
        const newDoneState = !task.done;
        animateBorder(id, newDoneState ? 1 : 0);
        return { ...task, done: newDoneState };
      }
      return task;
    });
    setTasks(updatedTasks);
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

  if (!fontLoaded) {
    return <View />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.hello}>Hello Aditya,</Text>
        <TouchableOpacity>
          <Ionicons
            name="add"
            size={24}
            color="#FFFFFF"
            style={styles.plusButton}
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.greeting}>Your task today is almost complete!</Text>

      {/* Days Bar */}
      <View style={{ height: 90 }}>
        <ScrollView
          horizontal
          style={styles.daysScroll}
          showsHorizontalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {days.map((day, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedDay(day.date)}
            >
              <View
                style={[
                  styles.dayContainer,
                  selectedDay === day.date
                    ? styles.selectedDayContainer
                    : styles.unselectedDayContainer,
                ]}
              >
                <Text
                  style={[
                    styles.day,
                    selectedDay === day.date
                      ? styles.selectedDayText
                      : styles.unselectedDayText,
                  ]}
                >
                  {day.date}
                </Text>
                <Text style={styles.dayLabel}>{day.weekday}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Task Cards */}
      <ScrollView style={styles.cardsContainer}>
        {(tasks[selectedDay] || []).map((task, index) => {
          const borderColor = getAnimatedValue(task.id).interpolate({
            inputRange: [0, 1],
            outputRange: ["white", "#87FF21"],
          });
          const timeLeft = calculateTimeLeft(task.startTime);
          const isTimeMissed = timeLeft === "Incomplete";
          return (
            <Animated.View
              key={index}
              style={[
                styles.taskCard,
                { borderColor: borderColor, borderWidth: 0.5 },
              ]}
            >
              {/* Delete Button */}
              <View style={styles.taskHeader}>
                <View style={styles.startTimeContainer}>
                  <Text style={styles.taskStart}>{task.startTime}</Text>
                </View>
                {/* Delete Button */}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleRemoveTask(selectedDay, task.id)}
                >
                  <Ionicons name="close" size={20} color="#FF6347" />
                </TouchableOpacity>
              </View>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskSubtitle}>{task.subtitle}</Text>
              <View style={styles.taskDetails}>
                <Text
                  style={[
                    styles.taskTime,
                    isTimeMissed ? styles.taskTimeMissed : styles.taskTimeLeft,
                  ]}
                >
                  {timeLeft}
                </Text>
                <Text style={styles.taskProgress}>{task.progress}</Text>
                {/* Done Button */}
                <TouchableOpacity
                  style={[
                    styles.doneButton,
                    task.done ? styles.doneButtonGreen : {},
                  ]}
                  onPress={() => handleMarkDone(selectedDay, task.id)}
                >
                  <Text style={styles.doneButtonText}>
                    {task.done ? "Undo" : "Done"}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: {
    color: "#FFFFFF",
    fontSize: 42,
    fontFamily: "Mona-Sans-Light",
  },
  daysScroll: {
    paddingVertical: 15,
  },
  dayContainer: {
    alignItems: "flex-start",
    marginRight: 25,
    paddingBottom: 10,
  },
  selectedDayContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#F28C28",
  },
  unselectedDayContainer: {
    borderBottomWidth: 0,
  },
  day: {
    fontSize: 18,
    fontFamily: "Mona-Sans-Bold",
  },
  selectedDayText: {
    color: "#FFFFFF",
  },
  unselectedDayText: {
    color: "#888888",
  },
  dayLabel: {
    color: "#888888",
    fontSize: 12,
    fontFamily: "Mona-Sans-Light",
  },
  cardsContainer: {
    flex: 1,
  },
  taskCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 10,
    position: "relative",
  },
  taskTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontFamily: "Mona-Sans-Bold",
  },
  taskSubtitle: {
    color: "#FFFFFF",
    fontSize: 14,
    marginBottom: 20,
    fontFamily: "Mona-Sans",
  },
  taskDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskTime: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Mona-Sans",
  },
  taskProgress: {
    color: "#FFFFFF",
    fontSize: 14,
    marginLeft: 10,
    fontFamily: "Mona-Sans",
  },
  deleteButton: {},
  doneButton: {
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 100,
  },
  doneButtonGreen: {},
  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Mona-Sans",
  },
  hello: {
    color: "#888888",
    fontSize: 14,
    fontFamily: "Mona-Sans",
  },
  plusButton: {
    padding: 10,
    backgroundColor: "#444444",
    borderRadius: 100,
  },
  taskStart: {
    fontSize: 14,
    fontFamily: "Mona-Sans",
    color: "#FFFFFF",
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  startTimeContainer: {
    backgroundColor: "#333333",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  taskTime: {
    fontSize: 14,
    fontFamily: "Mona-Sans",
  },
  taskTimeLeft: {
    color: "#87FF21",
  },
  taskTimeMissed: {
    color: "#FF6347",
  },
});

export default HomeScreen;
