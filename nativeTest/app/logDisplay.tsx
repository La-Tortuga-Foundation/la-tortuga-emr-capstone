import { query, run } from '../src/services/db';
import { Pressable, Text, View } from "react-native";
import { logRow } from './pages/interfaces/InventoryInterfaces'

export default function LogDisplay() {
    return (
        <View className='flex-1 items-center justify-center'>
            {query<logRow>('SELECT logMessage FROM logs').map(e => { return <Text key={e.logMessage}>{e.logMessage}</Text> })}
        </View>
    );
}