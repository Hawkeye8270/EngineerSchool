define(['tslib', '@docsvision/webclient/Generated/DocsVision.WebClient.Models', '@docsvision/webclient/System/$MessageBox', '@docsvision/webclient/System/ExtensionManager'], (function (tslib, DocsVision_WebClient_Models, $MessageBox, ExtensionManager) { 'use strict';

  var CommonLogic = /** @class */ (function () {
      function CommonLogic() {
      }
      CommonLogic.prototype.tryParseInt = function (value) {
          if (value === null || value === undefined || typeof value !== 'string') {
              return undefined;
          }
          var parsed = parseInt(value, 10);
          return isNaN(parsed) ? undefined : parsed;
      };
      CommonLogic.prototype.getEmployeeStatusString = function (status) {
          switch (status) {
              case DocsVision_WebClient_Models.GenModels.StaffEmployeeStatus.Active:
                  return "Активен";
              case DocsVision_WebClient_Models.GenModels.StaffEmployeeStatus.Sick:
                  return "Больничный";
              case DocsVision_WebClient_Models.GenModels.StaffEmployeeStatus.Vacation:
                  return "Отпуск";
              case DocsVision_WebClient_Models.GenModels.StaffEmployeeStatus.BusinessTrip:
                  return "Командировка";
              case DocsVision_WebClient_Models.GenModels.StaffEmployeeStatus.Absent:
                  return "Отсутствует";
              case DocsVision_WebClient_Models.GenModels.StaffEmployeeStatus.Discharged:
                  return "Уволен";
              case DocsVision_WebClient_Models.GenModels.StaffEmployeeStatus.Transfered:
                  return "Переведён";
              case DocsVision_WebClient_Models.GenModels.StaffEmployeeStatus.DischargedNoRestoration:
                  return "Уволен без восстановления";
              default:
                  return "Неизвестный статус";
          }
      };
      return CommonLogic;
  }());

  var ApplicationPurchaseEquipmentLogic = /** @class */ (function (_super) {
      tslib.__extends(ApplicationPurchaseEquipmentLogic, _super);
      function ApplicationPurchaseEquipmentLogic() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      ApplicationPurchaseEquipmentLogic.prototype.showFullCombinedContent = function (layout) {
          var _a, _b;
          return tslib.__awaiter(this, void 0, void 0, function () {
              var messageLines, fieldsToCheck, _i, fieldsToCheck_1, field, control, value, fieldLabel, displayValue, date;
              return tslib.__generator(this, function (_c) {
                  switch (_c.label) {
                      case 0:
                          messageLines = [];
                          fieldsToCheck = [
                              { name: "textBoxName", type: "TextBox", },
                              { name: "dateTimePicker1", type: "DateTimePicker", },
                              { name: "regDate1", type: "DateTimePicker", },
                              { name: "regDate11", type: "DateTimePicker", },
                              { name: "textArea1", type: "TextArea", }
                          ];
                          for (_i = 0, fieldsToCheck_1 = fieldsToCheck; _i < fieldsToCheck_1.length; _i++) {
                              field = fieldsToCheck_1[_i];
                              control = layout.controls.get(field.name);
                              if (!control) {
                                  messageLines.push(" " + field.name + ": \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D");
                                  continue;
                              }
                              value = (_a = control.params) === null || _a === void 0 ? void 0 : _a.value;
                              fieldLabel = ((_b = control.params) === null || _b === void 0 ? void 0 : _b.labelText) || field.name;
                              if (value === null || value === undefined || value === "") {
                                  messageLines.push(" " + fieldLabel + ": \u043F\u0443\u0441\u0442\u043E");
                              }
                              else {
                                  displayValue = void 0;
                                  if (field.type === "DateTimePicker") {
                                      date = new Date(value);
                                      displayValue = date.toLocaleDateString('ru-RU');
                                  }
                                  else if (field.type === "TextArea") {
                                      displayValue = value.length > 100 ? value.substring(0, 100) + "..." : value;
                                  }
                                  else {
                                      displayValue = value.toString();
                                  }
                                  messageLines.push(" " + fieldLabel + ": " + displayValue);
                              }
                          }
                          return [4 /*yield*/, layout.getService($MessageBox.$MessageBox).showInfo(messageLines.join('\n\n'), "Содержимое необходимых полей")];
                      case 1:
                          _c.sent();
                          return [2 /*return*/];
                  }
              });
          });
      };
      return ApplicationPurchaseEquipmentLogic;
  }(CommonLogic));

  /**
   * Выводит содержимое заданных контролов при нажатии на кнопку "Ззапрос данных"
   * @param sender контролы
   */
  function ddApplicationPurchaseEquipment_requestFullInfo_onDataChanged(sender, args) {
      return tslib.__awaiter(this, void 0, void 0, function () {
          var logic;
          return tslib.__generator(this, function (_a) {
              switch (_a.label) {
                  case 0:
                      if (!sender) {
                          return [2 /*return*/];
                      }
                      logic = new ApplicationPurchaseEquipmentLogic();
                      return [4 /*yield*/, logic.showFullCombinedContent(sender.layout)];
                  case 1:
                      _a.sent();
                      return [2 /*return*/];
              }
          });
      });
  }

  var ApplicationPurchaseEquipmentHandlers = /*#__PURE__*/Object.freeze({
    __proto__: null,
    ddApplicationPurchaseEquipment_requestFullInfo_onDataChanged: ddApplicationPurchaseEquipment_requestFullInfo_onDataChanged
  });

  // Главная входная точка всего расширения
  // Данный файл должен импортировать прямо или косвенно все остальные файлы, 
  // чтобы rollup смог собрать их все в один бандл.
  // Регистрация расширения позволяет корректно установить все
  // обработчики событий, сервисы и прочие сущности web-приложения.
  ExtensionManager.extensionManager.registerExtension({
      name: "ExampleWebExtension",
      version: "1.0",
      globalEventHandlers: [ApplicationPurchaseEquipmentHandlers],
      layoutServices: [],
      controls: []
  });

}));
//# sourceMappingURL=extension.js.map
