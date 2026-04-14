import React, { useState } from "react";
import { Text, View, Pressable } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator, BottomTabBarProps } from "@react-navigation/bottom-tabs";

// --- Types ---
type RootStackParamList = {
    Tabs: undefined;
};

type TabParamList = {
    Home: undefined;
    Page1: undefined;
    Page2: undefined;
};

// --- Navigators ---
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// --- Custom Tab Bar ---
function CustomTabBar({ state, navigation }: BottomTabBarProps) {
    return (
        <View className="flex-row justify-around bg-white p-4 border-t">
            {state.routes.map((route, index) => {
                const isFocused = state.index === index;

                const onPress = () => {
                    if (!isFocused) {
                        navigation.navigate(route.name);
                    }
                };

                return (
                    <Pressable className="bg-gray-200 p-1" key={route.key} onPress={onPress}>
                        <Text style={{ fontWeight: isFocused ? "bold" : "normal" }}>
                            {route.name}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

export interface itemTypes {
    name: string
    vals: number[]
    desc: string;
}
function TestItem1({ name, vals, desc }: itemTypes) {
    const [testNum, setTestNum] = useState<string>("--");

    return (
        <View className="w-1/2 p-3">
            <Text className="text-lg font-semibold mb-2">{name}</Text>

            <View className="flex-row flex-wrap gap-2">
                {vals.map((num) => (
                    <Pressable
                        key={`Btn${num}`}
                        className="w-1/4 border rounded-lg px-4 py-2 bg-gray-100 active:bg-gray-200"
                        onPress={() => setTestNum(num.toString())}
                    >
                        <Text className="text-center">{num}</Text>
                    </Pressable>
                ))}
            </View>

            <View className="mt-3 p-3 border rounded-lg bg-gray-50">
                <Text className="text-base text-center">
                    {testNum} {desc}
                </Text>
            </View>
        </View>
    );
}

// --- Screen ---
function TestPage1() {
    return (
        <View className="flex-1 bg-white p-4">
            <Text className="text-2xl font-bold mb-4">Vital Signs</Text>

            <View className="flex-row flex-wrap">
                <TestItem1
                    name="Height"
                    vals={[60, 65, 68, 70, 72]}
                    desc="in"
                />
                <TestItem1
                    name="Weight"
                    vals={[120, 150, 170, 200, 220]}
                    desc="lbs"
                />
                <TestItem1
                    name="Temperature"
                    vals={[97, 98, 98.6, 99, 100]}
                    desc="in"
                />
                <TestItem1
                    name="Pulse"
                    vals={[60, 70, 80, 90, 100]}
                    desc="BPM"
                />
            </View>
        </View>
    );
}

function TestPage2() {
    return (
        <View className="flex-1 items-center justify-center">
            <Text>Test Page 2</Text>
        </View>
    );
}

// --- Tab Navigator ---
function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{ headerShown: false }}
            tabBar={(props) => <CustomTabBar {...props} />}
        >
            <Tab.Screen name="Page1" component={TestPage1} />
            <Tab.Screen name="Page2" component={TestPage2} />
        </Tab.Navigator>
    );
}

// --- Root Navigator ---
export default function MedicalNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Tabs" component={TabNavigator} />
        </Stack.Navigator>
    );
}