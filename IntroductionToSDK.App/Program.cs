using DocsVision.BackOffice.CardLib.CardDefs;
using DocsVision.BackOffice.ObjectModel;
using DocsVision.BackOffice.ObjectModel.Services;
using DocsVision.Platform.ObjectManager;
using DocsVision.Platform.ObjectModel;
using DocsVision.Platform.ObjectModel.Search;


namespace IntroductionToSDK {
	internal class Program {
		public static void Main(string[] args) {
			var serverURL = System.Configuration.ConfigurationManager.AppSettings["DVUrl"];
			var username = System.Configuration.ConfigurationManager.AppSettings["Username"];
			var password = System.Configuration.ConfigurationManager.AppSettings["Password"];

			var sessionManager = SessionManager.CreateInstance();
			sessionManager.Connect(serverURL, String.Empty, username, password);

			UserSession? session = null;
			try {
				session = sessionManager.CreateSession();
				var context = CreateContext(session);
				CreateOneCard(session, context);
				//CreateSetOfCards(session, context);
				Console.WriteLine("Программа завершена. Нажмите Enter для выхода...");
				Console.ReadLine();
			} finally {
				session?.Close();
			}
		}

		public static ObjectContext CreateContext(UserSession session) {
			return DocsVision.BackOffice.ObjectModel.ContextFactory.CreateContext(session);
		}


		static void ChangeCardState(ObjectContext context, Document card, string targetState) {
			IStateService stateSvc = context.GetService<IStateService>();
			var branch = stateSvc.FindLineBranchesByStartState(card.SystemInfo.State)
				.FirstOrDefault(s => s.EndState.DefaultName == targetState);
			stateSvc.ChangeState(card, branch);
		}


		public static void CreateOneCard(UserSession session, ObjectContext context) {
			var officeMemoKind = context.FindObject<KindsCardKind>(
			 	new QueryObject(
			 		KindsCardKind.NameProperty.Name, "Заявка на командировку"));

			var requestTypeId = new Guid("{4538149D-1FC7-4D41-A104-890342C6B4F8}");
			var requestType = context.GetObject<BaseUniversalItem>(requestTypeId);

			var docSvc = context.GetService<IDocumentService>();
			var staffSvc = context.GetService<IStaffService>();
			var baseUnSrv = context.GetService<IBaseUniversalService>();
			var officeMemo = docSvc.CreateDocument(null, officeMemoKind);

			officeMemo.MainInfo.Name = "Card created from code_18";              // Название
			officeMemo.MainInfo[CardDocument.MainInfo.RegDate] = DateTime.Now;  // дата создания
			officeMemo.MainInfo.Registrar = staffSvc.GetCurrentEmployee();      // Автор заявки

			officeMemo.MainInfo.Item = requestType;

			officeMemo.MainInfo["DateFrom"] = new DateTime(2024, 10, 15);       // дата C:
			officeMemo.MainInfo["DateTo"] = new DateTime(2024, 11, 02);         // дата по:

			// количество дней в командировке (посчитанное)
			var dateFrom = officeMemo.MainInfo["DateFrom"] as DateTime?;
			var dateTo = officeMemo.MainInfo["DateTo"] as DateTime?;
			TimeSpan difference = dateTo.Value - dateFrom.Value;
			int daysDifference = (int)difference.TotalDays;
			officeMemo.MainInfo["SumDays"] = daysDifference;

			// // количество дней в командировке (если рукави вводим)
			// officeMemo.MainInfo["SumDays"] = "5";                             

			// // сумма командировочных (если руками вводим)   
			// officeMemo.MainInfo["SumMoney"] = "23,25";                          




			// Организация (CardDocument.MainInfo.ResponsDepartment)
			var organizations = (IList<BaseCardSectionRow>)officeMemo.GetSection(CardDocument.MainInfo.ID);
			var organizationMikoyan = new BaseCardSectionRow();
			organizationMikoyan[CardDocument.MainInfo.ResponsDepartment] = staffSvc.FindCompanyByNameOnServer(null, "Микоян")?.GetObjectId();
			organizations.Add(organizationMikoyan);

			// Основание для поездки
			officeMemo.MainInfo["Text"] = "Судьба зовет";

			// Кто оформляет
			officeMemo.MainInfo.Author = staffSvc.GetCurrentEmployee();

			// Согласующий ( из staffSvc.FindEmpoyeeByAccountName в CardDocument.MainInfo.SenderStaffEmployee)
			var approvers = (IList<BaseCardSectionRow>)officeMemo.GetSection(CardDocument.MainInfo.ID);
			var approver = new BaseCardSectionRow();
			approver[CardDocument.MainInfo.SenderStaffEmployee] = staffSvc.FindEmpoyeeByAccountName("ENGINEER\\KuznecovVI")?.GetObjectId();
			approvers.Add(approver);


			// Санкт-Петербург - 44994B0B-D8C5-4777-A62A-FD46F61E9800
			// Москва - 3466BBD0-D5E2-4229-82A1-BE9DA9ADFAA0
			// Псков - 83D4837E-D1B4-4CCE-ABBF-15C5AB6200CC
			// Справочник городов - 02A9DB08-861B-4445-8C6F-7B105E36771A

			// Город
			officeMemo.MainInfo["Cities"] = new Guid("3466BBD0-D5E2-4229-82A1-BE9DA9ADFAA0");

			// Суточные
			officeMemo.MainInfo["PricePerDay"] = 3000;

			// сумма командировочных (посчитанная). Если не вводим руками.
			int PricePerDay = (int)officeMemo.MainInfo["PricePerDay"];
			officeMemo.MainInfo["SumMoney"] = daysDifference * PricePerDay;

			// Билеты (0 - Авия, 1 - Поезд)
			var tickets = (IList<BaseCardSectionRow>)officeMemo.GetSection(CardDocument.MainInfo.ID);
			var ticket = tickets.First();
			ticket["Tickets"] = 0;

			// Командируемый ( из staffSvc.FindEmpoyeeByAccountName в CardDocument.MainInfo.SenderStaffEmployee)
			var trevelerID = new BaseCardSectionRow();
			var traveler = staffSvc.FindEmpoyeeByAccountName("ENGINEER\\LebedevIP");
			trevelerID[CardDocument.MainInfo.ClerkId] = traveler?.GetObjectId();
			approvers.Add(trevelerID);

			// Руководитель
			officeMemo.MainInfo["Manager"] = staffSvc.GetEmployeeManager(traveler);

			// Телефон
			officeMemo.MainInfo["Phone"] = staffSvc.GetEmployeeManager(traveler).Phone;


			context.AcceptChanges();


			// Загрузка файла
			string filePath = @"D:\Temp\HomeWork_02.docx";
			docSvc.AddMainFile(officeMemo, filePath);


			context.AcceptChanges();

			// Смена состояния на "На согласовании"
			ChangeCardState(context, officeMemo, "under_approval");

			context.AcceptChanges();
		}

