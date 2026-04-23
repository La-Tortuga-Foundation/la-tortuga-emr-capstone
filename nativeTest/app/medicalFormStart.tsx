import { Text, View, Pressable, ScrollView, TextInput } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator, BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { getInventoryItems, dropdownStyle, sanitizeNumericInput, sendWarningOnCurrentInv } from '../src/services/inventoryService';
import { Dropdown } from 'react-native-element-dropdown';
import { dataForDropDowns, CategoryRow, MedCategoryRow, InventoryData, Props2, medicationFormData } from './pages/interfaces/InventoryInterfaces'
import { Controller, useWatch, useForm, useFieldArray, Control } from "react-hook-form";
import { query, queryOne, run } from '../src/services/db'
import { useLocalSearchParams } from 'expo-router';
import { RootStackParamList, TabParamList, itemTypes, vitalsData, inventoryTransaction } from './pages/interfaces/medFormInterface';

function generateId(): string {
    return 'm-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

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

function InfoPage({ control }: { control: Control<medicationFormData> }) {
    const patientId = useWatch({
        control,
        name: "patientId",
    });
    const visitId = useWatch({
        control,
        name: "visitId",
    });
    const patientName = queryOne<{ firstName: string; lastName: string }>(`SELECT firstName, lastName FROM patients WHERE patientId = ?`, [patientId]);
    return (
        <View className="flex-1 bg-gray-100 px-4 p-4">
            <Text className="text-2xl font-bold mb-4">
                Info
            </Text>
            <Text className="text-3xl m-2">
                Name: {patientName ? `${patientName.firstName} ${patientName.lastName}` : "No Patient Name"}
            </Text>
            <Text className="text-3xl m-2">
                {patientId ? `Patient ID: ${patientId}` : "No Patient ID"}
            </Text>
            <Text className="text-3xl m-2">
                {visitId ? `Visit ID: ${visitId}` : "No Visit ID"}
            </Text>
        </View>
    );
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
            name={`meds.${index}.item`}
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
    const dbData: InventoryData[] = getInventoryItems(testCategories).filter(e => e.amount > 0);

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
                        key={field.id}
                        control={control}
                        index={index}
                        remove={removeMeds}
                        dbData={dbData}
                    />
                ))}
                <Pressable
                    onPress={() => appendMeds({ item: { itemId: "", name: "", quantity: 0, unitTypeId: "", warningThreshold: 0, categoryId: "", medicationTypeId: "" }, amount: 0 })}
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

