import React, { useState, useMemo } from "react";
import { Text, View, Pressable, ScrollView, TextInput } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator, BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { testTypes, getInventoryItems, dropdownStyle, sanitizeNumericInput } from '../src/services/inventoryService';
import { Dropdown } from 'react-native-element-dropdown';
import { Props, InventoryRow, dataForDropDowns, CategoryRow, MedCategoryRow, InventoryData, Props2, medicationFormData } from './pages/interfaces/InventoryInterfaces'
import { Controller, useWatch, useForm, useFieldArray, Control } from "react-hook-form";
import { query } from '../src/services/db'

// --- Types ---
type RootStackParamList = {
    Tabs: undefined;
};

type TabParamList = {
    Home: undefined;
    Vitals: undefined;
    med: undefined;
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
function VitalBox({ name, vals, desc }: itemTypes) {
    const [testNum, setTestNum] = useState<string>("--");

    return (
        <View className="w-1/2 p-3">
            <Text className="text-lg font-semibold mb-2">{name}</Text>

            <View className="flex-row flex-wrap gap-2">
                {vals.map((num) => (
                    <Pressable
                        key={`Btn${num}`}
                        className={`border rounded-lg px-4 py-2 ${testNum === num.toString() ? "bg-blue-200" : "bg-gray-100"}`}
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
function VitalPage() {
    return (
        <View className="flex-1 bg-white p-4">
            <Text className="text-2xl font-bold mb-4">Vital Signs</Text>

            <View className="flex-row flex-wrap">
                <VitalBox
                    name="Height"
                    vals={[60, 65, 68, 70, 72]}
                    desc="in"
                />
                <VitalBox
                    name="Weight"
                    vals={[120, 150, 170, 200, 220]}
                    desc="lbs"
                />
                <VitalBox
                    name="Temperature"
                    vals={[97, 98, 98.6, 99, 100]}
                    desc="°F"
                />
                <VitalBox
                    name="Pulse"
                    vals={[60, 70, 80, 90, 100]}
                    desc="BPM"
                />
                <VitalBox
                    name="Oxygen Saturation (SpO2)"
                    vals={[95, 96, 97, 98, 99]}
                    desc="%"
                />
                <VitalBox
                    name="Respiratory Rate"
                    vals={[12, 16, 20, 24]}
                    desc="/min"
                />
            </View>
        </View>
    );
}

function InvItemRow({ control, index, remove, errors, dbData }: Props2) {
    return <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-200 w-full flex-row">
        <Controller
            control={control}
            name={`inventory.${index}.itemId`}
            render={({ field: { onChange, value } }) => (
                <Dropdown
                    value={value}
                    onChange={onChange}
                    data={dbData}
                    labelField="name"
                    valueField="itemId"
                    style={dropdownStyle}
                />
            )}
        />
        <Controller
            control={control}
            name={`inventory.${index}.amount`}
            render={({ field: { onChange, value } }) => (
                <TextInput
                    className="border border-gray-400 rounded px-3 py-2 m-2"
                    value={value?.toString() ?? ""}
                    onChangeText={(text) => { sanitizeNumericInput(text, onChange) }}
                    keyboardType="numeric"
                />
            )}
        />
        <Pressable
            onPress={() => remove(index)}
            className="bg-red-500 px-3 py-1 rounded-lg"
        >
            <Text className="text-white text-sm">Remove</Text>
        </Pressable>
    </View>
}

function MedicationPage() {
    const testCategories: dataForDropDowns[] = query<CategoryRow>('SELECT * FROM inventory_categories')
        .map((invRow) => { return { label: invRow.label, value: invRow.inventoryCategoryId } })
        .concat(
            query<MedCategoryRow>('SELECT * FROM medication_categories')
                .map((invRow) => { return { label: invRow.label, value: invRow.medicationCategoryId } })
        );
    const dbData: InventoryData[] = getInventoryItems(testCategories);

    const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<medicationFormData>({
        mode: "onChange",
        defaultValues: {
            inventory: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "inventory",
    });

    return (
        <View className="flex-1 bg-gray-100 px-4 pt-10">
            <Text className="text-3xl font-bold mb-6 text-center">
                Medications
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
                {fields.map((field, index) => (
                    <InvItemRow
                        key={field.itemId}
                        control={control}
                        index={index}
                        remove={remove}
                        errors={errors}
                        dbData={dbData}
                    />
                ))}
                <Pressable
                    onPress={() => append({ itemId: "", amount: 0 })}
                    className="bg-blue-500 py-3 rounded-xl mt-4"
                >
                    <Text className="text-white text-center font-semibold">
                        + Add Item
                    </Text>
                </Pressable>
            </ScrollView>

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
            <Tab.Screen name="Vitals" component={VitalPage} />
            <Tab.Screen name="med" component={MedicationPage} />
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