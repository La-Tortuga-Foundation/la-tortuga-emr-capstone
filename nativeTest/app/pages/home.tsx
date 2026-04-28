import { run } from "@/src/services/db";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, Alert } from "react-native";
import "../../global.css";
import { sendWarningOnCurrentInv } from '../../src/services/inventoryService';
import { setSyncCompleteCallback } from '../../src/services/syncManager';
import { getWaitingRoomVisits, updateVisitStatus, updateVisit } from '../../src/services/visits';

export default function Home() {
  const router = useRouter();
  const [visits, setVisits] = useState<any[]>([]);


  const loadVisits = () => {
    try {
      const data = getWaitingRoomVisits();
      console.log('[HOME] Visits from DB:', JSON.stringify(data));
      console.log('[HOME] Visit count:', data.length);
      setVisits(data);
    } catch (e: any) {
      console.error('[HOME] Failed to load visits:', e.message);
    }
  };

useEffect(() => {
  loadVisits();
  setSyncCompleteCallback(() => {
    console.log('[HOME] Sync complete — reloading visits');
    loadVisits();
    console.log('[HOME] Checking inventory warnings...');
    sendWarningOnCurrentInv();
  });
  const interval = setInterval(() => {
    loadVisits();
    sendWarningOnCurrentInv();
  }, 10000);
  return () => clearInterval(interval);
}, []);

  return (
    <View className="flex-1 bg-gray-100 p-5">
      <TouchableOpacity
        className="bg-green-700 p-3 m-2 rounded-lg"
        onPress={() => router.push('/pages/checkIn' as any)}
      >
        <Text className="text-white text-center font-bold">+ New Patient Check-In</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-gray-300 p-2 m-2 rounded-lg"
        onPress={loadVisits}
      >
        <Text className="text-center text-gray-700">Refresh</Text>
      </TouchableOpacity>

      <TouchableOpacity
  onPress={() => { run(`DELETE FROM visits`); run(`DELETE FROM patients`); alert('Cleared!'); }}
  className="bg-red-600 p-4 rounded-lg mt-4"
>
  <Text className="text-white text-center font-bold text-lg">Clear All Data</Text>
</TouchableOpacity>

      <View className="flex-1 bg-gray-100 items-center justify-center">
        <View className="h-5/6 w-full max-w-md px-4 bg-white rounded-lg">
          <Text className="text-2xl font-bold mb-1 p-2 text-center">
            Waiting Room
          </Text>
          <ScrollView>
            {visits.length === 0 ? (
              <Text className="text-center text-gray-400 mt-4">No patients in queue</Text>
            ) : (
              visits.map((v: any) => (                  //use expo routher to pass params
                <TouchableOpacity onPress={()=> 
                router.push({pathname: '/pages/editPatient', params: { patientId: v.patientId }})} key={v.visitId}>
                  
                <View
                  key={v.visitId}
                 className={`p-3 mb-2 rounded-lg border ${
                    v.statusTypeId === 'critical' ? 'bg-red-200 border-red-500' :
                    v.statusTypeId === 'urgent' ? 'bg-orange-100 border-orange-400' :
                    'bg-gray-200 border-gray-400'
                  }`}

                >
                  <View className="flex-row justify-between items-center">
                    <Text className={`font-bold text-base ${v.statusTypeId === 'urgent' ? 'text-red-800' : 'text-gray-800'}`}>
                      {v.firstName} {v.lastName}
                    </Text>
                    {v.statusTypeId === 'critical' && (
                      <Text className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">CRITICAL</Text>
                    )}
                    {v.statusTypeId === 'urgent' && (
                      <Text className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">URGENT</Text>
                    )}
                       {v.statusTypeId === 'waiting' && (
                      <Text className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full font-bold">NORMAL</Text>
                    )}

                  </View>
                  <Text className="text-gray-500 text-sm mt-1">{v.reasonForVisit}</Text>
                 
                  
                  <View className="flex-row justify-between items-center">
                        {v.statusTypeId === 'critical' || v.statusTypeId === 'urgent' ? (
                          <Text className="text-red-600 text-semibold mt-1">⚠ {v.reasonForVisitTag}</Text>
                        ) : (
                          <Text className="text-gray-400 text-xs mt-1"></Text>
                        )}


                      <TouchableOpacity 
                     onPress={() => {
                            Alert.alert('Update Priority: ' + v.firstName + ' ' + v.lastName, 'Select an option', [
                              { text: 'Critical', onPress: () => { 
                                updateVisit(v.visitId, v.reasonForVisit, v.reasonForVisitTag || '', true);
                                updateVisitStatus(v.visitId, 'critical'); 
                                loadVisits(); 
                              }},
                              { text: 'Urgent', onPress: () => { 
                                updateVisit(v.visitId, v.reasonForVisit, v.reasonForVisitTag || '', true);
                                updateVisitStatus(v.visitId, 'urgent'); 
                                loadVisits(); 
                              }},
                              { text: 'Normal', onPress: () => { 
                                updateVisit(v.visitId, v.reasonForVisit, '', false);
                                updateVisitStatus(v.visitId, 'waiting'); 
                                loadVisits();
                              }},


                            ]);

                            }}   >
                        <Text className="text-xl text-gray-500 px-2">⋮</Text>
                      </TouchableOpacity>
                    </View>
                </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}