import { ViewStyle } from "react-native";
import { dataForDropDowns, InventoryRow, CategoryRow, MedCategoryRow } from '../interfaces/InventoryInterfaces'
import { query } from '../../../src/services/db'

export const testTypes: dataForDropDowns[] = [{ label: "ml", value: '0' }, { label: "tablet", value: '1' }, { label: "mg", value: '2' }, { label: "g", value: '3' }, { label: "other", value: '4' }];

export function queryInv(testCategories: dataForDropDowns[]) {
    return query<InventoryRow>('SELECT * FROM inventory_items')
        .map((invRow) => { return { itemId: invRow.itemId, name: invRow.name, amount: invRow.quantity, amountType: { label: testTypes.find((element) => invRow.unitTypeId === element.value)?.label ?? "", value: invRow.unitTypeId }, warningAmt: invRow.warningThreshold, category: { label: testCategories.find((element) => invRow.categoryId === element.value)?.label ?? "", value: invRow.categoryId }, medicationTypeId: invRow.medicationTypeId } });
}
export const dropdownStyle: ViewStyle = {
    flex: 1,
}

export function sanitizeNumericInput(text: string, onChange: (...event: any[]) => void) {
    const numeric = text.replace(/[^0-9.]/g, "").replace(/^0+([0-9])/, "$1");
    onChange(numeric === "" ? 0 : numeric);
}