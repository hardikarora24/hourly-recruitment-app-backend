const businessHours = (startDate, endDate) => {
  let minutesWorked = 0

  if (endDate < startDate) {
    return 0
  }

  let current = startDate

  const workHoursStart = 9
  const workHoursEnd = 18
  const includeWeekends = false

  while (current <= endDate) {
    if (
      current.getHours() >= workHoursStart &&
      current.getHours() < workHoursEnd &&
      (includeWeekends
        ? current.getDay() !== 0 && current.getDay() !== 6
        : true)
    ) {
      minutesWorked++
    }

    current.setTime(current.getTime() + 1000 * 60)
  }

  return minutesWorked / 60
}

export default businessHours
