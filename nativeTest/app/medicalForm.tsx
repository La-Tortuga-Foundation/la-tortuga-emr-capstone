import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useState } from 'react';
import { Checkbox } from "./pages/components/checkBox";
import { Controller, useForm } from "react-hook-form";

interface MedicalHistorySchema {
  title: string;
  name: string;

  familyHistory: {
    description: string;
    asthma: string;
    diabetes: string;
    cancer: string;
    hypertension: string;
    allergies: string;
    otherCondition: string;
  };

  personalProblems: {
    description: string;

    neurological: {
      sectionTitle: string;
      headache: string;
      blurredVision: string;
      depressedFeelings: string;
      difficultySleeping: string;
    };

    digestive: {
      sectionTitle: string;
      nausea: string;
      vomiting: string;
      diarrhea: string;
      constipation: string;
      stomachPain: string;
      heartburn: string;
    };

    genitourinary: {
      sectionTitle: string;
      frequency: string;
      urgency: string;
      burning: string;
      pain: string;
      sores: string;
      discharge: string;
    };

    musculoskeletal: {
      sectionTitle: string;
      arthritis: string;
      brokenBones: string;
      sprains: string;
    };

    ent: {
      sectionTitle: string;
      soreThroat: string;
      allergies: string;
      itching: string;
      earPain: string;
    };

    cardiopulmonary: {
      sectionTitle: string;
      difficultyBreathing: string;
      chestPain: string;
      highBloodPressurePalpitations: string;
      coughingBlood: string;
    };

    skin: {
      sectionTitle: string;
      sores: string;
      rashes: string;
      unusualSpots: string;
      itching: string;
    };

    other: {
      sectionTitle: string;
    };
  };

  medications: {
    question: string;
  };

  assessment: {
    sectionTitle: string;
    date: string;
    heightWeight: string;
    temperature: string;
    pulseOxygen: string;
    respiration: string;
    bloodPressure: string;
    glucoseLevel: string;
  };

  additionalExams: {
    documentation: string;
  };

  carePlan: {
    goals: string;
  };
};


type Language = "en" | "sp";

