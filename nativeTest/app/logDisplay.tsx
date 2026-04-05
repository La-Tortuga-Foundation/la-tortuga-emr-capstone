import { query, run } from '../src/services/db';
import { Pressable, ScrollView, Text, View } from "react-native";
import { logRow } from './pages/interfaces/InventoryInterfaces';
import { useState, useEffect } from "react";

export default function LogDisplay() {
    const [logs, setLogs] = useState<logRow[]>([]);

    function deleteItem(msg: string) {
        run("DELETE FROM logs WHERE logMessage = ?", [msg]);
        setLogs(prev => prev.filter(e => e.logMessage !== msg));
    }

    useEffect(() => {
        const data = query<logRow>('SELECT logMessage FROM logs');
        setLogs(data);
    }, []);

    return (
        <View className="flex-1 bg-gray-100 items-center justify-center p-4">
            <Text className="text-xl font-bold mb-4">Logs</Text>
            {logs.length === 0 ? <Text className="flex-1 text-center text-gray-800">Logs Empty</Text> :
                <ScrollView
                    className="w-full"
                    contentContainerStyle={{ alignItems: 'center', paddingBottom: 20 }}
                >

                    {logs.map(e => (
                        <View
                            key={e.logMessage}
                            className="w-11/12 bg-white p-4 mb-3 rounded-2xl shadow flex-row items-center justify-between"
                        >
                            <Text className="flex-1 text-center text-gray-800">
                                {e.logMessage}
                            </Text>

                            <Pressable
                                className="bg-red-500 px-3 py-2 ml-3 rounded-lg"
                                onPress={() => deleteItem(e.logMessage)}
                            >
                                <Text className="text-white font-semibold">Remove</Text>
                            </Pressable>
                        </View>
                    ))}
                </ScrollView>}
        </View>
    );
}