export const nowDateUTC = () => {
  const now = new Date()
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
}

export const getIndexedDate = (date: Date, monthStartDay: number = 1) => {
  const monthShift = monthStartDay > 15 ? 1 : 0

  return new Date(
    date.getFullYear(),
    date.getDate() < monthStartDay
      ? date.getMonth() - 1 + monthShift
      : date.getMonth() + monthShift,
    monthStartDay,
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
  const selectedIndexedDate = new Date(indexedYear, monthIndex, monthStartDay)

  if (selectedIndexedDate >= currentIndexedDate) {
    return currentDate
  } else {
    return new Date(indexedYear, monthIndex + 1, monthStartDay - 1)
  }
}
