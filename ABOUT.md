This is a home expense-tracking application.
The app is similar to typical expense trackers but has several distinguishing features:

- The application does not include incomes — only expenses. The philosophy is that managing expenses is more accessible and more important for most users.
- The app works with monthly financial cycles.
- There is a concept of a budget — it can represent a salary or a desired level of monthly spending.
- The concept of a financial month is introduced. A user can set the start day (for example, a payday), and a financial month runs from that day to the same day of the next calendar month minus one day.
- When computing the month index: if the start day is less than 15, the index matches the calendar month; if the start day is >= 15, the index corresponds to the next calendar month. In effect, the financial month index corresponds to the calendar month that contains the majority of days (this is a fixed rule that does not depend on month length).
- All application logic is built on these concepts.

Transaction history:
- A transaction has a category (from a fixed set), a date, a currency, an amount, and an optional description.
- Transactions can be edited and deleted.

Planned expenses:
- Planned expenses come in two types: one-off (concrete) and dynamic (by category). A one-off plan is a single planned transaction (for example, buying a cabinet). A dynamic plan is a target for a chosen category for the whole month (for example, food, fuel, etc.).
- Regardless of type, a plan can be recurring; in that case it will appear in suggestions for the next month.
- A one-off planned transaction may have a date and can be linked to a real transaction (transactions have a field to reference a plan).
- A plan card shows planned and spent amounts: for a one-off plan this is the linked transaction; for a dynamic plan it is the sum of all transactions in the category that are not linked to one-off plans.

Statistics:
- Standard category statistics are available, including average monthly spending per category.
- There is a daily spending dynamics chart (cumulative sum by day of the month) with a line showing the average cumulative sum for the month — an important indicator.
- A "planned vs spent" metrics section exists but requires further work.

Interface languages: Ukrainian and English.

The user can change the financial month start date, the currency, and the budget at any time.
