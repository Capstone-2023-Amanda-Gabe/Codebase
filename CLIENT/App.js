import React from "react";
import { Text, StyleSheet } from "react-native";
import { ClerkProvider, SignedIn, SignedOut, } from "@clerk/clerk-expo";
import { useState } from "react";
import { View } from "react-native";
import {Calendar} from 'react-native-calendars';
import SignInScreen from "./pages/signin";
import SignUpScreen from "./pages/signUp";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SecureStore from "expo-secure-store";
import WeatherComponent from "./components/WeatherComponent";
const CLERK_PUBLISHABLE_KEY = "pk_test_cHJvbXB0LWtpdC03Ni5jbGVyay5hY2NvdW50cy5kZXYk"

const tokenCache = {
  async getToken(key) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key, value) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

const Stack = createNativeStackNavigator();
export default function App() {

  const [selectedDay, setSelectedDay] = useState('');
  
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <NavigationContainer>
        <SignedIn>
          <View style={styles.calenderContainer}>
            <View style = {styles.centeredContent}>
            <Calendar
             style={{
              borderWidth: 1,
              borderColor: "gray",
              height: 350,
            }}
            current={"2023-08-24"}
            markedDates={{
              "2023-03-01": { selected: true, marked: true, selectedColor: "blue" },
              "2023-03-02": { marked: true },
              "2023-03-03": { selected: true, marked: true, selectedColor: "blue" },
            }}
            onDayPress={(day) => {
              setSelectedDay(day.dateString);
            }}
          />
            </View>
            <WeatherComponent/>
            <Text>{selectedDay}</Text>
            </View>
        
        </SignedIn>
        <SignedOut>
            <Stack.Navigator initialRouteName="Sign In?">
              <Stack.Screen name="Sign In?" component={SignInScreen} />
              <Stack.Screen name="Sign Up?" component={SignUpScreen} />
            </Stack.Navigator>
        </SignedOut>
      </NavigationContainer>
    </ClerkProvider>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  signedInText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  calenderContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  centeredContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",

  }
});