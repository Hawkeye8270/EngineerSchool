import { ILayout } from "@docsvision/webclient/System/$Layout";
import { CommonLogic } from "./CommonLogic";
import { $MessageBox } from "@docsvision/webclient/System/$MessageBox";

import { DirectoryDesignerRow } from "@docsvision/webclient/BackOffice/DirectoryDesignerRow";
import { NumberControl } from "@docsvision/webclient/Platform/Number";
import { GenModels } from "@docsvision/webclient/Generated/DocsVision.WebClient.Models";
import { $DepartmentController, $EmployeeController } from "@docsvision/webclient/Generated/DocsVision.WebClient.Controllers";
import { isEmptyGuid } from "@docsvision/webclient/System/GuidUtils";



export class ApplicationPurchaseEquipmentLogic extends CommonLogic {

public async showFullCombinedContent(layout: ILayout) {
    let messageLines = [];
    
    const fieldsToCheck = [
        { name: "textBoxName", type: "TextBox", },
        { name: "dateTimePicker1", type: "DateTimePicker", },
        { name: "regDate1", type: "DateTimePicker", },
        { name: "regDate11", type: "DateTimePicker", },
        { name: "textArea1", type: "TextArea", }
    ];
    
    for (let field of fieldsToCheck) {
        let control = layout.controls.get(field.name) as any;
        
        if (!control) {
            messageLines.push(` ${field.name}: не найден`);
            continue;
        }
        
        let value = control.params?.value;
        let fieldLabel = control.params?.labelText || field.name;
        
        if (value === null || value === undefined || value === "") {
            messageLines.push(` ${fieldLabel}: пусто`);
        } else {
            let displayValue;
            if (field.type === "DateTimePicker") {
                const date = new Date(value);
                displayValue = date.toLocaleDateString('ru-RU');
            } else if (field.type === "TextArea") {
                displayValue = value.length > 100 ? value.substring(0, 100) + "..." : value;
            } else {
                displayValue = value.toString();
            }
            
            messageLines.push(` ${fieldLabel}: ${displayValue}`);
        }
    }
    
    await layout.getService($MessageBox).showInfo(
        messageLines.join('\n\n'),
        "Содержимое необходимых полей"
    );
}


public checkDatesOrder(layout: any) {
        let regDate1 = layout.controls.get("regDate1") as any;
        let regDate11 = layout.controls.get("regDate11") as any;
        
        if (!regDate1 || !regDate11) {
            return;
        }
        
        let date1Value = regDate1.params?.value;
        let date11Value = regDate11.params?.value;
        
        if (date1Value && date11Value) {
            let date1 = new Date(date1Value);
            let date11 = new Date(date11Value);
            
            if (date11 <= date1) {
                let date1Label = regDate1.params?.labelText || "Начальная дата";
                let date11Label = regDate11.params?.labelText || "Конечная дата";
                
                layout.params.services.messageWindow.showWarning(
                    `Внимание: "${date11Label}" должна быть позже "${date1Label}"`
                );
            }
        }
    }

/* -----------------------------------------------------------------------------------------------------*/


    public async sendTestMsg(layout:ILayout) {
        await layout.getService($MessageBox).showInfo('!!!Тестовое сообщение!!!');
    }


    public async savingConfirmed(layout:ILayout): Promise<boolean> {
        try {
            await layout.getService($MessageBox).showConfirmation('Сохранить карточку?');
            return true;
        } catch(e) {
            return false;
        }
    }

    public async sendSavingMsg(layout:ILayout) {
        await layout.getService($MessageBox).showInfo('Карточка сохраняется!');
    }
    
    public async sendSavedMsg(layout:ILayout) {
        await layout.getService($MessageBox).showInfo('Карточка сохранена!');
    }


    
/*===================================================================================================*/




/* -----------------------------------------------------------------------------------------------------*/
    public async updatePriceField(layout:ILayout) {
        const typeCtrl = layout.controls.tryGet<DirectoryDesignerRow>("directoryDesignerRowCities");
        if (!typeCtrl) {
             await layout.getService($MessageBox).showError('Элемент управления directoryDesignerRowCities отсутствует в разметке!');
             return;
        }

        await this.updatePriceFieldByTypeCtrl(typeCtrl);
    }
    
    public async updatePriceFieldByTypeCtrl(typeCtrl:DirectoryDesignerRow) {
        const layout = typeCtrl.layout;
        const priceControl = layout.controls.tryGet<NumberControl>("numberPrice");

        const messageBoxSvc = layout.getService($MessageBox);

        if (!priceControl) {
            await messageBoxSvc.showError('Элемент управления numberPrice отсутствует в разметке!');
            return;
        }

        if (!typeCtrl.params.value || isEmptyGuid(typeCtrl.params.value.id)) {
            priceControl.params.value = null;
            return;
        }
        
        typeCtrl.params.value

        var parsedValue = this.tryParseInt(typeCtrl.params.value.description);
        if (parsedValue === undefined) {
            await messageBoxSvc
                .showError(`В описании строки справочника ${typeCtrl.params.value.name} содержится не число! Значение: ${typeCtrl.params.value.description}`);
            return;
        }

        priceControl.params.value = parsedValue;
        return;
    }
/* -----------------------------------------------------------------------------------------------------*/


    
    public async showEmployeeData(layout: ILayout, itemData:GenModels.IDirectoryItemData) {
        if (!itemData) { return; }
        const messageBoxSvc = layout.getService($MessageBox);
        if (itemData.dataType !== GenModels.DirectoryDataType.Employee) {
            await messageBoxSvc.showError("Неверный тип объекта");
            console.log(itemData);
        }

        

        const employeeModel = await layout.getService($EmployeeController).getEmployee(itemData.id);
        if (employeeModel) {
            const empUnitModel = await layout.getService($DepartmentController).getStaffDepartment(employeeModel.unitId);
            const lines = [
                `ФИО: ${employeeModel.lastName} ${employeeModel.firstName ?? ''} ${employeeModel.middleName ?? ''}`,
                employeeModel.position ? `Должность: ${employeeModel.position}` : null,
                `Статус: ${this.getEmployeeStatusString(employeeModel.status)}`,
                empUnitModel ? `Подразделение: ${empUnitModel.name}` : null,
            ].filter(Boolean).join('\n');

            await messageBoxSvc.showInfo(lines, "Информация о выбранном сотруднике");
        }
    }
}