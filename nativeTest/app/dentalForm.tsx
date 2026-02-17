import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Button } from '@react-navigation/elements';

const dentalExam = {
  examSte: "STE:",
  examPlaque: "Plaque",
  examCalculus: "Calculus",
  examGingivitis: "Gingivitis",
  examPeriodontitis: "Periodontitis",
  examHealthy: "Healthy",

  painfulTeeth: "Painful teeth:",
  caries: "Caries:",
  fracturedTeeth: "Fractured teeth:",

  plan: "Plan:",

  procedureGeneralCleaning: "General Cleaning",
  procedureDeepCleaningScaling: "Deep Cleaning / Scaling",
  procedureSdf: "SDF",
  procedureExtraction: "Extraction:",

  anesthesiaSeptocaine: "Septocaine",

  visitRoutine: "Routine",
  visitSurgical: "Surgical",

  suture: "Suture",

  analgesics: "Analgesics",
  antibiotics: "Antibiotics",

  followUp: "Follow Up"
};


export default function dentalForm() {
    interface languageBox {
head: string;
}

const en : languageBox = {head: "Test"};
const sp : languageBox = {head: "Spanish"};
    const [textBox, ChangeTextType] = useState<languageBox>(en);
    let [languageString, changeLanguageString] = useState<string>("English");

function switchTextTypes() {
    if (languageString === "English") {
        ChangeTextType(sp);
        changeLanguageString("Spanish");
    }
    else {
        ChangeTextType(en);
        changeLanguageString("English");
    }
}
  return (
    <>
    <ThemedText>{textBox.head}</ThemedText>

    <Button onPressIn={switchTextTypes}>Switch</Button>
    </>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
