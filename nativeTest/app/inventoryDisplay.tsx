import { Pressable, Text, View, ScrollView, TextInput } from "react-native";
import InventorySection from './pages/components/inventorySection';
import { FormData } from './pages/interfaces/InventoryInterfaces';
import { useForm, useFieldArray } from "react-hook-form";
import { useState, useMemo } from "react";
import { getInventoryCategories, getInventoryItems, submitInventory, testTypes } from '../src/services/inventoryService';

export default function InventoryDisplay() {
  const testCategories = getInventoryCategories();
  const invData = getInventoryItems();

  const [filter, setFilter] = useState("");

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    mode: "onChange",
    defaultValues: { inventory: invData },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "inventory" });

  const onSubmit = (data: FormData) => {
    submitInventory(data.inventory, invData);

    reset({ inventory: getInventoryItems() });
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
      value?.name.toLowerCase().includes(normalizedFilter) ||
      value?.category?.label.toLowerCase().includes(normalizedFilter)
    );
  }, [fields, watchedInventory, filter]);

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="w-full text-center">Inventory System</Text>
      <View className="w-full flex-row items-center justify-center">
        <Text className="w-1/12 text-center">Filter:</Text>
        <TextInput
          className="w-10/12 border border-gray-400 rounded px-3 py-2 m-2"
          placeholder="Filter by name, and category"
          value={filter}
          onChangeText={setFilter}
        />
      </View>

      <View className="flex-row w-full">
        <Text className="w-1/5 text-center">Name</Text>
        <Text className="w-1/12 text-center">Amount</Text>
        <Text className="w-1/6 text-center">Amt Type</Text>
        <Text className="text-center">Warning Amt</Text>
        <Text className="w-3/12 text-center">Category</Text>
        <Text className="w-1/12 text-center">Delete</Text>
      </View>

      <ScrollView className="flex-1 w-full">
        {filteredFields.map((filtered) => (
          <InventorySection
            key={filtered.field.id}
            control={control}
            index={filtered.index}
            remove={remove}
            errors={errors}
            amtTypeData={testTypes}
            tagsTypeData={testCategories}
          />
        ))}
      </ScrollView>

      <View className="flex-row w-full">
        <Pressable
          className="bg-blue-600 p-4 rounded-lg w-1/2"
          onPress={() => append({
            itemId: null,
            name: "",
            amount: 0,
            amountType: null,
            warningAmt: 2,
            category: null,
            medicationTypeId: null
          })}
        >
          <Text className="text-white text-center">Add New</Text>
        </Pressable>
        <Pressable
          className="bg-green-600 p-4 rounded-lg w-1/2"
          onPress={handleSubmit(onSubmit)}
        >
          <Text className="text-white text-center">Submit</Text>
        </Pressable>
      </View>
    </View>
  );
}