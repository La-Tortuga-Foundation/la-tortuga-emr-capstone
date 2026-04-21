import { query, run } from './db';
import { isClientConnected, sendHandshakeOnExistingConnection } from './syncSocket';
import { InventoryData, InventoryRow, CategoryRow, MedCategoryRow, logRow, dataForDropDowns } from '../../app/pages/interfaces/InventoryInterfaces';
import { ViewStyle } from "react-native";

export const testTypes: dataForDropDowns[] = [
  { label: "ml", value: '0' },
  { label: "tablet", value: '1' },
  { label: "mg", value: '2' },
  { label: "g", value: '3' },
  { label: "other", value: '4' }
];

export const dropdownStyle: ViewStyle = {
  flex: 1,
}

export function sanitizeNumericInput(text: string, onChange: (...event: any[]) => void) {
  const numeric = text.replace(/[^0-9.]/g, "").replace(/^0+([0-9])/, "$1");
  onChange(numeric === "" ? 0 : numeric);
}

function generateId(): string {
  return 'i-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

export function getInventoryCategories(): dataForDropDowns[] {
  return query<CategoryRow>('SELECT * FROM inventory_categories')
    .map(row => ({ label: row.label, value: row.inventoryCategoryId }))
    .concat(
      query<MedCategoryRow>('SELECT * FROM medication_categories')
        .map(row => ({ label: row.label, value: row.medicationCategoryId }))
    );
}

export function getInventoryItems(testCategories: dataForDropDowns[]): InventoryData[] {
  return query<InventoryRow>('SELECT * FROM inventory_items')
    .map(invRow => ({
      itemId: invRow.itemId,
      name: invRow.name,
      amount: invRow.quantity,
      amountType: {
        label: testTypes.find(e => invRow.unitTypeId === e.value)?.label ?? "",
        value: invRow.unitTypeId
      },
      warningAmt: invRow.warningThreshold,
      category: {
        label: testCategories.find(e => invRow.categoryId === e.value)?.label ?? "",
        value: invRow.categoryId
      },
      medicationTypeId: invRow.medicationTypeId
    }));
}

export function submitInventory(inventory: InventoryData[], oldData: InventoryData[]): { numLows: number; finalMessage: string; } {
  const originalInventoryMap = new Map(
    oldData.map(item => [item.itemId, item])
  );
  const updatedInventory = inventory.filter(item => {
    if (!item.itemId) return true;

    const originalItem = originalInventoryMap.get(item.itemId);
    if (!originalItem) { return true };

    const hasChanged =
      originalItem.name !== item.name ||
      originalItem.amount !== item.amount ||
      originalItem.amountType?.value !== item.amountType?.value ||
      originalItem.warningAmt !== item.warningAmt ||
      originalItem.category?.value !== item.category?.value ||
      originalItem.medicationTypeId !== item.medicationTypeId;

    return hasChanged;
  }).map(item => ({
    ...item,
    itemId: item.itemId ?? generateId(),
  }));


  for (const { itemId, name, amount, amountType, warningAmt, category } of updatedInventory) {
    const existing = query<any>(`SELECT itemId, __crsql_version FROM inventory_items WHERE itemId = ?`, [itemId]);
    console.log(`[INVENTORY] Item ${name} current version:`, existing[0]?.__crsql_version);
    run(
      `INSERT INTO inventory_items(itemId, name, medicationTypeId, categoryId, quantity, unitTypeId, warningThreshold, __crsql_version)
      VALUES(?, ?, ?, ?, ?, ?, ?, 1)
      ON CONFLICT(itemId) DO UPDATE SET
      name = excluded.name,
      categoryId = excluded.categoryId,
      quantity = excluded.quantity,
      unitTypeId = excluded.unitTypeId,
      warningThreshold = excluded.warningThreshold,
      __crsql_version = CASE
        WHEN excluded.name != inventory_items.name
          OR excluded.quantity != inventory_items.quantity
          OR excluded.categoryId != inventory_items.categoryId
          OR excluded.unitTypeId != inventory_items.unitTypeId
          OR excluded.warningThreshold != inventory_items.warningThreshold
        THEN inventory_items.__crsql_version + 1
        ELSE inventory_items.__crsql_version
      END;`,
      [itemId, name, null, category?.value, amount, amountType?.value, warningAmt]
    );
    const after = query<any>(`SELECT itemId, __crsql_version FROM inventory_items WHERE itemId = ?`, [itemId]);
    console.log(`[INVENTORY] Item ${name} version after update:`, after[0]?.__crsql_version);
  }

  if (isClientConnected()) {
    console.log('[INVENTORY] Submit — triggering sync on existing connection');
    setTimeout(() => sendHandshakeOnExistingConnection(), 100);
  }

  const logData = query<logRow>('SELECT logMessage FROM logs');
  let finalMessage = "";
  let numLows = 0;

  for (const { name, warningAmt, amount } of updatedInventory.filter(e => e.warningAmt >= e.amount)) {
    const newLogMessage = name + " is low";
    if (!logData.find(e => e.logMessage === newLogMessage)) {
      finalMessage = newLogMessage;
      numLows++;
      run(`INSERT OR IGNORE INTO logs(logMessage) VALUES(?);`, [newLogMessage]);
    }
  }

  return { numLows, finalMessage };
}