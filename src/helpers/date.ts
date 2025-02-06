export const nowDateUTC = () => {
  const now = new Date()
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
}

export const getMonthIndex = (date: Date, monthStartDay?: number) => {
  if (!monthStartDay) {
    return date.getMonth()
  }
  const monthShift = monthStartDay > 15 ? 1 : 0

  const monthIndex =
    date.getDate() < monthStartDay ? date.getMonth() - 1 + monthShift : date.getMonth() + monthShift

  return monthIndex === -1 ? 11 : monthIndex === 12 ? 0 : monthIndex
}
