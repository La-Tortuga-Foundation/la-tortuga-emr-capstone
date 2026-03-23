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
    tags: string[]
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
    deleteArray: RefObject<string[]>;
};
export type CheckboxProps = {
    name: string;
    control: Control<any>;
    label: string;
};