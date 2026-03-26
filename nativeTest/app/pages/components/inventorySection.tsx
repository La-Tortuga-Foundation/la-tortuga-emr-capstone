import { Pressable, Text, TextInput, View, ViewStyle } from "react-native";
import { Controller, useWatch } from "react-hook-form";
import { Props } from '../interfaces/InventoryInterfaces'
import { Dropdown } from 'react-native-element-dropdown';

export const dropdownStyle: ViewStyle = {
    flex: 1,
}

export default function InventorySection({ control, index, remove, errors, amtTypeData, tagsTypeData, deleteArray }: Props) {
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
        name: `inventory.${index}.itemId`,
    })


    return (
        <>
            <View className={`flex-row w-full ${amount <= warningAmt ? "bg-red-200" : ""}`}>
                <Controller
                    control={control}
                    name={`inventory.${index}.name`}
                    rules={{ required: "Name is required" }}
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            className="w-1/6 border border-gray-400 rounded px-3 py-2 m-2"
                            value={value}
                            onChangeText={onChange}
                            multiline={true}
                            editable={!medTypeId}
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
                            onChangeText={(text) => {
                                const numeric = text.replace(/[^0-9.]/g, "").replace(/^0+([1-9])/, "$1");
                                onChange(numeric === "" ? 0 : numeric);
                            }}
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
                            onChangeText={(text) => {
                                const numeric = text.replace(/[^0-9.]/g, "").replace(/^0+([0-9])/, "$1");
                                onChange(numeric === "" ? 0 : numeric);
                            }}
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
                {!medTypeId &&
                    <Pressable className="bg-red-600 p-2 m-2 rounded-lg" onPress={() => { if (itemId) { deleteArray.push(itemId); } remove(index) }}>
                        <Text className="text-center">Remove</Text>
                    </Pressable>
                }
            </View>
            {errors.inventory?.[index]?.name && <Text className="w-1/4 text-center text-red-500">{errors.inventory[index].name.message}</Text>}
        </>
    );
}