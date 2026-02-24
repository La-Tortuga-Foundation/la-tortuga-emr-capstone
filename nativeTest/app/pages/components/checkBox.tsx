import React from "react";
import { Pressable, Text, View } from "react-native";
import { useController } from "react-hook-form";
import { CheckboxProps } from '../interfaces/InventoryInterfaces'


export function Checkbox({ name, control, label }: CheckboxProps) {
    const {
        field: { value, onChange },
    } = useController({ name, control });

    return (
        <Pressable
            onPress={() => onChange(!value)}
            className="flex-row items-center mb-3"
        >
            <View
                className={`w-6 h-6 rounded border mr-3 items-center justify-center ${value ? "bg-blue-600 border-blue-600" : "border-gray-400"}`}
            >
                {value && (
                    <Text className="text-white text-xs font-bold">✓</Text>
                )}
            </View>
            <Text className="text-gray-700">{label}</Text>
        </Pressable>
    );
}