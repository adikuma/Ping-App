import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  RefreshControl,
  TextInput,
  Vibration,
} from "react-native";
import * as Font from "expo-font";
import moment from "moment";
import { Ionicons } from "@expo/vector-icons";
import { TouchableWithoutFeedback, Keyboard } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from "./SplashScreen";
import * as Notifications from 'expo-notifications';
import CustomTimePicker from "./CustomTimePicker";

const HomeScreen = ({ route }) => {
  const navigation = useNavigation();
  const [fontLoaded, setFontLoaded] = useState(false);
  const today = new Date();
  const formatDate = (date) => {
    return moment(date).format("DD/MM/YYYY");
  };
  const [selectedDay, setSelectedDay] = useState(formatDate(today));
  const [refreshing, setRefreshing] = useState(false);
  const [taskCounts, setTaskCounts] = useState({ total: 0, completed: 0 });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [message, setMessage] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const messages = [
    "Here are your tasks for today!",
    "Let's conquer today's tasks!",
    "Ready to tackle your tasks?",
    "These are your tasks for today.",
    "Let's get things done!",
    "Time to be productive!",
    "Today's tasks await you!",
    "You're going to rock these tasks!",
    "Tasks lined up for today!",
    "Today's to-do list is ready!"
  ];

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const calculateTimeLeft = (startTime, taskDate, done) => {
    if (done) {
      return "Completed";
    }
    const currentTime = moment();
    const taskDateTime = moment(taskDate + " " + startTime, "DD/MM/YYYY h:mm A");
    if (!taskDateTime.isSame(currentTime, "day")) {
      return "In Progress";
    }
    const duration = moment.duration(taskDateTime.diff(currentTime));
    if (duration.asMilliseconds() <= 0) {
      return "Incomplete";
    }
    if (duration.asMinutes() < 60) {
      const minutes = duration.minutes();
      return `${minutes} min`;
    }
    return "In Progress";
  };

  const days = [];
  for (let i = 0; i <= 14; i++) {
    const day = new Date(today);
    day.setDate(today.getDate() + i);
    days.push({
      weekday: day.toLocaleString("en-US", { weekday: "long" }),
      date: day.getDate(),
      isToday: i === 0,
    });
  }

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem("tasks");
      if (storedTasks === null) {
        await AsyncStorage.setItem("tasks", JSON.stringify({}));
        setTasks({});
      } else {
        const parsedTasks = JSON.parse(storedTasks);
        setTasks(parsedTasks);

        Object.values(parsedTasks).forEach((dayTasks) => {
          dayTasks.forEach((task) => {
            if (task.done) {
              animateBorder(task.id, 1);
            }
          });
        });
      }
    } catch (error) {
      console.error("Failed to load tasks from AsyncStorage:", error);
    }
  };

  useEffect(() => {
    loadTasks();
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setMessage(randomMessage);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const saveTasks = async (newTasks) => {
    try {
      const jsonValue = JSON.stringify(newTasks);
      await AsyncStorage.setItem("tasks", jsonValue);
    } catch (error) {
      console.error("Failed to save tasks:", error);
    }
  };

  const [tasks, setTasks] = useState({
    "13/05/2024": [
      {
        id: 1,
        title: "Robin Buenos",
        subtitle: "Create personas through user research and data",
        startTime: "2:00 PM",
        done: false,
        timeLeft: "2 hours",
      },
      {
        id: 2,
        title: "John De Palace",
        subtitle: "Developing wireframes and task flows based on user needs",
        startTime: "1:00 PM",
        done: false,
        timeLeft: "3 hours",
      },
      {
        id: 3,
        title: "Birthday party",
        subtitle: "Create personas through user research and data",
        startTime: "4:00 PM",
        done: false,
        timeLeft: "2 hours",
      },
      {
        id: 8,
        title: "Birthday party",
        subtitle: "Create personas through user research and data",
        startTime: "7:00 PM",
        done: false,
        timeLeft: "2 hours",
      },
      {
        id: 9,
        title: "S*x",
        subtitle: "Create personas through user research and data",
        startTime: "6:00 PM",
        done: false,
        timeLeft: "2 hours",
      },
    ],
    "14/05/2024": [
      {
        id: 4,
        title: "Meeting with client",
        subtitle: "Discuss project requirements and timeline",
        startTime: "10:00 AM",
        done: false,
        timeLeft: "1 hour",
      },
      {
        id: 5,
        title: "Design review",
        subtitle: "Review and provide feedback on design mockups",
        startTime: "2:30 PM",
        done: false,
        timeLeft: "1 hour 30 minutes",
      },
    ],
  });

  const renderTimePicker = () => (
    <CustomTimePicker
      visible={showTimePicker}
      onConfirm={onTimeChange}
      onCancel={() => setShowTimePicker(false)}
    />
  );

  useEffect(() => {
    if (route.params?.newTask) {
      const newTask = route.params.newTask;
      console.log("Received new task for date:", newTask.date);
      addNewTask(newTask);
    }
  }, [route.params?.newTask]);

  const addNewTask = async (newTask) => {
    const taskDate = moment(newTask.date, "DD/MM/YYYY").format("DD/MM/YYYY");
    const newTaskDetails = {
      id: Date.now(),
      ...newTask,
      done: false,
      timeLeft: calculateTimeLeft(newTask.startTime, taskDate),
    };

    await setTasks((prevTasks) => {
      const updatedTasks = { ...prevTasks };
      updatedTasks[taskDate] = updatedTasks[taskDate] || [];
      updatedTasks[taskDate].push(newTaskDetails);
      saveTasks(updatedTasks);
      return updatedTasks;
    });

    await scheduleNotification(newTaskDetails);
  };

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
      }
    );

    return () => subscription.remove();
  }, []);

  const handleRemoveTask = async (day, id) => {
    Vibration.vibrate(50);
    await setTasks((prevTasks) => {
      const updatedTasks = { ...prevTasks };
      updatedTasks[day] = updatedTasks[day].filter((task) => task.id !== id);
      saveTasks(updatedTasks);
      return updatedTasks;
    });
  };

  useEffect(() => {
    async function setupNotifications() {
      const settings = await Notifications.getPermissionsAsync();
      console.log("Current notification settings:", settings);

      if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
        console.log("Notification permissions are granted.");
      } else {
        console.log("Requesting notification permissions...");
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowAnnouncements: true,
          },
        });
        if (status === "granted") {
          console.log("Notification permissions granted after request.");
        } else {
          console.log("Notification permissions denied.");
          alert("Permission to send notifications was denied!");
        }
      }
    }

    setupNotifications();
  }, []);

  const scheduleNotification = async (task) => {
    const taskDateTime = moment(`${task.date} ${task.startTime}`, "DD/MM/YYYY h:mm A");
    const currentTime = moment();

    if (taskDateTime.isBefore(currentTime)) {
      console.error("Cannot schedule notification in the past:", taskDateTime.toString());
      return;
    }

    console.log(`Scheduling notification for ${task.title} at ${taskDateTime.format()}`);
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Task Reminder 📌",
        body: `${task.title} at ${task.startTime}`,
        data: { task },
      },
      trigger: taskDateTime.toDate(),
    });
    console.log("Notification scheduled with ID:", notificationId);
  };

  const onTimeChange = (selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newTime = moment(selectedTime).format("h:mm A");
      setTasks((prevTasks) => {
        const updatedTasks = {
          ...prevTasks,
          [selectedDay]: prevTasks[selectedDay].map((task) =>
            task.id === currentTaskId ? { ...task, startTime: newTime } : task
          ),
        };
        return sortTasks(updatedTasks);
      });
    }
  };

  const sortTasks = (tasks) => {
    const sortedTasks = { ...tasks };
    Object.keys(sortedTasks).forEach((day) => {
      sortedTasks[day] = sortedTasks[day].sort((a, b) =>
        moment(a.startTime, "h:mm A").diff(moment(b.startTime, "h:mm A"))
      );
    });
    return sortedTasks;
  };

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

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedTasks = { ...tasks };
      Object.keys(updatedTasks).forEach((day) => {
        updatedTasks[day] = updatedTasks[day].map((task) => ({
          ...task,
          timeLeft: calculateTimeLeft(task.startTime, day),
        }));
      });
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
    }, 60000);

    return () => clearInterval(interval);
  }, [tasks]);

  const handleMarkDone = async (day, id) => {
    Vibration.vibrate(50);
    await setTasks((prevTasks) => {
      const updatedTasks = { ...prevTasks };
      let completedTasks = 0;

      updatedTasks[day] = updatedTasks[day].map((task) => {
        if (task.id === id) {
          const newDoneState = !task.done;
          animateBorder(id, newDoneState ? 1 : 0);
          return { ...task, done: newDoneState };
        }
        if (task.done) completedTasks++;
        return task;
      });

      const totalTasks = updatedTasks[day].length;
      const newCompletedTasks = tasks[day].find((task) => task.id === id)?.done
        ? completedTasks - 1
        : completedTasks + 1;

      setTaskCounts({ total: totalTasks, completed: newCompletedTasks });
      saveTasks(updatedTasks);
      return updatedTasks;
    });
  };

  const handleEndEditing = async () => {
    Vibration.vibrate(50);
    if (editingTask) {
      await setTasks((prevTasks) => {
        const updatedTasks = {
          ...prevTasks,
          [selectedDay]: prevTasks[selectedDay].map((task) =>
            task.id === editingTask.id ? { ...task, ...editingTask } : task
          ),
        };
        saveTasks(updatedTasks);
        return updatedTasks;
      });
      setEditingTask(null);
    }
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
    <SplashScreen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.hello}>Hello Aditya,</Text>
          <TouchableOpacity
            onPress={() => {
              Vibration.vibrate(50);
              navigation.navigate("VoiceAssistant");
            }}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" style={styles.plusButton} />
          </TouchableOpacity>
        </View>
        <Animated.Text style={[styles.greeting, { opacity: fadeAnim }]}>{message}</Animated.Text>
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
                onPress={() => {
                  Vibration.vibrate(50);
                  setSelectedDay(
                    formatDate(new Date(today.getFullYear(), today.getMonth(), day.date))
                  );
                }}
              >
                <View
                  style={[
                    styles.dayContainer,
                    selectedDay === formatDate(new Date(today.getFullYear(), today.getMonth(), day.date))
                      ? styles.selectedDayContainer
                      : styles.unselectedDayContainer,
                  ]}
                >
                  <Text
                    style={[
                      styles.day,
                      selectedDay === formatDate(new Date(today.getFullYear(), today.getMonth(), day.date))
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
        <ScrollView style={styles.cardsContainer}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View>
              {(tasks[selectedDay] || []).map((task, index) => {
                const borderColor = getAnimatedValue(task.id).interpolate({
                  inputRange: [0, 1],
                  outputRange: ["white", "#87FF21"],
                });
                const timeLeft = calculateTimeLeft(task.startTime, selectedDay, task.done);
                const isCompleted = timeLeft === "Completed";
                const isTimeMissed = timeLeft === "Incomplete";
                const isInProgress = timeLeft === "In Progress";
                return (
                  <Animated.View
                    key={index}
                    style={[
                      styles.taskCard,
                      { borderColor: borderColor, borderWidth: 0.5 },
                    ]}
                  >
                    <View style={styles.taskHeader}>
                      <TouchableOpacity
                        onPress={() => {
                          Vibration.vibrate(50);
                          setCurrentTaskId(task.id);
                          setShowTimePicker(true);
                        }}
                        style={styles.startTimeContainer}
                      >
                        <Text style={styles.taskStart}>{task.startTime}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleRemoveTask(selectedDay, task.id)}
                      >
                        <Ionicons name="close" size={20} color="#FF6347" />
                      </TouchableOpacity>
                    </View>
                    {editingTask && editingTask.id === task.id ? (
                      <TextInput
                        style={[styles.taskTitle, styles.taskTitleInput]}
                        value={editingTask.title}
                        onChangeText={(text) =>
                          setEditingTask((prevTask) => ({
                            ...prevTask,
                            title: text,
                          }))
                        }
                        onBlur={handleEndEditing}
                        onSubmitEditing={handleEndEditing}
                        multiline={true}
                        blurOnSubmit={false}
                        returnKeyType="done"
                      />
                    ) : (
                      <Text
                        style={styles.taskTitle}
                        onLongPress={() => {
                          Vibration.vibrate(50);
                          setEditingTask(task);
                        }}
                      >
                        {task.title}
                      </Text>
                    )}
                    {editingTask && editingTask.id === task.id ? (
                      <TextInput
                        style={[styles.taskSubtitle, styles.taskSubtitleInput]}
                        value={editingTask.subtitle}
                        onChangeText={(text) =>
                          setEditingTask((prevTask) => ({
                            ...prevTask,
                            subtitle: text,
                          }))
                        }
                        onBlur={handleEndEditing}
                        onSubmitEditing={handleEndEditing}
                        multiline={true}
                        blurOnSubmit={false}
                        returnKeyType="done"
                      />
                    ) : (
                      <Text
                        style={styles.taskSubtitle}
                        onLongPress={() => {
                          Vibration.vibrate(50);
                          setEditingTask(task);
                        }}
                      >
                        {task.subtitle}
                      </Text>
                    )}
                    <View style={styles.taskDetails}>
                      <Text
                        style={[
                          styles.taskTime,
                          isCompleted
                            ? styles.taskTimeCompleted
                            : isTimeMissed
                            ? styles.taskTimeMissed
                            : isInProgress
                            ? styles.taskTimeInProgress
                            : styles.taskTimeLeft,
                        ]}
                      >
                        {timeLeft}
                      </Text>
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
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
        {renderTimePicker()}
      </View>
    </SplashScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
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
    fontSize: 18,
    marginBottom: -10,
    fontFamily: "Mona-Sans",
  },
  plusButton: {
    padding: 8,
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
  taskTimeLeft: {
    color: "#FFFF00",
  },
  taskTimeMissed: {
    color: "#FF6347",
  },
  taskTimeCompleted: {
    color: "#87FF21",
  },
  taskTimeInProgress: {
    color: "#FFFFFF",
  },
  taskTitleInput: {
    borderBottomWidth: 1,
  },
  taskSubtitleInput: {
    borderBottomWidth: 1,
  },
  customHeader: {
    backgroundColor: "#000",
    padding: 10,
  },
  customHeaderText: {
    color: "#FFF",
    fontFamily: "Mona-Sans-Bold",
    textAlign: "center",
  },
});

export default HomeScreen;
