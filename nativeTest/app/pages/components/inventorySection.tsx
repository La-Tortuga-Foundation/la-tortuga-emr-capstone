import { Pressable, Text, TextInput, View, ViewStyle, Alert } from "react-native";
import { Controller, useWatch } from "react-hook-form";
import { Props } from '../interfaces/InventoryInterfaces';
import { Dropdown } from 'react-native-element-dropdown';
import { run } from '../../../src/services/db';
import { dropdownStyle, sanitizeNumericInput } from '../functions/inventoryFunc';

export default function InventorySection({ control, index, remove, errors, amtTypeData, tagsTypeData }: Props) {
    const amount = useWatch({
        control,
        name: `inventory.${index}.amount`,
    });
    const warningAmt = useWatch({
        control,
        name: `inventory.${index}.warningAmt`,
    });
    const itemId = useWatch({
        control,
        name: `inventory.${index}.itemId`,
    });
    const medTypeId = useWatch({
        control,
        name: `inventory.${index}.medicationTypeId`,
    })
    const showConfirmationDialog = () => {
        Alert.alert(
            "Delete Item",
            `Are you sure you want to delete this item?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "OK", onPress: () => { if (itemId) { run("DELETE FROM inventory_items WHERE itemId = ?", [itemId]); } remove(index) } }
            ],
            { cancelable: true }
        );
    };

    return (
        <>
            <View className={`flex-row w-full ${amount <= warningAmt ? "bg-red-200" : ""}`}>
                <Controller
                    control={control}
                    name={`inventory.${index}.name`}
                    rules={{ required: "Name is required" }}
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            className={`w-1/6 border border-gray-400 rounded px-3 py-2 m-2 ${medTypeId == null ? "" : "bg-gray-200"}`}
                            value={value}
                            onChangeText={onChange}
                            multiline={true}
                            editable={medTypeId == null}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name={`inventory.${index}.amount`}
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            className="w-1/12 border border-gray-400 rounded px-3 py-2 m-2"
                            value={value?.toString() ?? ""}
                            onChangeText={(text) => { sanitizeNumericInput(text, onChange) }}
                            keyboardType="numeric"
                        />
                    )}
                />
                <View className="w-1/6 border border-gray-400 rounded px-3 py-2 m-2">
                    <Controller
                        control={control}
                        name={`inventory.${index}.amountType`}
                        render={({ field: { onChange, value } }) => (
                            <Dropdown
                                value={value}
                                onChange={onChange}
                                data={amtTypeData}
                                labelField="label"
                                valueField="value"
                                style={dropdownStyle}
                            />
                        )}
                    />
                </View>


                <Controller
                    control={control}
                    name={`inventory.${index}.warningAmt`}
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            className="border border-gray-400 rounded px-3 py-2 m-2"
                            value={value?.toString() ?? ""}
                            onChangeText={(text) => { sanitizeNumericInput(text, onChange) }}
                            keyboardType="numeric"
                        />
                    )}
                />
                <View className="w-3/12 border border-gray-400 rounded px-3 py-2 m-2">
                    <Controller
                        control={control}
                        name={`inventory.${index}.category`}
                        render={({ field: { onChange, value } }) => (
                            <Dropdown
                                value={value}
                                onChange={onChange}
                                data={tagsTypeData}
                                labelField="label"
                                valueField="value"
                                style={dropdownStyle}
                            />
                        )}
                    />
                </View>
                {medTypeId === null &&
                    <Pressable className="bg-red-600 p-2 m-2 rounded-lg" onPress={showConfirmationDialog}>
                        <Text className="text-center">Remove</Text>
                    </Pressable>
                }
            </View>
            {errors.inventory?.[index]?.name && <Text className="w-1/4 text-center text-red-500">{errors.inventory[index].name.message}</Text>}
        </>
    );
}