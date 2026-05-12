export type RootStackParamList = {
    Tabs: undefined;
};

export type TabParamList = {
    Home: undefined;
    info: undefined;
    Vitals: undefined;
    med: undefined;
    notes: undefined;
    submit: undefined;
};
export interface itemTypes {
    name: string
    vals: number[]
    desc: string;
    control: any;
    fieldName: string;
}
export type inventoryTransaction = {
    itemId: string;
    transactionType: string;
    quantityDelta: number;
    transactionId: string;
}