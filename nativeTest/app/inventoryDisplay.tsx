import { Pressable, Text, View, ScrollView, TextInput } from "react-native";
import InventorySection from './pages/components/inventorySection'
import { InventoryData, FormData } from './pages/interfaces/InventoryInterfaces'
import { useForm, useFieldArray } from "react-hook-form";
import { useState, useMemo } from "react";

export default function InventoryDisplay() {
    const [filter, setFilter] = useState("");
    // test data, get real from DB.
    const testData: InventoryData[] = [{ name: "test", amount: 5, amountType: "ml", warningAmt: 2, tags: "" }, { name: "test2", amount: 1, amountType: "pills", warningAmt: 3, tags: "" }];

    const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
        mode: "onChange",
        defaultValues: {
            inventory: testData,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "inventory",
    });

    const onSubmit = (data: FormData) => {
        // add code to put things into DB.
        // console.log(data.inventory);
        reset(data);
    };

    const watchedInventory = watch("inventory");
    const filteredFields = useMemo(() => {
        const normalizedFilter = filter.trim().toLowerCase();

        if (!normalizedFilter) {
            return fields.map((field, index) => ({ field, index }));
        }

        return fields.map((field, index) => ({
            field,
            index,
            value: watchedInventory?.[index],
        })).filter(({ value }) =>
            value?.name?.toLowerCase().includes(normalizedFilter) ||
            value?.tags?.toLowerCase().includes(normalizedFilter)
        );

    }, [fields, watchedInventory, filter]);

    return (
        <View className="flex-row flex-wrap items-center justify-center">
            <Text className="w-1/12 text-center">Filter:</Text>
            <TextInput
                className="w-10/12 border border-gray-400 rounded px-3 py-2 m-2"
                placeholder="Filter by name, and tags"
                value={filter}
                onChangeText={setFilter}
            />

            <Text className="w-1/4 text-center">Name</Text>
            <Text className="w-1/12 text-center">Amount</Text>
            <Text className="w-1/12 text-center">Amount Type</Text>
            <Text className="w-1/12 text-center">Warning Amount</Text>
            <Text className="w-5/12 text-center">Tags</Text>
            <Text className="w-1/12 text-center">Delete</Text>

            <ScrollView className="max-h-96">
                {filteredFields.map((filtered) => <InventorySection
                    key={filtered.field.id}
                    control={control}
                    index={filtered.index}
                    remove={remove}
                    errors={errors}
                />)
                }
            </ScrollView>

            <Pressable
                className="bg-blue-600 p-4 rounded-lg w-full m-2"
                onPress={() =>
                    append({
                        name: "",
                        amount: 0,
                        amountType: "",
                        warningAmt: 0,
                        tags: "",
                    })
                }
            >
                <Text className="text-white text-center">Add New</Text>
            </Pressable>

            <Pressable
                className="bg-green-600 p-4 rounded-lg w-1/2"
                onPress={handleSubmit(onSubmit)}
            >
                <Text className="text-white text-center">Submit</Text>
            </Pressable>

            <Pressable
                className="bg-red-600 p-4 rounded-lg w-1/2"
                onPress={() => reset()}
            >
                <Text className="text-white text-center">Cancel</Text>
            </Pressable>
        </View>
    );
}