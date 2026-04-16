import { FieldError, Control, UseFieldArrayRemove } from "react-hook-form"

export interface dataForDropDowns {
    label: string
    value: string
}

export interface InventoryData {
    itemId: string | null
    name: string
    amount: number
    amountType: dataForDropDowns | null
    warningAmt: number
    category: dataForDropDowns | null
    medicationTypeId: string | null;
}
export type FormData = {
    inventory: InventoryData[];
};
export type Props = {
    control: Control<FormData>;
    index: number;
    remove: UseFieldArrayRemove;
    errors: FieldError<FormData>;
    amtTypeData: dataForDropDowns[];
    tagsTypeData: dataForDropDowns[];
};
export type Props2 = {
    control: Control<FormData>;
    index: number;
    remove: UseFieldArrayRemove;
    errors: FieldError<FormData>;
    dbData: InventoryData[];
};
export type CheckboxProps = {
    name: string;
    control: Control<any>;
    label: string;
};
export type InventoryRow = {
    itemId: string;
    name: string;
    quantity: number;
    unitTypeId: string;
    warningThreshold: number;
    categoryId: string;
    medicationTypeId: string;
};
export type CategoryRow = {
    inventoryCategoryId: string;
    label: string;
}
export type MedCategoryRow = {
    medicationCategoryId: string;
    label: string;
}
export type MedRow = {
    medicationTypeId: string;
    name: string;
    categoryId: string;
    defaultUnit: string;
}
export type logRow = {
    logMessage: string;
}