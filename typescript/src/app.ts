const weekdays = {
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
    SUNDAY: 0
} as const

const timeInMilliseconds = {
    SECOND: 1000,
    MINUTE: 1000 * 60,
    HOUR: 1000 * 60 * 60,
    DAY: 1000 * 60 * 60 * 24,
    WEEK: 1000 * 60 * 60 * 24 * 7
} as const

/**
 * @description Calculates all the swedish holidays during a given year based on Lag (1989:253) om allmänna helgdagar
 * @param year Optional param, vill use the current year if none is provided 
 * @returns A map with each date as key and name as value.
 */
function calcHolidays(year?: number) {
    year ??= new Date().getFullYear()
    const paskDagen = calcPaskDagen(year)
    const holidays = new Map<string, string>()
    holidays.set(`${year}-01-01`, "nyårsdagen")
    holidays.set(`${year}-01-06`, "trettondedag jul")
    holidays.set(calcLangFredagen(paskDagen), "långfredagen")
    holidays.set(paskDagen, "påskdagen")
    holidays.set(calcAnnandagPask(paskDagen), "annandag påsk")
    holidays.set(calcKristiHimmelsfardsDag(paskDagen), "kristi himmelsfärdsdag")
    holidays.set(`${year}-05-01`, "första maj")
    holidays.set(calcPingstdagen(paskDagen), "pingstdagen")
    holidays.set(`${year}-06-06`, "nationaldagen")
    holidays.set(calcMidsommarDagen(year), "midsommardagen")
    holidays.set(calcAllaHelgonsDag(year), "alla helgons dag")
    holidays.set(`${year}-12-25`, "juldagen")
    holidays.set(`${year}-12-26`, "annandag jul")
    return holidays
}

/**
 * @description Finds the closest weekday before the given start and returns the date of that day
 * @param originDate The date you want to start looking from
 * @param targetDay The weekday you want to find
 * @param direction The direction to look - before or after the starting date
 * @returns The date of the specified weekday
 */
function findClosestWeekDay(originDate: string, targetDay: number, direction: "before" | "after") {
    const originInMs = new Date(originDate).getTime()
    let dateToCheckInMs = new Date(originInMs).getTime()
    for (let i = 0; i < 7; i++) {
        if (new Date(dateToCheckInMs).getDay() === targetDay) break
        if (direction === "after") dateToCheckInMs += timeInMilliseconds.DAY
        else dateToCheckInMs -= timeInMilliseconds.DAY
    }

    return formatMillisecondsToDateString(dateToCheckInMs)
}

function findNthWeekdayAfter(originDate: string, weekday: number, nth: number) {
    const firstDate = findClosestWeekDay(originDate, weekday, "after")
    return moveNthWeeks(firstDate, nth, "after")
}

function calcLangFredagen(paskDagen: string) {
    return findClosestWeekDay(paskDagen, weekdays.FRIDAY, "before")
}

function calcMidsommarDagen(year: number) {
    return findClosestWeekDay(`${year}-06-20`, weekdays.SATURDAY, "after")
}
function calcAllaHelgonsDag(year: number) {
    return findClosestWeekDay(`${year}-10-31`, weekdays.SATURDAY, "after")
}

function calcKristiHimmelsfardsDag(paskDagen: string) {
    return findNthWeekdayAfter(paskDagen, weekdays.THURSDAY, 5)
}

function calcPingstdagen(paskDagen: string) {
    return findNthWeekdayAfter(paskDagen, weekdays.SUNDAY, 7)
}

function calcAnnandagPask(paskDagen: string) {
    const paskDagenInMs = new Date(paskDagen).getTime()
    const annandagPaskInMs = paskDagenInMs + timeInMilliseconds.DAY
    return formatMillisecondsToDateString(annandagPaskInMs)
}

function calcPaskDagen(year: number) {
    const M = 24
    const N = 5

    const a = year % 19
    const b = year % 4
    const c = year % 7
    const d = ((19 * a) + M) % 30
    const e = ((2 * b) + (4 * c) + (6 * d) + N) % 7
    const f = 22 + d + e

    let day: string
    let month: string

    if (f <= 31) {
        day = f.toString().padStart(2, "0")
        month = "03"
    } else {
        day = (f - 31).toString().padStart(2, "0")
        month = "04"
    }

    let paskdagen = `${year}-${month}-${day}`
    if (paskdagen === `${year}-04-26`) {
        paskdagen = moveNthWeeks(paskdagen, 1, "before")
    }

    if (paskdagen === `${year}-04-25` && d === 28 && e === 6 && a > 10) {
        paskdagen = moveNthWeeks(paskdagen, 1, "before")
    }

    return paskdagen
}

function formatMillisecondsToDateString(timeInMs: number) {
    return new Date(timeInMs).toLocaleString().split(" ")[0]
}

function moveNthWeeks(originDate: string, weeksToMove: number, direction: "before" | "after") {
    const weeksInMs = timeInMilliseconds.WEEK * weeksToMove
    const originDateInMs = new Date(originDate).getTime()
    const resultInMs = direction === "after" ? originDateInMs + weeksInMs : originDateInMs - weeksInMs
    return formatMillisecondsToDateString(resultInMs)
}

// Testing and basic perf measurements

const holidays = calcHolidays()
console.log(holidays)

const intervalls = [
    1,
    10,
    100,
    1000,
    10000,
    100000,
    1000000
]

for (let intervall of intervalls) {
    const measurements = []
    for (let i = 0; i < 100; i++) {
        const start = performance.now()
        calcHolidays()
        const end = performance.now()
        const timeTaken = end - start
        measurements.push(timeTaken)
    }

    const sum = measurements.reduce((prev, curr) => curr + prev, 0)
    const average = sum / measurements.length
    console.log(`För ${intervall} körningar tog funktionen i snitt ${average}ms att genomföra`)
}

