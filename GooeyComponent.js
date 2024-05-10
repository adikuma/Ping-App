import { TouchableOpacity, StyleSheet, View, useWindowDimensions } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { FontAwesome } from '@expo/vector-icons'
import { Canvas, LinearGradient, Rect, vec } from '@shopify/react-native-skia'
import { useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated'

// That was in the utils file (but let's keep it here for the sake of simplicity)
const getRandomColor = () => {
  // Generate random RGB color values
  const r = Math.floor(Math.random() * 256)
  const g = Math.floor(Math.random() * 256)
  const b = Math.floor(Math.random() * 256)

  // Return the color in the format '#RRGGBB'
  return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`
}

const Back = () => {
  const { width, height } = useWindowDimensions()

  const leftColor = useSharedValue('red')
  const rightColor = useSharedValue('blue')

  const colors = useDerivedValue(() => {
    return [leftColor.value, rightColor.value]
  }, [])

  return (
    <>
      <StatusBar style="light" />
      <Canvas style={{ flex: 1 }}>
        <Rect x={0} y={0} width={width} height={height}>
          <LinearGradient start={vec(0, 0)} end={vec(width, height)} colors={colors} />
        </Rect>
      </Canvas>
      <TouchableOpacity
        style={styles.buttonContainer}
        onPress={() => {
          // Where the magic happens 🪄
          leftColor.value = withTiming(getRandomColor())
          rightColor.value = withTiming(getRandomColor())
        }}
      >
        <FontAwesome name="random" size={24} color="white" />
      </TouchableOpacity>
    </>
  )
}

// Boring styles
const styles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    bottom: 52,
    right: 32,
    height: 64,
    aspectRatio: 1,
    borderRadius: 40,
    backgroundColor: '#111',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export {Back}