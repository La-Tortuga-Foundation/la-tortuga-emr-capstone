import { Pressable, Text, View, ScrollView, TextInput, } from "react-native";
import InventorySection from './pages/components/inventorySection'
import { InventoryData, FormData, dataForDropDowns } from './pages/interfaces/InventoryInterfaces'
import { useForm, useFieldArray } from "react-hook-form";
import { useState, useMemo, } from "react";
import { query, run } from '../src/services/db';

type InventoryRow = {
    itemId: string;
    name: string;
    quantity: number;
    unitTypeId: string;
    warningThreshold: number;
    categoryId: string;
};

function generateId(): string {
    return 'p-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}
const testTypes: dataForDropDowns[] = [{ label: "ml", value: '0' }, { label: "pills", value: '1' }, { label: "mg", value: '2' }, { label: "other", value: '3' }];
const testCategories: dataForDropDowns[] = [{ label: "medicine", value: '0' }, { label: "brace", value: '1' }, { label: "bandage", value: '2' }, { label: "other", value: '3' }];
function queryInv() {
    return query<InventoryRow>('SELECT * FROM inventory_items').map((invRow) => { return { itemId: invRow.itemId, name: invRow.name, amount: invRow.quantity, amountType: { label: testTypes.find((element) => invRow.unitTypeId === element.value)?.label ?? "", value: invRow.unitTypeId }, warningAmt: invRow.warningThreshold, tags: invRow.categoryId.split(" ") } });
}

export default function InventoryDisplay() {
    const [filter, setFilter] = useState("");
    // test data, get real from DB.
    const testData: InventoryData[] = queryInv();
    //[{ name: "test", amount: 5, amountType: { label: 'ml', value: '0' }, warningAmt: 2, tags: [] }, { name: "test2", amount: 1, amountType: { label: 'pills', value: '1' }, warningAmt: 3, tags: [] }];

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
        console.log(data.inventory);
        for (const { name, amount, amountType, warningAmt, tags } of data.inventory.filter(e => e.itemId == null)) {
            run(
                `INSERT OR IGNORE INTO inventory_items(itemId, name, medicationTypeId, categoryId, quantity, unitTypeId, warningThreshold) VALUES(?, ?, ?, ?, ?, ?, ?);`,
                [generateId(), name, null, tags.join(" "), amount, amountType?.value, warningAmt]
            );
        }
        for (const { itemId, name, amount, amountType, warningAmt, tags } of data.inventory.filter(e => e.itemId != null)) {
            run(
                `INSERT OR IGNORE INTO inventory_items(itemId, name, medicationTypeId, categoryId, quantity, unitTypeId, warningThreshold) VALUES(?, ?, ?, ?, ?, ?, ?);`,
                [itemId, name, null, tags.join(" "), amount, amountType?.value, warningAmt]
            );
        }
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
            value?.tags?.join(' ').toLowerCase().includes(normalizedFilter)
        );

    }, [fields, watchedInventory, filter]);

    return (
        <View className="flex-1 items-center justify-center">
            <View className="w-full flex-row items-center justify-center">
                <Text className="w-1/12 text-center">Filter:</Text>
                <TextInput
                    className="w-10/12 border border-gray-400 rounded px-3 py-2 m-2"
                    placeholder="Filter by name, and tags"
                    value={filter}
                    onChangeText={setFilter}
                />
            </View>

            <View className="flex-row w-full">
                <Text className="w-1/5 text-center">Name</Text>
                <Text className="w-1/12 text-center">Amount</Text>
                <Text className="w-1/6 text-center">Amt Type</Text>
                <Text className="w-1/11 text-center">Warning Amt</Text>
                <Text className="w-3/12 text-center">Tags</Text>
                <Text className="w-1/12 text-center">Delete</Text>
            </View>

            <ScrollView className="flex-1 w-full">
                {filteredFields.map((filtered) => <InventorySection
                    key={filtered.field.id}
                    control={control}
                    index={filtered.index}
                    remove={remove}
                    errors={errors}
                    amtTypeData={testTypes}
                    tagsTypeData={testCategories}
                />)
                }
            </ScrollView>

            <Pressable
                className="bg-blue-600 p-4 rounded-lg w-full m-2"
                onPress={() =>
                    append({
                        itemId: null,
                        name: "",
                        amount: 0,
                        amountType: null,
                        warningAmt: 0,
                        tags: [],
                    })
                }
            >
                <Text className="text-white text-center">Add New</Text>
            </Pressable>
            <View className="flex-row w-full">
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
        </View>
    );
}