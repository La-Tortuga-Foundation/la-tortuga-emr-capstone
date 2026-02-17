import { Pressable, Text, TextInput, View } from "react-native";
import { Link } from 'expo-router';
import { useState } from 'react';
import { Button } from '@react-navigation/elements';

type InventorySectionProps = {
    data: [string, number, number, string];
    i: number;
    updateData: (index: number, updatedItem: [string, number, number, string]) => void;
};

export default function InventorySection({ data, i, updateData }: InventorySectionProps) {
    return (
        <View className="w-full flex-row">
            <TextInput
                placeholder="name"
                className="border border-gray-400 rounded px-3 py-2 m-2 w-1/4"
                value={data[0]}
                onChangeText={e => {
                    const updated = [...data];
                    updated[0] = e;
                    updateData(i, updated);
                }}
            />

            <TextInput keyboardType="numeric"
                placeholder="Amount"
                className="border border-gray-400 rounded px-3 py-2 m-2 w-1/4"
                value={data[1].toString()}
                onChangeText={e => {
                    const updated = [...data];
                    updated[1] = e;
                    updateData(i, updated);
                }}
            />

            <TextInput keyboardType="numeric"
                placeholder="Warning Amt"
                className="border border-gray-400 rounded px-3 py-2 m-2 w-1/4"
                value={data[2].toString()}
                onChangeText={e => {
                    const updated = [...data];
                    updated[2] = e;
                    updateData(i, updated);
                }}
            />

            <TextInput
                placeholder="Tags"
                className="border border-gray-400 rounded px-3 py-2 m-2 w-1/4"
                value={data[3]}
                onChangeText={e => {
                    const updated = [...data];
                    updated[3] = e;
                    updateData(i, updated);
                }}
            />

        </View>
    );
}