		public static void CreateSetOfCards(UserSession session, ObjectContext context) {

			var officeMemoKind = context.FindObject<KindsCardKind>(
				new QueryObject(
					KindsCardKind.NameProperty.Name, "Заявка на командировку"));

			var requestTypeId = new Guid("{4538149D-1FC7-4D41-A104-890342C6B4F8}");
			var requestType = context.GetObject<BaseUniversalItem>(requestTypeId);

			var docSvc = context.GetService<IDocumentService>();
			var staffSvc = context.GetService<IStaffService>();
			var baseUnSrv = context.GetService<IBaseUniversalService>();

			// Списки для рандомного выбора
			var approversList = new[]
			{
			"ENGINEER\\KuznecovVI", "ENGINEER\\KolesnikovaSN", "ENGINEER\\IvanovAS",
			"ENGINEER\\LebedevIP", "ENGINEER\\SemenovKM", "ENGINEER\\SamoilovPN",
			"ENGINEER\\PetrovaSA", "ENGINEER\\MikhailovSA"
		};

			var citiesList = new[]
			{
			new Guid("44994B0B-D8C5-4777-A62A-FD46F61E9800"),	// Санкт-Петербург
			new Guid("3466BBD0-D5E2-4229-82A1-BE9DA9ADFAA0"),	// Москва
			new Guid("83D4837E-D1B4-4CCE-ABBF-15C5AB6200CC")	// Псков
		};

			var filePaths = new[]
			{
			@"D:\Temp\HomeWork_01.docx",
			@"D:\Temp\HomeWork_02.docx",
			@"D:\Temp\HomeWork_03.docx",
			@"D:\Temp\HomeWork_04.docx"
		};

			var random = new Random();

			for (int i = 1; i <= 3; i++) {
				var officeMemo = docSvc.CreateDocument(null, officeMemoKind);

				// Название карточки
				officeMemo.MainInfo.Name = $"Карточка из кода {i}-я из 2";
				officeMemo.MainInfo[CardDocument.MainInfo.RegDate] = DateTime.Now;
				officeMemo.MainInfo.Registrar = staffSvc.GetCurrentEmployee();
				officeMemo.MainInfo.Item = requestType;

				// Даты командировки в пределах ноября 2025 года
				int startDay = random.Next(1, 28);
				int duration = random.Next(2, 30);
				DateTime dateFrom = new DateTime(2025, 11, startDay);
				DateTime dateTo = dateFrom.AddDays(duration);

				// Проверяем, чтобы дата окончания не вышла за пределы ноября
				if (dateTo.Month != 11) {
					dateTo = new DateTime(2025, 11, 30);
				}

				officeMemo.MainInfo["DateFrom"] = dateFrom;
				officeMemo.MainInfo["DateTo"] = dateTo;

				// Количество дней в командировке (посчитанное)
				TimeSpan difference = dateTo - dateFrom;
				int daysDifference = (int)difference.TotalDays;
				officeMemo.MainInfo["SumDays"] = daysDifference;

				// Организация (CardDocument.MainInfo.ResponsDepartment)
				var organizations = (IList<BaseCardSectionRow>)officeMemo.GetSection(CardDocument.MainInfo.ID);
				var organizationMikoyan = new BaseCardSectionRow();
				organizationMikoyan[CardDocument.MainInfo.ResponsDepartment] = staffSvc.FindCompanyByNameOnServer(null, "Микоян")?.GetObjectId();
				organizations.Add(organizationMikoyan);

				// Основание для поездки
				officeMemo.MainInfo["Text"] = $"Судьба зовет {i} из 10";

				// Кто оформляет
				officeMemo.MainInfo.Author = staffSvc.GetCurrentEmployee();

				// Согласующий (рандомный)
				var approvers = (IList<BaseCardSectionRow>)officeMemo.GetSection(CardDocument.MainInfo.ID);
				var approver = new BaseCardSectionRow();
				string randomApprover = approversList[random.Next(approversList.Length)];
				approver[CardDocument.MainInfo.SenderStaffEmployee] = staffSvc.FindEmpoyeeByAccountName(randomApprover)?.GetObjectId();
				approvers.Add(approver);

				// Город (рандомный)
				Guid randomCity = citiesList[random.Next(citiesList.Length)];
				officeMemo.MainInfo["Cities"] = randomCity;

				// Суточные в зависимости от города
				int pricePerDay = 0;
				if (randomCity == citiesList[0])
					pricePerDay = 7000;
				else if (randomCity == citiesList[1])
					pricePerDay = 10000;
				else if (randomCity == citiesList[2])
					pricePerDay = 4000;

				officeMemo.MainInfo["PricePerDay"] = pricePerDay;

				// Сумма командировочных (посчитанная)
				officeMemo.MainInfo["SumMoney"] = daysDifference * pricePerDay;

				// 8. Билеты (рандомно, (0 - Авия, 1 - Поезд))
				var tickets = (IList<BaseCardSectionRow>)officeMemo.GetSection(CardDocument.MainInfo.ID);
				var ticket = tickets.First();
				ticket["Tickets"] = random.Next(0, 2);

				// 9. Командируемый (рандомный)
				var trevelerID = new BaseCardSectionRow();
				string randomTraveler = approversList[random.Next(approversList.Length)];
				var traveler = staffSvc.FindEmpoyeeByAccountName(randomTraveler);
				trevelerID[CardDocument.MainInfo.ClerkId] = traveler?.GetObjectId();
				approvers.Add(trevelerID);

				// Руководитель
				officeMemo.MainInfo["Manager"] = staffSvc.GetEmployeeManager(traveler);

				// Телефон
				officeMemo.MainInfo["Phone"] = staffSvc.GetEmployeeManager(traveler)?.Phone;

				context.AcceptChanges();

				// 10. Загрузка файла (рандомный файл)
				string randomFilePath = filePaths[random.Next(filePaths.Length)];
				docSvc.AddMainFile(officeMemo, randomFilePath);

				context.AcceptChanges();

				// Смена состояния на "На согласовании"
				ChangeCardState(context, officeMemo, "under_approval");

				context.AcceptChanges();

				Console.WriteLine($"Создана карточка: {officeMemo.MainInfo.Name}");
			}
		}
	}
}

