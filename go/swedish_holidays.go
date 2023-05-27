package main

import (
	"fmt"
	"os"
)

func main() {
	testYear := 2023
	fmt.Println(getHolidays(testYear))
}

type swedishHolidays struct {
	nyarsDagen            string
	trettondedagJul       string
	langfredagen          string
	paskDagen             string
	annandagPask          string
	kristiHimmelsfardsdag string
	pingstDagen           string
	nationalDagen         string
	midsommarDagen        string
	allaHelgonsDag        string
	julDagen              string
	annandagJul           string
}

// Based of Lag (1989:253) om allmänna helgdagar
// https://www.riksdagen.se/sv/dokument-lagar/dokument/svensk-forfattningssamling/lag-1989253-om-allmanna-helgdagar_sfs-1989-253
func getHolidays(y int) swedishHolidays {
	fmt.Println("kör", y)
	paskDagen := calcPaskDagen(y)

	fmt.Println("påskdagen", paskDagen)

	return swedishHolidays{
		nyarsDagen:            fmt.Sprintf("%v-01-01", y),
		trettondedagJul:       fmt.Sprintf("%v-01-06", y),
		langfredagen:          "",
		paskDagen:             paskDagen,
		annandagPask:          "",
		kristiHimmelsfardsdag: "",
		pingstDagen:           "",
		nationalDagen:         fmt.Sprintf("%v-06-06", y),
		midsommarDagen:        "",
		allaHelgonsDag:        "",
		julDagen:              fmt.Sprintf("%v-12-25", y),
		annandagJul:           fmt.Sprintf("%v-12-26", y)}
}

// Based on the calculation here:
// https://www.eit.lth.se/fileadmin/eit/courses/edi021/DP_Gauss.htm
func calcPaskDagen(y int) (paskDagen string) {
	M, N, err := getPaskConsts(y)

	if err != nil {
		fmt.Print("An error has occured:", err)
		os.Exit(1)
	}

	a := y % 19
	b := y % 4
	c := y % 7
	d := ((19 * a) + M) % 30
	e := ((2 * b) + (4 * c) + (6 * d) + N) % 7
	day := 22 + d + e

	month := "03"

	if day > 31 {
		day -= 31
		month = "04"
	}

	return fmt.Sprintf("%v-%v-%v", y, month, padNumber(day))
}

func getPaskConsts(y int) (M int, N int, Err error) {
	if 1583 <= y && y <= 1699 {
		return 22, 2, nil
	}

	if 1700 <= y && y <= 1799 {
		return 23, 3, nil
	}

	if 1800 <= y && y <= 1899 {
		return 23, 4, nil
	}

	if 1900 <= y && y <= 1999 {
		return 24, 5, nil
	}

	if 2000 <= y && y <= 2099 {
		return 24, 5, nil
	}

	if 2100 <= y && y <= 2199 {
		return 24, 6, nil
	}

	if 2200 <= y && y <= 2299 {
		return 25, 0, nil
	}

	if 2300 <= y && y <= 2399 {
		return 26, 1, nil
	}

	if 2400 <= y && y <= 2499 {
		return 25, 1, nil
	}

	if 2500 <= y && y <= 2599 {
		return 26, 2, nil
	}

	return 0, 0, fmt.Errorf("The given year - %v - is outside of the possible range - 1583-2600", y)
}

func padNumber(n int) string {
	padding := ""
	if n < 10 {
		padding = "0"
	}
	return fmt.Sprintf("%v%v", padding, n)
}
