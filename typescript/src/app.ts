export class Holidays {

    static weekdays = {
        MONDAY: 1,
        TUESDAY: 2,
        WEDNESDAY: 3,
        THURSDAY: 4,
        FRIDAY: 5,
        SATURDAY: 6,
        SUNDAY: 0
    } as const

    static weekdaysInSwedish = {
        1: "måndag",
        2: "tisdag",
        3: "onsdag",
        4: "torsdag",
        5: "fredag",
        6: "lördag",
        0: "söndag"
    } as const

    static timeInMilliseconds = {
        SECOND: 1000,
        MINUTE: 1000 * 60,
        HOUR: 1000 * 60 * 60,
        DAY: 1000 * 60 * 60 * 24,
        WEEK: 1000 * 60 * 60 * 24 * 7
    } as const

    /**
     * Checks if a given date is on a weekend or not
     * @param date The date you want to check - yyyy-mm-dd
     * @returns The day in swedish if the given date is on a weekend. Otherwise returns null
     */
    static isWeekend(date: string) {
        const chosenDay = new Date(date).getDay();
        if (chosenDay === this.weekdays.SATURDAY || chosenDay === this.weekdays.SUNDAY) { return this.weekdaysInSwedish[chosenDay]; }
        return null;
    }

    /**
     * Checks if a given date is on a swedish holiday or not
     * @param date The date you want to check - yyyy-mm-dd
     * @returns The holidayname in swedish if the given date is on a holiday. Otherwise returns null
     */
    static isHoliday(date: string) {
        const year = +date.slice(0, 4);
        const holidays = this.calcHolidays(year);
        return holidays.get(date) || null;
    }

    /**
   * @description Gets all the swedish holidays during a year based on Lag (1989:253) om allmänna helgdagar and Semesterlag (1977:480)
    * @param year The year to get holidays for
    * @returns A map with each date as key and name as value.
    */
    static calcHolidays(year: number) {
        const paskDagen = this.calcPaskDagen(year);
        const holidays = new Map<string, string>();

        /** Lag (1989:253) om allmänna helgdagar */
        holidays.set(`${year}-01-01`, 'nyårsdagen');
        holidays.set(`${year}-01-06`, 'trettondedag jul');
        holidays.set(this.calcLangFredagen(paskDagen), 'långfredagen');
        holidays.set(paskDagen, 'påskdagen');
        holidays.set(this.calcAnnandagPask(paskDagen), 'annandag påsk');
        holidays.set(this.calcKristiHimmelsfardsDag(paskDagen), 'kristi himmelsfärdsdag');
        holidays.set(`${year}-05-01`, 'första maj');
        holidays.set(this.calcPingstdagen(paskDagen), 'pingstdagen');
        holidays.set(`${year}-06-06`, 'nationaldagen');
        holidays.set(this.calcMidsommarDagen(year), 'midsommardagen');
        holidays.set(this.calcAllaHelgonsDag(year), 'alla helgons dag');
        holidays.set(`${year}-12-25`, 'juldagen');
        holidays.set(`${year}-12-26`, 'annandag jul');

        /** Semesterlag (1977:480) - Allmän helgdag */
        holidays.set(`${year}-12-24`, 'julafton');
        holidays.set(this.calcMidsommarAfton(year), 'midsommarafton');
        holidays.set(`${year}-12-31`, 'nyårsafton');
        return holidays;
    }

    static calcLangFredagen(paskDagen: string) {
        return this.findClosestWeekDay(paskDagen, this.weekdays.FRIDAY, 'before');
    }

    static calcMidsommarDagen(year: number) {
        return this.findClosestWeekDay(`${year}-06-20`, this.weekdays.SATURDAY, 'after');
    }

    static calcMidsommarAfton(year: number) {
        return this.findClosestWeekDay(`${year}-06-19`, this.weekdays.FRIDAY, 'after');
    }

    static calcAllaHelgonsDag(year: number) {
        return this.findClosestWeekDay(`${year}-10-31`, this.weekdays.SATURDAY, 'after');
    }

    static calcKristiHimmelsfardsDag(paskDagen: string) {
        return this.findNthWeekdayAfter(paskDagen, this.weekdays.THURSDAY, 5);
    }

    static calcPingstdagen(paskDagen: string) {
        return this.findNthWeekdayAfter(paskDagen, this.weekdays.SUNDAY, 7);
    }

    static calcAnnandagPask(paskDagen: string) {
        const paskDagenInMs = new Date(paskDagen).getTime();
        const annandagPaskInMs = paskDagenInMs + this.timeInMilliseconds.DAY;
        return this.formatMillisecondsToDateString(annandagPaskInMs);
    }

    static calcPaskDagen(year: number) {
        /** This formula is based of https://www.eit.lth.se/fileadmin/eit/courses/edi021/DP_Gauss.html */
        const m = 24;
        const n = 5;

        const a = year % 19;
        const b = year % 4;
        const c = year % 7;
        const d = ((19 * a) + m) % 30;
        const e = ((2 * b) + (4 * c) + (6 * d) + n) % 7;
        const f = 22 + d + e;

        let day: string;
        let month: string;

        if (f <= 31) {
            day = f.toString().padStart(2, '0');
            month = '03';
        } else {
            day = (f - 31).toString().padStart(2, '0');
            month = '04';
        }

        let paskdagen = `${year}-${month}-${day}`;
        if (paskdagen === `${year}-04-26`) {
            paskdagen = this.moveNthWeeks(paskdagen, 1, 'before');
        }

        if (paskdagen === `${year}-04-25` && d === 28 && e === 6 && a > 10) {
            paskdagen = this.moveNthWeeks(paskdagen, 1, 'before');
        }

        return paskdagen;
    }

    /**
     * @description Formats a date from milliseconds to a "yyyy-mm-dd"
     * @param timeInMs The date in milliseconds, you want to format
     * @returns The date as "yyyy-mm-dd"
     */
    static formatMillisecondsToDateString(timeInMs: number) {
        return new Date(timeInMs).toLocaleString()
            .split(' ')[0];
    }

    /**
    * @description Finds the closest specified weekday before or after the given start and returns the date of that day
    * @param originDate The date you want to start looking from
    * @param targetDay The weekday you want to find
    * @param direction The direction to look - before or after the starting date
    * @returns The date of the specified weekday
    */
    static findClosestWeekDay(originDate: string, targetDay: number, direction: 'before' | 'after') {
        const originInMs = new Date(originDate).getTime();
        let dateToCheckInMs = new Date(originInMs).getTime();
        for (let i = 0; i < 7; i++) {
            if (new Date(dateToCheckInMs).getDay() === targetDay) { break; }
            if (direction === 'after') { dateToCheckInMs += this.timeInMilliseconds.DAY; }
            else { dateToCheckInMs -= this.timeInMilliseconds.DAY; }
        }

        return this.formatMillisecondsToDateString(dateToCheckInMs);
    }

    /**
     * @description Finds the date of a specified weekday in the nth week from the origin date
     * @param originDate The date you want to start looking from
     * @param weekday The weekday you want to find
     * @param nth Number of weeks from the first occurrence of the specified weekday
     * @returns The found date
     */
    static findNthWeekdayAfter(originDate: string, weekday: number, nth: number) {
        const firstDate = this.findClosestWeekDay(originDate, weekday, 'after');
        return this.moveNthWeeks(firstDate, nth, 'after');
    }

    /**
     * @description Gets the date N weeks before/after the originDate
     * @param originDate The date to start from
     * @param weeksToMove Number of weeks to "jump"
     * @param direction If the date is before or after the originDate
     * @returns The found date
     */
    static moveNthWeeks(originDate: string, weeksToMove: number, direction: 'before' | 'after') {
        const weeksInMs = this.timeInMilliseconds.WEEK * weeksToMove;
        const originDateInMs = new Date(originDate).getTime();
        const resultInMs = direction === 'after' ? originDateInMs + weeksInMs : originDateInMs - weeksInMs;
        return this.formatMillisecondsToDateString(resultInMs);
    }
}