const medicalHistory: MedicalHistorySchema = {
  title: "Medical History",
  name: "Name",

  familyHistory: {
    description:
      "Family health history (Check the illnesses that someone in your family has and indicate next to the illness which family member had it)",
    asthma: "Asthma (difficulty breathing)",
    diabetes: "Diabetes (blood sugar levels)",
    cancer: "Cancer (tumors)",
    hypertension: "Hypertension (high blood pressure)",
    allergies: "Allergies (food, seasonal, medications)",
    otherCondition: "Other condition:"
  },

  personalProblems: {
    description:
      "Personal problems (Check all that apply and explain below)",

    neurological: {
      sectionTitle: "Neurological",
      headache: "Headaches",
      blurredVision: "Blurred vision",
      depressedFeelings: "Depressed feelings",
      difficultySleeping: "Difficulty sleeping"
    },

    digestive: {
      sectionTitle: "Digestive",
      nausea: "Nausea",
      vomiting: "Vomiting",
      diarrhea: "Diarrhea",
      constipation: "Constipation",
      stomachPain: "Stomach pain",
      heartburn: "Heartburn"
    },

    genitourinary: {
      sectionTitle: "Genitourinary",
      frequency: "Frequency",
      urgency: "Urgency",
      burning: "Burning",
      pain: "Pain",
      sores: "Sores",
      discharge:
        "Discharge (Does it have a specific color? Does it have an odor?)"
    },

    musculoskeletal: {
      sectionTitle: "Musculoskeletal",
      arthritis: "Arthritis",
      brokenBones: "Broken bones",
      sprains: "Sprains"
    },

    ent: {
      sectionTitle: "Eyes, ears, nose, and throat",
      soreThroat: "Sore throat",
      allergies: "Allergies",
      itching: "Itching of eyes/nose/throat",
      earPain: "Ear pain"
    },

    cardiopulmonary: {
      sectionTitle: "Cardiopulmonary",
      difficultyBreathing: "Difficulty breathing",
      chestPain: "Chest pain",
      highBloodPressurePalpitations:
        "High blood pressure, palpitations (when the heart beats rapidly)",
      coughingBlood: "Coughing up blood"
    },

    skin: {
      sectionTitle: "Skin",
      sores: "Sores",
      rashes: "Rashes",
      unusualSpots: "Unusual spots",
      itching: "Itching"
    },

    other: {
      sectionTitle: "Other"
    }
  },

  medications: {
    question:
      "Are you taking medications? (including herbs and supplements)"
  },

  assessment: {
    sectionTitle: "Assessment",
    date: "Date",
    heightWeight: "Height & Weight",
    temperature: "Temperature",
    pulseOxygen: "Pulse & O2 Pulse",
    respiration: "Respiration",
    bloodPressure: "Blood Pressure",
    glucoseLevel: "Glucose Level"
  },

  additionalExams: {
    documentation:
      "Include documentation of other examinations:"
  },

  carePlan: {
    goals:
      "Health goals and care plan:"
  }
};
const medicalHistoryEs: MedicalHistorySchema = {
  title: "Historia Médica",
  name: "Nombre",

  familyHistory: {
    description:
      "Historia de salud familiar (Marque las enfermedades que alguien en su familia tiene e indique al lado de la enfermedad el miembro de la familia que lo tuvo)",
    asthma: "Asma (dificultades para respirar)",
    diabetes: "Diabetes (niveles de azúcar en la sangre)",
    cancer: "Cáncer (tumores)",
    hypertension: "Hipertensión (presión arterial alta)",
    allergies: "Alergias (de comida, de las estaciones, de medicamentos)",
    otherCondition: "Otra condición:"
  },

  personalProblems: {
    description:
      "Problemas personales (Marque las que correspondan y explique debajo)",

    neurological: {
      sectionTitle: "Neurológico",
      headache: "Dolor de cabeza",
      blurredVision: "Visión borrosa",
      depressedFeelings: "Sentimientos deprimidos",
      difficultySleeping: "Dificultades para dormir"
    },

    digestive: {
      sectionTitle: "Digestivo",
      nausea: "Náuseas",
      vomiting: "Vómitos",
      diarrhea: "Diarrea",
      constipation: "Estreñimiento",
      stomachPain: "Dolor del estómago",
      heartburn: "Ardor del estómago"
    },

    genitourinary: {
      sectionTitle: "Genitourinario",
      frequency: "Frecuencia",
      urgency: "Urgencia",
      burning: "Ardor",
      pain: "Dolor",
      sores: "Llagas",
      discharge:
        "Secreciones (¿Tiene un color específico? ¿Huele?)"
    },

    musculoskeletal: {
      sectionTitle: "Musculoesquelético",
      arthritis: "Artritis",
      brokenBones: "Huesos rotos",
      sprains: "Torceduras"
    },

    ent: {
      sectionTitle: "Ojos, oídos, nariz y garganta",
      soreThroat: "Dolor de garganta",
      allergies: "Alergias",
      itching: "Picazón de ojos/nariz/garganta",
      earPain: "Dolor de oídos"
    },

    cardiopulmonary: {
      sectionTitle: "Cardiopulmonar",
      difficultyBreathing: "Dificultad para respirar",
      chestPain: "Dolor del pecho",
      highBloodPressurePalpitations:
        "Presión alta, palpitaciones (cuando el corazón late rápidamente)",
      coughingBlood: "Sangre al toser"
    },

    skin: {
      sectionTitle: "Piel",
      sores: "Llagas",
      rashes: "Erupciones",
      unusualSpots: "Manchas peculiares",
      itching: "Picazón"
    },

    other: {
      sectionTitle: "Otros"
    }
  },

  medications: {
    question:
      "¿Está tomando medicamentos? (incluidas las hierbas y suplementos)"
  },

  assessment: {
    sectionTitle: "Evaluación",
    date: "Fecha",
    heightWeight: "Altura y peso",
    temperature: "Temperatura",
    pulseOxygen: "Pulso y O₂",
    respiration: "Respiración",
    bloodPressure: "Presión arterial",
    glucoseLevel: "Nivel de glucosa"
  },

  additionalExams: {
    documentation:
      "Incluir documentación de otras examinaciones:"
  },

  carePlan: {
    goals:
      "Objetivo para la salud y el plan de cuidado:"
  }
};

