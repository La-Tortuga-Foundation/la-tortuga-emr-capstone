import React, { useState, useMemo } from "react";
import { Text, View, Pressable, ScrollView, TextInput } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator, BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { testTypes, getInventoryItems, dropdownStyle, sanitizeNumericInput } from '../src/services/inventoryService';
import { Dropdown } from 'react-native-element-dropdown';
import { Props, InventoryRow, dataForDropDowns, CategoryRow, MedCategoryRow, InventoryData, Props2, medicationFormData } from './pages/interfaces/InventoryInterfaces'
import { Controller, useWatch, useForm, useFieldArray, Control } from "react-hook-form";
import { query, run } from '../src/services/db'
import { useLocalSearchParams } from 'expo-router';

function generateId(): string {
    return 'm-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// --- Types ---
type RootStackParamList = {
    Tabs: undefined;
};

type TabParamList = {
    Home: undefined;
    Vitals: undefined;
    med: undefined;
    submit: undefined;
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
                        <Text className={isFocused ? "font-bold" : "font-normal"} >
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
    control: any;
    fieldName: string;
}
function VitalBox({ name, vals, desc, control, fieldName }: itemTypes) {
    return (
        <View className="w-1/2 p-3">
            <Text className="text-lg font-semibold mb-2">{name}</Text>

            <Controller
                control={control}
                name={fieldName}
                render={({ field: { value, onChange } }) => (
                    <>
                        <View className="flex-row flex-wrap gap-2">
                            {vals.map((num) => (
                                <Pressable
                                    key={`Btn${num}`}
                                    className={`border rounded-lg px-4 py-2 ${value === num ? "bg-blue-200" : "bg-gray-100"
                                        }`}
                                    onPress={() => onChange(num)}
                                >
                                    <Text className="text-center">{num}</Text>
                                </Pressable>
                            ))}
                        </View>

                        <View className="mt-3 p-3 border rounded-lg bg-gray-50">
                            <Text className="text-base text-center">
                                {value ?? "--"} {desc}
                            </Text>
                        </View>
                    </>
                )}
            />
        </View>
    );
}
// --- Screen ---
function VitalPage({ control }: { control: Control<medicationFormData> }) {
    return (
        <View className="flex-1 bg-white p-4">
            <Text className="text-2xl font-bold mb-4">Vital Signs</Text>

            <View className="flex-row flex-wrap">
                <VitalBox
                    name="Height"
                    vals={[60, 65, 68, 70, 72]}
                    desc="in"
                    control={control}
                    fieldName="vitals.height"
                />
                <VitalBox
                    name="Weight"
                    vals={[120, 150, 170, 200, 220]}
                    desc="lbs"
                    control={control}
                    fieldName="vitals.weight"

                />
                <VitalBox
                    name="Temperature"
                    vals={[97, 98, 98.6, 99, 100]}
                    desc="°F"
                    control={control}
                    fieldName="vitals.temperature"

                />
                <VitalBox
                    name="Pulse"
                    vals={[60, 70, 80, 90, 100]}
                    desc="BPM"
                    control={control}
                    fieldName="vitals.pulse"
                />
                <VitalBox
                    name="Oxygen Saturation (SpO2)"
                    vals={[95, 96, 97, 98, 99]}
                    desc="%"
                    control={control}
                    fieldName="vitals.oxygenSaturation"
                />
                <VitalBox
                    name="Respiratory Rate"
                    vals={[12, 16, 20, 24]}
                    desc="/min"
                    control={control}
                    fieldName="vitals.respiratoryRate"
                />
            </View>
        </View>
    );
}

function InvItemRow({ control, index, remove, dbData }: Props2) {
    return <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-200 w-full flex-row">
        <Controller
            control={control}
            name={`meds.${index}.itemId`}
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
            name={`meds.${index}.amount`}
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

function MedicationPage({ control }: { control: Control<medicationFormData> }) {
    const testCategories: dataForDropDowns[] = query<CategoryRow>('SELECT * FROM inventory_categories')
        .map((invRow) => { return { label: invRow.label, value: invRow.inventoryCategoryId } })
        .concat(
            query<MedCategoryRow>('SELECT * FROM medication_categories')
                .map((invRow) => { return { label: invRow.label, value: invRow.medicationCategoryId } })
        );
    const dbData: InventoryData[] = getInventoryItems(testCategories);



    const { fields: medsFields, append: appendMeds, remove: removeMeds } = useFieldArray({
        control,
        name: "meds",
    });

    return (
        <View className="flex-1 bg-gray-100 px-4 pt-10">
            <Text className="text-3xl font-bold mb-6 text-center">
                Medications
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
                {medsFields.map((field, index) => (
                    <InvItemRow
                        key={field.itemId}
                        control={control}
                        index={index}
                        remove={removeMeds}
                        dbData={dbData}
                    />
                ))}
                <Pressable
                    onPress={() => appendMeds({ itemId: "", amount: 0 })}
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

function SubmitPage({ handleSubmit }: { handleSubmit: any }) {
    return (
        <View className="flex-1 bg-white p-4">
            <Text className="text-2xl font-bold mb-4">Submit</Text>
            <Pressable
                onPress={handleSubmit(onSubmit)}
                className="bg-green-600 p-4 items-center justify-center"
            >
                <Text className="text-white text-xl font-bold">
                    Save All Data
                </Text>
            </Pressable>
        </View>
    );
}

const onSubmit = (data: medicationFormData) => {
    console.log("Submitting form data:", data);
    console.log("Submitting form data2:", data.meds?.[0]?.itemId);


    console.log("Visit ID from params:", data.visitId);
    const intakeId = `intake_${generateId()}`;
    try {
        run(`delete from visit_vitals where intakeId IN (SELECT intakeId FROM medical_intakes WHERE visitId = ?)`, [data.visitId]);
        run(`delete from visit_medications where intakeId IN (SELECT intakeId FROM medical_intakes WHERE visitId = ?)`, [data.visitId]);
        run(`delete from medical_intakes where visitId = ?`, [data.visitId]);
        run(`delete from visits where visitId = ?`, [data.visitId]);
        run(
            `INSERT INTO visits (visitId, patientId, clinicId, statusTypeId, reasonForVisit, reasonForVisitTag, shortCode, checkedInAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
            [data.visitId, data.patientId, null, null, null, null, null, new Date().toString()]
        );

        // 1. Save Medications
        if (data.meds && data.meds.length > 0) {
            const medsData = data.meds.map(med => ({
                medicationTypeId: med.itemId.itemId,
                dosage: null,
                frequency: null,
                durationDays: null,
                quantity: med.amount || 0,
                unitTypeId: null,
            }));

            run(
                `INSERT INTO medical_intakes (intakeId, visitId, painLevel, painDuration, painLocations, painQuality, quadrant, antibioticCheckbox, prescriptionMeds, otcMeds, herbalRemedies, carePlan, clinicalNotes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                [intakeId, data.visitId, null, null, null, null, null, null, null, null, null, null, null]
            );

            for (const med of medsData) {
                run(
                    `INSERT INTO visit_medications (visitMedicationId, intakeId, medicationTypeId, dosage, frequency, durationDays, quantity, unitTypeId) VALUES(?, ?, ?, ?, ?, ?, ?, ?);`,
                    [generateId(), intakeId, med.medicationTypeId, med.dosage, med.frequency, med.durationDays, med.quantity, med.unitTypeId]
                );
            }
        }

        // 2. Save Vitals
        const vitalRecords = [
            { vitalTypeId: "height", value: data.vitals.height?.toString() ?? null },
            { vitalTypeId: "weight", value: data.vitals.weight?.toString() ?? null },
            { vitalTypeId: "temperature", value: data.vitals.temperature?.toString() ?? null },
            { vitalTypeId: "pulse", value: data.vitals.pulse?.toString() ?? null },
            { vitalTypeId: "oxygenSaturation", value: data.vitals.oxygenSaturation?.toString() ?? null },
            { vitalTypeId: "respiratoryRate", value: data.vitals.respiratoryRate?.toString() ?? null }
        ];

        for (const record of vitalRecords) {
            if (record.value) {
                run(
                    `INSERT INTO visit_vitals (vitalId, intakeId, vitalTypeId, value, recordedAt) VALUES (?, ?, ?, ?, ?);`,
                    [generateId(), intakeId, record.vitalTypeId, record.value, Date.now().toString()]
                );
            }
        }

        alert("Data saved successfully!");
    } catch (error) {
        console.error("Submission failed:", error);
        alert("Failed to save data. Check console for details.");
    }
};

// --- Tab Navigator ---
function TabNavigator({ visitId, patientId }: { visitId: string; patientId: string }) {
    const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<medicationFormData>({
        mode: "onChange",
        defaultValues: {
            meds: [],
            vitals: {
                height: null,
                weight: null,
                temperature: null,
                pulse: null,
                oxygenSaturation: null,
                respiratoryRate: null
            },
            visitId: visitId,
            patientId: patientId
        },
    });

    return (
        <Tab.Navigator
            screenOptions={{ headerShown: false }}
            tabBar={(props) => <CustomTabBar {...props} />}
        >
            <Tab.Screen name="Vitals">
                {() => <VitalPage control={control} />}
            </Tab.Screen>

            <Tab.Screen name="med">
                {() => <MedicationPage control={control} />}
            </Tab.Screen>
            <Tab.Screen name="submit">
                {() => <SubmitPage handleSubmit={handleSubmit} />}
            </Tab.Screen>
        </Tab.Navigator>
    );
}

// --- Root Navigator ---
export default function MedicalNavigator() {
    const { visitId, patientId } = useLocalSearchParams();
    console.log("Received visitId param:", visitId);
    console.log("Received patientId param:", patientId);
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Tabs">
                {() => <TabNavigator visitId={visitId as string} patientId={patientId as string} />}
            </Stack.Screen>
        </Stack.Navigator>
    );
}