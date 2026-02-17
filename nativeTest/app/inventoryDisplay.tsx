import { Pressable, Text, TextInput, View } from "react-native";
import { Link } from 'expo-router';
import { useState } from 'react';
import { Button } from '@react-navigation/elements';
import InventorySection from './pages/components/inventorySection'

export default function inventoryDisplay() {
    const [box, setBox] = useState([["test", 5, 2, ""], ["test2", 1, 3, ""]]); // test data, get real from DB.

    function updateData(i: number, val: [string, number, number, string]) {
        const nextSets = [...box];
        nextSets[i] = val;
        setBox(nextSets);
    }

    return (
        <View className="flex-row flex-wrap items-center justify-center">
            <Text className="w-full text-center">Cool Stuff</Text>
            <Text className="w-1/4 text-center">Name</Text>
            <Text className="w-1/4 text-center">Amount</Text>
            <Text className="w-1/4 text-center">Warning Amount</Text>
            <Text className="w-1/4 text-center">Tags</Text>
            {box.map((dataBox, i) => <InventorySection key={`GB${i}`} data={dataBox} i={i} updateData={updateData} />)}
            <Pressable className="bg-blue-600 p-4 rounded-lg w-full m-2" onPressIn={() => updateData(box.length, ["", 0, 0, ""])}>Add New</Pressable>
            <Pressable className="bg-green-600 p-4 rounded-lg w-1/2">Submit</Pressable>
            <Pressable className="bg-red-600 p-4 rounded-lg w-1/2">Cancel</Pressable>
        </View>
    );
}