const languages: Record<Language, MedicalHistorySchema> = {
  en: medicalHistory,
  sp: medicalHistoryEs,
};

export default function medicalForm() {

  const [language, setLanguage] = useState<Language>("en");
  const [test, setTest] = useState('');

  const switchLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "sp" : "en"));
  };
  const { control, handleSubmit } = useForm({
    defaultValues: {
      // Medical conditions
      asthma: false,
      diabetes: false,
      cancer: false,
      hypertension: false,
      allergies: false,
      otherCondition: "",

      // General symptoms
      headache: false,
      blurredVision: false,
      depressedFeelings: false,
      difficultySleeping: false,
      nausea: false,

      // Digestive
      vomiting: false,
      diarrhea: false,
      constipation: false,
      stomachPain: false,
      heartburn: false,

      // Genitourinary
      frequency: false,
      urgency: false,
      burning: false,
      pain: false,
      genSores: false,
      discharge: false,

      // Musculoskeletal
      arthritis: false,
      brokenBones: false,
      sprains: false,

      // ENT
      soreThroat: false,
      entItching: false,
      earPain: false,
      entAllergies: false,

      // Cardiopulmonary
      difficultyBreathing: false,
      chestPain: false,
      highBloodPressurePalpitations: false,
      coughingBlood: false,

      // Skin
      skinSores: false,
      rashes: false,
      unusualSpots: false,
      skinItching: false,
    },
  });
  const onSubmit = (data) => {
    // console.log(data);
  };

  const textBox = languages[language];
  return (
    <ScrollView className="flex-1 items-center">
      <Pressable className="bg-blue-600 p-4 rounded-lg w-full m-2" onPressIn={switchLanguage}><Text className="text-white text-center">Switch Languages</Text></Pressable>
      <View className="flex-row items-center space-x-2">
        <Text className="text-base text-black">{textBox.name}</Text>
        <TextInput
          placeholder={textBox.name}
          className="border border-gray-400 rounded px-3 py-2 w-48"
          value={test}
          onChangeText={setTest}
        />
      </View>

      <Text>{textBox.title}</Text>

      <Text>{textBox.familyHistory.description}</Text>
      <Checkbox name="asthma" control={control} label={textBox.familyHistory.asthma} />
      <Checkbox name="diabetes" control={control} label={textBox.familyHistory.diabetes} />
      <Checkbox name="cancer" control={control} label={textBox.familyHistory.cancer} />
      <Checkbox name="hypertension" control={control} label={textBox.familyHistory.hypertension} />
      <Checkbox name="allergies" control={control} label={textBox.familyHistory.allergies} />
      <Text className="text-gray-700">{textBox.familyHistory.otherCondition}</Text>
      <Controller
        control={control}
        name={`otherCondition`}
        render={({ field: { onChange, value } }) => (
          <TextInput
            className="border border-gray-400 rounded px-3 py-2 m-2"
            value={value}
            onChangeText={onChange}
          />
        )}
      />

      <Text>{textBox.personalProblems.description}</Text>
      <Text>{textBox.personalProblems.neurological.sectionTitle}</Text>
      <Checkbox name="headache" control={control} label={textBox.personalProblems.neurological.headache} />
      <Checkbox name="blurredVision" control={control} label={textBox.personalProblems.neurological.blurredVision} />
      <Checkbox name="depressedFeelings" control={control} label={textBox.personalProblems.neurological.depressedFeelings} />
      <Checkbox name="difficultySleeping" control={control} label={textBox.personalProblems.neurological.difficultySleeping} />

      <Text>{textBox.personalProblems.digestive.sectionTitle}</Text>
      <Checkbox name="nausea" control={control} label={textBox.personalProblems.digestive.nausea} />
      <Checkbox name="vomiting" control={control} label={textBox.personalProblems.digestive.vomiting} />
      <Checkbox name="diarrhea" control={control} label={textBox.personalProblems.digestive.diarrhea} />
      <Checkbox name="constipation" control={control} label={textBox.personalProblems.digestive.constipation} />
      <Checkbox name="stomachPain" control={control} label={textBox.personalProblems.digestive.stomachPain} />
      <Checkbox name="heartburn" control={control} label={textBox.personalProblems.digestive.heartburn} />

      <Text>{textBox.personalProblems.genitourinary.sectionTitle}</Text>
      <Checkbox name="frequency" control={control} label={textBox.personalProblems.genitourinary.frequency} />
      <Checkbox name="urgency" control={control} label={textBox.personalProblems.genitourinary.urgency} />
      <Checkbox name="burning" control={control} label={textBox.personalProblems.genitourinary.burning} />
      <Checkbox name="pain" control={control} label={textBox.personalProblems.genitourinary.pain} />
      <Checkbox name="genSores" control={control} label={textBox.personalProblems.genitourinary.sores} />
      <Checkbox name="discharge" control={control} label={textBox.personalProblems.genitourinary.discharge} />

      <Text>{textBox.personalProblems.musculoskeletal.sectionTitle}</Text>
      <Checkbox name="arthritis" control={control} label={textBox.personalProblems.musculoskeletal.arthritis} />
      <Checkbox name="brokenBones" control={control} label={textBox.personalProblems.musculoskeletal.brokenBones} />
      <Checkbox name="sprains" control={control} label={textBox.personalProblems.musculoskeletal.sprains} />

      <Text>{textBox.personalProblems.ent.sectionTitle}</Text>
      <Checkbox name="soreThroat" control={control} label={textBox.personalProblems.ent.soreThroat} />
      <Checkbox name="entAllergies" control={control} label={textBox.personalProblems.ent.allergies} />
      <Checkbox name="entItching" control={control} label={textBox.personalProblems.ent.itching} />
      <Checkbox name="earPain" control={control} label={textBox.personalProblems.ent.earPain} />

      <Text>{textBox.personalProblems.cardiopulmonary.sectionTitle}</Text>
      <Checkbox name="difficultyBreathing" control={control} label={textBox.personalProblems.cardiopulmonary.difficultyBreathing} />
      <Checkbox name="chestPain" control={control} label={textBox.personalProblems.cardiopulmonary.chestPain} />
      <Checkbox name="highBloodPressurePalpitations" control={control} label={textBox.personalProblems.cardiopulmonary.highBloodPressurePalpitations} />
      <Checkbox name="coughingBlood" control={control} label={textBox.personalProblems.cardiopulmonary.coughingBlood} />

      <Text>{textBox.personalProblems.skin.sectionTitle}</Text>
      <Checkbox name="skinSores" control={control} label={textBox.personalProblems.skin.sores} />
      <Checkbox name="rashes" control={control} label={textBox.personalProblems.skin.rashes} />
      <Checkbox name="unusualSpots" control={control} label={textBox.personalProblems.skin.unusualSpots} />
      <Checkbox name="skinItching" control={control} label={textBox.personalProblems.skin.itching} />

      <Pressable
        className="bg-green-600 p-4 rounded-lg w-1/2"
        onPress={handleSubmit(onSubmit)}
      >
        <Text className="text-white text-center">Submit</Text>
      </Pressable>
    </ScrollView>
  );
}