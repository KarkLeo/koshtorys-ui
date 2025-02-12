export const nowDateUTC = () => {
  const now = new Date()
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
}

export const getIndexedDate = (date: Date, monthStartDay: number = 1) => {
  const monthShift = monthStartDay > 15 ? 1 : 0

  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getDate() < monthStartDay
        ? date.getMonth() - 1 + monthShift
        : date.getMonth() + monthShift,
      monthStartDay,
    ),
  )
}

export const getMonthIndex = (date: Date, monthStartDay: number = 1) => {
  const indexedDate = getIndexedDate(date, monthStartDay)
  return indexedDate.getMonth()
}

export const getIndexedYear = (date: Date, monthStartDay: number = 1) => {
  const indexedDate = getIndexedDate(date, monthStartDay)
  return indexedDate.getFullYear()
}

export const getExchangeDate = (
  monthIndex: number,
  indexedYear: number,
  monthStartDay: number = 1,
): Date => {
  const currentDate = nowDateUTC()
  const currentIndexedDate = getIndexedDate(currentDate, monthStartDay)
  const selectedIndexedDate = new Date(Date.UTC(indexedYear, monthIndex, monthStartDay))
  const monthShift = monthStartDay > 15 ? 1 : 0

  if (selectedIndexedDate >= currentIndexedDate) {
    return currentDate
  } else {
    return new Date(Date.UTC(indexedYear, monthIndex + 1 - monthShift, monthStartDay - 1))
  }
}

export const getMonthPeriod = (monthStartDay: number = 1, date: Date): [Date, Date] => {
  return date.getDate() < monthStartDay
    ? [
        new Date(Date.UTC(date.getFullYear(), date.getMonth() - 1, monthStartDay)),
        new Date(Date.UTC(date.getFullYear(), date.getMonth(), monthStartDay - 1)),
      ]
    : [
        new Date(Date.UTC(date.getFullYear(), date.getMonth(), monthStartDay)),
        new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, monthStartDay - 1)),
      ]
}

export const getStartMonthDate = (
  indexedYear: number,
  monthIndex: number,
  monthStartDay: number = 1,
) => {
  const monthShift = monthStartDay > 15 ? 1 : 0

  return new Date(Date.UTC(indexedYear, monthIndex - monthShift, monthStartDay))
}

export const getChangedDateByMonthIndex = (
  date: Date,
  indexedYear: number,
  monthIndex: number,
  monthStartDay: number = 1,
) => {
  const monthShift = monthStartDay > 15 ? 1 : 0

  return new Date(
    Date.UTC(
      indexedYear,
      date.getDate() < monthStartDay ? monthIndex + 1 - monthShift : monthIndex - monthShift,
      date.getDate(),
    ),
  )
}