function NotesPage({ control }: { control: Control<medicationFormData> }) {
    return (
        <View className="flex-1 bg-gray-100 px-4 pt-10">
            <Text className="text-3xl font-bold mb-6 text-center">
                Notes
            </Text>
            <Text className="text-3xl font-bold mb-2">
                Care Plan
            </Text>
            <Controller
                control={control}
                name="carePlan"
                render={({ field: { onChange, value } }) => (
                    <TextInput
                        className={`border border-gray-400 rounded px-3 py-2 m-2 h-80`}
                        value={value}
                        onChangeText={onChange}
                        multiline={true}
                    />
                )}
            />
            <Text className="text-3xl font-bold mb-2">
                Clinical Notes
            </Text>
            <Controller
                control={control}
                name="clinicalNotes"
                render={({ field: { onChange, value } }) => (
                    <TextInput
                        className={`border border-gray-400 rounded px-3 py-2 m-2 h-80`}
                        value={value}
                        onChangeText={onChange}
                        multiline={true}
                    />
                )}
            />

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
    const intakeId = `intake_${generateId()}`;
    try {
        run(
            `INSERT INTO medical_intakes (intakeId, visitId, painLevel, painDuration, painLocations, painQuality, quadrant, antibioticCheckbox, prescriptionMeds, otcMeds, herbalRemedies, carePlan, clinicalNotes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [intakeId, data.visitId, null, null, null, null, null, null, null, null, null, data.carePlan, data.clinicalNotes]
        );

        for (const med of data.meds) {
            run(
                `INSERT INTO inventory_transactions (transactionId, itemId, visitId, transactionType, quantityDelta, recordedAt) VALUES (?, ?, ?, ?, ?, ?);`,
                [generateId(), med.item.itemId, data.visitId, "dispense", med.amount, new Date().toISOString()]
            );
            run(
                `UPDATE inventory_items SET quantity = quantity - ? WHERE itemId = ?`,
                [med.amount, med.item.itemId]
            );
            // run(
            //     `INSERT INTO visit_medications (visitMedicationId, intakeId, medicationTypeId, dosage, frequency, durationDays, quantity, unitTypeId) VALUES(?, ?, ?, ?, ?, ?, ?, ?);`,
            //     [generateId(), intakeId, med.item.medicationTypeId, med.dosage, med.frequency, med.durationDays, med.quantity, med.item.unitTypeId]
            // );
        }
        sendWarningOnCurrentInv();

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
                    [generateId(), intakeId, record.vitalTypeId, record.value, new Date().toISOString()]
                );
            }
        }
        alert("Data saved successfully!");
    } catch (error) {
        console.error("Submission failed:", error);
        alert("Failed to save data. Check console for details.");
    }
};

function TabNavigator({ visitId, patientId }: { visitId: string; patientId: string }) {
    const testCategories: dataForDropDowns[] = query<CategoryRow>('SELECT * FROM inventory_categories')
        .map((invRow) => { return { label: invRow.label, value: invRow.inventoryCategoryId } })
        .concat(
            query<MedCategoryRow>('SELECT * FROM medication_categories')
                .map((invRow) => { return { label: invRow.label, value: invRow.medicationCategoryId } })
        );

    const intakeRow = queryOne<{ carePlan: string, clinicalNotes: string, intakeId: string }>('SELECT carePlan, clinicalNotes, intakeId FROM medical_intakes WHERE visitId = ?', [visitId]);
    const invTransRows = query<inventoryTransaction>('SELECT itemId, transactionType, quantityDelta FROM inventory_transactions WHERE visitId = ?', [visitId]);
    const vitalsRows = intakeRow ? query<vitalsData>('SELECT vitalTypeId, value FROM visit_vitals WHERE intakeId = ?', [intakeRow.intakeId]) : [];
    const dbData: InventoryData[] = getInventoryItems(testCategories);

    const { control, handleSubmit } = useForm<medicationFormData>({
        mode: "onChange",
        defaultValues: {
            meds: invTransRows.map(trans => ({ item: dbData.find((e) => e.itemId === trans.itemId) || { itemId: "", name: "", quantity: 0, unitTypeId: "", warningThreshold: 0, categoryId: "", medicationTypeId: "" }, amount: trans.quantityDelta })) ?? [],
            vitals: {
                height: (vitalsRows.find((v) => v.vitalTypeId === "height")?.value) ? Number(vitalsRows.find((v) => v.vitalTypeId === "height")?.value) : null,
                weight: (vitalsRows.find((v) => v.vitalTypeId === "weight")?.value) ? Number(vitalsRows.find((v) => v.vitalTypeId === "weight")?.value) : null,
                temperature: (vitalsRows.find((v) => v.vitalTypeId === "temperature")?.value) ? Number(vitalsRows.find((v) => v.vitalTypeId === "temperature")?.value) : null,
                pulse: (vitalsRows.find((v) => v.vitalTypeId === "pulse")?.value) ? Number(vitalsRows.find((v) => v.vitalTypeId === "pulse")?.value) : null,
                oxygenSaturation: (vitalsRows.find((v) => v.vitalTypeId === "oxygenSaturation")?.value) ? Number(vitalsRows.find((v) => v.vitalTypeId === "oxygenSaturation")?.value) : null,
                respiratoryRate: (vitalsRows.find((v) => v.vitalTypeId === "respiratoryRate")?.value) ? Number(vitalsRows.find((v) => v.vitalTypeId === "respiratoryRate")?.value) : null
            },
            visitId: visitId,
            patientId: patientId,
            carePlan: intakeRow?.carePlan ?? "",
            clinicalNotes: intakeRow?.clinicalNotes ?? "",
        },
    });

    return (
        <Tab.Navigator
            screenOptions={{ headerShown: false }}
            tabBar={(props) => <CustomTabBar {...props} />}
        >
            <Tab.Screen name="info">
                {() => <InfoPage control={control} />}
            </Tab.Screen>
            <Tab.Screen name="Vitals">
                {() => <VitalPage control={control} />}
            </Tab.Screen>
            <Tab.Screen name="med">
                {() => <MedicationPage control={control} />}
            </Tab.Screen>
            <Tab.Screen name="notes">
                {() => <NotesPage control={control} />}
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
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Tabs">
                {() => <TabNavigator visitId={visitId as string} patientId={patientId as string} />}
            </Stack.Screen>
        </Stack.Navigator>
    );
}