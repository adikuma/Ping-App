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
} from "react-native";
import * as Font from "expo-font";
import moment from "moment";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { TouchableWithoutFeedback, Keyboard } from "react-native";
import { useNavigation } from '@react-navigation/native';

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
  const [showDialog, setShowDialog] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const calculateTimeLeft = (startTime, taskDate) => {
    const currentTime = moment();
    const startTimeMoment = moment(startTime, "h:mm A");
    const taskDateTime = moment(
      taskDate + " " + startTime,
      "DD/MM/YYYY h:mm A"
    );
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

  const renderTimePicker = () => {
    if (showTimePicker) {
      return (
        <DateTimePicker
          value={new Date()}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={onTimeChange}
          themeVariant="dark"
        />
      );
    }
    return null;
  };

    useEffect(() => {
      if (route.params?.newTask) {
        const newTask = route.params.newTask;
        console.log("Data Total:", newTask);
        console.log("Date from server:", newTask.date);
        const taskDate = moment(newTask.date, 'DD/MM/YYYY').format('DD/MM/YYYY');
        console.log("Received new task for date:", taskDate);
        console.log("New Task Details:", newTask); 
    
        setTasks(prevTasks => {
          const updatedTasks = { ...prevTasks };
    
          const newTaskDetails = {
            id: Date.now(),
            title: newTask['title'],
            subtitle: newTask['subtitle'],
            startTime: newTask['startTime'],
            done: false,
            timeLeft: calculateTimeLeft(newTask.startTime, taskDate),
          };
    
          console.log("New Task to Add:", newTaskDetails);
    
          if (updatedTasks[taskDate]) {
            updatedTasks[taskDate].push(newTaskDetails);
          } else {
            updatedTasks[taskDate] = [newTaskDetails];
          }
    
          console.log("Updated Tasks Object:", updatedTasks); // Show updated tasks object
          return updatedTasks;
        });
      }
    }, [route.params?.newTask]);

    const onTimeChange = (event, selectedTime) => {
      setShowTimePicker(false);
      console.log("Event: ", event);
      if (event.type === "set" && selectedTime !== undefined) {
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

  const handleRemoveTask = (day, id) => {
    const updatedTasks = { ...tasks };
    updatedTasks[day] = updatedTasks[day].filter((task) => task.id !== id);
    setTasks(updatedTasks);
  };

  const handleMarkDone = (day, id) => {
    const updatedTasks = { ...tasks };
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

    if (newCompletedTasks === totalTasks) {
      setShowDialog(true);
    }

    setTasks(updatedTasks);
  };

  const TaskCompletionDialog = ({ visible, onClose, taskCounts }) => {
    const animation = useRef(new Animated.Value(-100)).current;

    useEffect(() => {
      if (visible) {
        Animated.sequence([
          Animated.timing(animation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(3000),
          Animated.timing(animation, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => onClose());
      }
    }, [visible, onClose]);

    if (!visible) return null;

    return (
      <Animated.View
        style={[
          styles.dialogContainer,
          { transform: [{ translateY: animation }] },
        ]}
      >
        <View style={styles.dialog}>
          <Text style={styles.dialogMessage}>
            You have completed {taskCounts.completed}/{taskCounts.total} tasks
            today
          </Text>
        </View>
      </Animated.View>
    );
  };

  const handleEndEditing = () => {
    if (editingTask) {
      setTasks((prevTasks) => {
        const updatedTasks = {
          ...prevTasks,
          [selectedDay]: prevTasks[selectedDay].map((task) =>
            task.id === editingTask.id ? { ...task, ...editingTask } : task
          ),
        };
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.hello}>Hello Aditya,</Text>
        <TouchableOpacity onPress={() => navigation.navigate('VoiceAssistant')}>
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
              onPress={() =>
                setSelectedDay(
                  formatDate(
                    new Date(today.getFullYear(), today.getMonth(), day.date)
                  )
                )
              }
            >
              <View
                style={[
                  styles.dayContainer,
                  selectedDay ===
                  formatDate(
                    new Date(today.getFullYear(), today.getMonth(), day.date)
                  )
                    ? styles.selectedDayContainer
                    : styles.unselectedDayContainer,
                ]}
              >
                <Text
                  style={[
                    styles.day,
                    selectedDay ===
                    formatDate(
                      new Date(today.getFullYear(), today.getMonth(), day.date)
                    )
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
      {/* Task Cards */}
      <ScrollView style={styles.cardsContainer}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View>
            {(tasks[selectedDay] || []).map((task, index) => {
              const borderColor = getAnimatedValue(task.id).interpolate({
                inputRange: [0, 1],
                outputRange: ["white", "#87FF21"],
              });
              const timeLeft = calculateTimeLeft(task.startTime, selectedDay);
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
                      onLongPress={() => setEditingTask(task)}
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
                      onLongPress={() => setEditingTask(task)}
                    >
                      {task.subtitle}
                    </Text>
                  )}

                  <View style={styles.taskDetails}>
                    <Text
                      style={[
                        styles.taskTime,
                        isTimeMissed
                          ? styles.taskTimeMissed
                          : isInProgress
                          ? styles.taskTimeInProgress
                          : styles.taskTimeLeft,
                      ]}
                    >
                      {timeLeft}
                    </Text>

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
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
      <TaskCompletionDialog
        visible={showDialog}
        onClose={() => setShowDialog(false)}
        taskCounts={taskCounts}
      />
      {renderTimePicker()}
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
    color: "#FFFF00",
  },
  taskTimeMissed: {
    color: "#FF6347",
  },
  taskTimeInProgress: {
    color: "#FFFFFF",
  },

  dialogContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    top: 15,
    left: 0,
    right: 0,
  },
  dialog: {
    backgroundColor: "#000",
    padding: 3,
    borderRadius: 100,
    width: "80%",
    alignItems: "center",
    borderWidth: 0.4,
    borderColor: "#fff",
  },
  dialogMessage: {
    fontSize: 14,
    marginVertical: 15,
    color: "#fff",
  },
  taskTitleInput: {
    borderBottomWidth: 1,
  },
  taskSubtitleInput: {
    borderBottomWidth: 1,
  },
});

export default HomeScreen;
