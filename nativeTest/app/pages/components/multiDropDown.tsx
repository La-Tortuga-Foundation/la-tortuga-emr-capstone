import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";

type multiProps = { data: string[]; onSelect: (items: string[]) => void };

export default function MultiSelectDropdown({ data, onSelect }: multiProps) {
    const [open, setOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const toggleItem = useCallback((item: string) => {
        const updated = selectedItems.includes(item) ? selectedItems.filter((i) => i !== item) : [...selectedItems, item];
        setSelectedItems(updated);
        onSelect(updated);
    }, [selectedItems, onSelect]
    );

    return (
        <View className="flex-1">
            <Pressable className="bg-blue-200 p-2 m-2 rounded-lg w-full"
                onPress={() => setOpen(!open)}
            >
                <Text>
                    {selectedItems.length > 0
                        ? selectedItems.join(", ")
                        : "Select items"}
                </Text>
            </Pressable>

            {open && (
                <ScrollView>
                    {data.map((item: string) => (
                        <Pressable className="bg-blue-200 p-2 m-2 rounded-lg w-full"
                            key={item}
                            onPress={() => toggleItem(item)}
                        >
                            <Text>
                                {selectedItems.includes(item) ? "✓ " : ""}
                                {item}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}