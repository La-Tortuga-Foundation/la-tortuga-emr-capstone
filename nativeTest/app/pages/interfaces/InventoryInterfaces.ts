import { FieldError, Control, UseFieldArrayRemove } from "react-hook-form"

export interface InventoryData {
    name: string
    amount: number
    amountType: string
    warningAmt: number
    tags: string
}
export type FormData = {
    inventory: InventoryData[];
};
export type Props = {
    control: Control<FormData>;
    index: number;
    remove: UseFieldArrayRemove;
    errors: FieldError<FormData>;
};