import { ApplicationPurchaseEquipmentLogic } from "../Logic/ApplicationPurchaseEquipmentLogic";
import { GenModels } from "@docsvision/webclient/Generated/DocsVision.WebClient.Models";
import { IDataChangedEventArgs, IDataChangedEventArgsEx } from "@docsvision/webclient/System/IDataChangedEventArgs";
import { StaffDirectoryItems } from "@docsvision/webclient/BackOffice/StaffDirectoryItems";
import { Layout } from "@docsvision/webclient/System/Layout";
import { ILayout } from "@docsvision/webclient/System/$Layout";
import { CancelableEventArgs } from "@docsvision/webclient/System/CancelableEventArgs";
import { ICardSavingEventArgs } from "@docsvision/webclient/System/ICardSavingEventArgs";
import { DirectoryDesignerRow } from "@docsvision/webclient/BackOffice/DirectoryDesignerRow";



/**
 * Выводит содержимое заданных контролов при нажатии на кнопку "Запрос данных"
 * @param sender контролы
 */
export async function ddApplicationPurchaseEquipment_requestFullInfo_onDataChanged(
    sender: StaffDirectoryItems, 
    args: IDataChangedEventArgsEx<GenModels.IDirectoryItemData>) {
    
    if (!sender) { return; }
    let logic = new ApplicationPurchaseEquipmentLogic();
    
    await logic.showFullCombinedContent(sender.layout);
}


/**
 * Перед сохранене проверяет заполнение поля "Кол-во дней в командировке" и если оно пустое
 * выдает об этом сообщение и отменяет сохранение.
 * @param sender контрол
 */
export function validateNumberField(sender: any, args: any) {
    let numberControl = sender.layout.controls.get("number11") as any;
    let numberValue = numberControl.params?.value;
    let fieldLabel = numberControl.params?.labelText || "number11";
    
    if (numberValue === null || numberValue === undefined || numberValue === "" || isNaN(numberValue)) {
        sender.layout.params.services.messageWindow.showError(
            `Необходимо заполнить поле: ${fieldLabel}` 
        );
        args.cancel = true;
    }
}


/**
 * Проверяем правильность заполнения дат календаря.
 * @param sender контрол
 */
let isInitialLoad = true;

export function ddApplicationPurchaseEquipment_DateChanged_onDataChanged(sender: any, args: any) {
    if (!sender) return;
    
    if (isInitialLoad) {
        isInitialLoad = false;
        return;
    }
    
    const isRealChange = args.oldValue !== args.newValue;
    
    if (!isRealChange) {
        return;
    }
    
    let logic = new ApplicationPurchaseEquipmentLogic();
    logic.checkDatesOrder(sender.layout);
}



/**
 * !!!Событие во время нажатия на кнопку
 */
export async function ddApplicationPurchaseEquipment_testMessage(layout: Layout) {
	if (!layout) { return; }
	let logic = new ApplicationPurchaseEquipmentLogic();

    await logic.sendTestMsg(layout);
}


/**
 * Событие во время сохранения карточки
 * @param layout разметка
 * @param args аргументы
 */
export async function ddApplicationPurchaseEquipment_cardSaving(layout: ILayout, args: CancelableEventArgs<ICardSavingEventArgs>) {
	if (!layout) { return; }
	let logic = new ApplicationPurchaseEquipmentLogic();

    args.wait();
    if (!await logic.savingConfirmed(layout)) {
        args.cancel();
        return;
    } 
    
    await logic.sendSavingMsg(layout);
    args.accept();
}


/**
 * Событие после сохранения карточки
 * @param layout разметка
 */
export async function ddApplicationPurchaseEquipment_cardSaved(layout: Layout) {
	if (!layout) { return; }
	let logic = new ApplicationPurchaseEquipmentLogic();
    await logic.sendSavedMsg(layout);
}


/**
 * Событие после открытия карточки
 * @param layout разметка
 */
export async function ddApplicationPurchaseEquipment_cardOpened(layout: Layout) {
	if (!layout) { return; }
	let logic = new ApplicationPurchaseEquipmentLogic();
    await logic.updatePriceField(layout);
}


/**
 * Событие после изменения значения в контроле "Города"
 * @param sender контрол
 */
export async function ddApplicationPurchaseEquipment_directoryDesignerRowCities_onDataChanged(
    sender: DirectoryDesignerRow, 
    args: IDataChangedEventArgsEx<GenModels.DirectoryDesignerItem>) {
	if (!sender) { return; }
	let logic = new ApplicationPurchaseEquipmentLogic();
    await logic.updatePriceFieldByTypeCtrl(sender);
}


/**
 * Событие после изменения значения в контроле "Автор"
 * @param sender контрол
 */
export async function ddApplicationPurchaseEquipment_staffDirectoryItemsAuthor_onDataChanged(
    sender: StaffDirectoryItems, 
    args: IDataChangedEventArgsEx<GenModels.IDirectoryItemData>) {
	if (!sender) { return; }
	let logic = new ApplicationPurchaseEquipmentLogic();
    await logic.showEmployeeData(sender.layout, args.newValue);
}