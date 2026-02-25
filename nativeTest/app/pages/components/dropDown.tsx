import React, { useState } from "react";
import {
    View,
    Text,
    Pressable,
} from "react-native";

type dropProps = { data: string[]; onSelect: (items: string) => void };

export default function Dropdown({
    data,
    onSelect,
}: dropProps) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<string>("");

    const handleSelect = (item: string) => {
        setSelected(item);
        setOpen(false);
        onSelect(item);
    };

    return (
        <View className="flex-1">
            <Pressable className="bg-blue-200 p-2 m-2 rounded-lg w-full"
                onPress={() => setOpen(!open)}
            >
                <Text>
                    {selected ? selected : "Choose"}
                </Text>
            </Pressable>

            {open && (
                <View>
                    {data.map((item: string) => (
                        <Pressable className="bg-blue-200 p-2 m-2 rounded-lg w-full"
                            key={item}
                            onPress={() => handleSelect(item)}
                        >
                            <Text>{item}</Text>
                        </Pressable>
                    ))}
                </View>
            )}
        </View>
    );
}