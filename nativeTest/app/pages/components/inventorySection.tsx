import { Pressable, Text, TextInput, View } from "react-native";
import { Controller } from "react-hook-form";
import { Props } from '../interfaces/InventoryInterfaces'


export default function InventorySection({ control, index, remove, errors }: Props) {
    return (
        <>
            <View className="flex-row w-full">
                <Controller
                    control={control}
                    name={`inventory.${index}.name`}
                    rules={{ required: "Name is required" }}
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            className="w-1/4 border border-gray-400 rounded px-3 py-2 m-2"
                            value={value}
                            onChangeText={onChange}
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

                <Controller
                    control={control}
                    name={`inventory.${index}.amountType`}
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            className="w-1/12 border border-gray-400 rounded px-3 py-2 m-2"
                            value={value}
                            onChangeText={onChange}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name={`inventory.${index}.warningAmt`}
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            className="w-1/12 border border-gray-400 rounded px-3 py-2 m-2"
                            value={value?.toString() ?? ""}
                            onChangeText={(text) => {
                                const numeric = text.replace(/[^0-9.]/g, "").replace(/^0+([0-9])/, "$1");
                                onChange(numeric === "" ? 0 : numeric);
                            }}
                            keyboardType="numeric"
                        />
                    )}
                />

                <Controller
                    control={control}
                    name={`inventory.${index}.tags`}
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            className="w-5/12 border border-gray-400 rounded px-3 py-2 m-2"
                            value={value}
                            onChangeText={onChange}
                        />
                    )}
                />

                <Pressable className="bg-red-600 p-2 m-2 rounded-lg w-1/12" onPress={() => remove(index)}>
                    <Text className="text-center">Remove</Text>
                </Pressable>
            </View>
            {errors.inventory?.[index]?.name && <Text className="w-1/4 text-center text-red-500">{errors.inventory[index].name.message}</Text>}
        </>
    );
}