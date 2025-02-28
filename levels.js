const LEVELS = [
	// Intro levels (7)
	"0 9 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 2 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 4 1 1 1 1 1 2",
	"0 9 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 2 1 1 1 2 1 1 1 1 1 1 1 1 4 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 3",
	"0 9 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 2 1 1 1 1 1 1 1 1 4 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 4",
	"0 9 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 2 1 1 1 1 1 1 1 1 1 4 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 3 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 5",
	"0 9 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 3 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 4 2 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 3 1 1 3 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 3",
	"0 9 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 2 1 1 1 1 1 1 3 1 1 4 2 1 1 1 3 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 3 1 3 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 4",
	"8 1 2 1 1 1 1 2 1 1 1 2 4 1 1 1 2 2 1 1 1 1 1 1 1 1 1 2 1 1 1 1 1 1 1 2 2 2 2 1 1 1 1 1 1 1 1 2 1 1 1 1 1 1 1 2 2 2 2 1 1 1 1 1 1 1 1 2 1 1 1 1 1 1 1 2 2 2 2 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 12",
	// Sand levels (7)
	"0 9 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 4 1 1 1 1 1 1 1 1 5",
	"0 9 1 1 1 1 1 1 1 1 2 1 1 1 1 1 1 1 1 1 1 4 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 2 1 1 1 1 1 2 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 5",
	"0 9 4 2 1 1 1 1 1 1 1 1 1 2 1 1 1 1 1 1 1 1 1 1 1 1 2 1 1 1 1 1 2 1 2 1 2 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 2 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 2 1 1 1 1 1 8",
	"0 9 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 2 1 1 1 1 1 1 1 1 1 4 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 3 1 1 1 1 1 1 1 1 1 1 1 1 1 1 2 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 2 1 1 6",
	"0 9 1 1 1 1 1 1 1 1 1 1 1 4 1 1 1 1 1 1 1 1 1 2 1 1 1 2 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 3 1 3 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 3 1 1 1 1 1 2 1 1 1 3 1 1 1 1 1 1 1 1 1 1 1 1 1 7",
	"0 9 1 1 1 1 1 1 1 1 1 1 1 1 1 3 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 3 1 1 1 1 1 1 1 1 1 1 1 1 1 1 2 1 1 1 1 1 1 1 1 3 4 2 1 1 1 2 1 1 1 1 1 2 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 5",
	"9 9 1 1 1 1 1 2 2 2 2 4 1 1 3 1 1 1 1 1 2 1 1 1 1 2 2 2 3 1 1 1 1 1 1 2 2 1 1 1 1 2 1 1 1 1 2 1 1 2 2 1 1 2 1 3 1 1 1 1 1 1 1 1 1 1 1 1 2 2 1 1 2 1 1 1 1 1 2 1 1 1 1 1 1 1 1 1 2 2 1 1 1 1 1 1 2 1 1 1 1 1 11",
	// Mirror levels (7)
	"0 8 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 4 53 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 54 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 54 1 1 1 1 1 1 1 1 1 1 1",
	"0 9 1 1 1 1 1 1 4 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 51 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 54 1 1 1 54 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 4",
	"0 9 1 1 1 1 1 1 1 1 52 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 4 1 1 55 1 1 1 3",
	"0 9 2 4 52 1 1 1 1 1 1 1 52 1 1 1 1 1 1 1 1 54 51 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 54 51 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 54 51 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 54 51 1 1 1 1 1 1 1 1 55 1 1 1 1 1 1 1 55 2 2 4",
	"0 0 1 1 2 1 4 1 53 50 1 1 1 1 53 50 1 1 1 53 50 1 1 1 1 1 53 50 1 1 1 53 1 1 1 1 1 53 50 1 1 1 53 50 1 1 1 1 1 53 50 1 1 53 50 1 1 1 1 1 53 1 1 1 1 53 50 1 1 1 1 1 1 1 1 1 53 50 1 1 1 1 1 1 1 1 1 1 53 50 1 1 1 1 1 1 1 1 1 53 50 1 7",
	"0 9 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 52 1 1 1 1 1 1 1 1 1 1 50 1 1 1 1 1 1 1 1 54 4 1 54 1 1 1 1 1 1 1 52 1 1 1 1 1 1 1 1 50 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 4",
	"0 9 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 55 1 1 1 1 1 1 1 55 4 1 1 1 1 1 1 1 1 1 52 1 51 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 55 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 9",
	// Redirector levels (3)
	"0 9 62 1 1 1 1 4 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 61 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 64 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 64 61 1 1 1 1 65 3",
	"2 6 62 62 62 62 62 62 62 62 62 62 1 1 1 1 1 1 1 1 1 63 60 1 1 1 53 2 2 1 1 1 1 1 1 50 3 1 1 1 1 63 60 1 1 2 1 1 1 2 1 1 1 1 2 1 1 1 2 1 1 63 60 1 1 1 1 4 53 1 1 1 1 1 1 2 2 50 1 1 1 63 60 1 1 1 1 1 1 1 1 1 65 65 65 65 65 65 65 65 65 65 5",
	"3 6 1 1 1 1 1 1 1 1 1 1 61 1 1 1 2 1 1 1 1 64 61 1 1 1 2 2 1 1 1 64 61 1 1 1 2 1 1 1 1 64 61 1 1 1 2 2 1 1 1 64 61 1 1 1 2 1 1 1 1 64 61 1 1 1 2 2 4 1 1 64 61 1 1 1 2 1 1 1 1 64 61 1 1 1 2 2 1 1 1 64 61 1 1 1 2 1 1 1 1 64 9",
	// Switch levels (4)
	"0 9 1 1 1 1 1 90 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 91 1 1 1 1 1 1 1 1 1 4 1 1 1 1 1 1 1 1 8 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 4",
	"0 9 1 1 1 1 1 1 1 1 1 1 1 1 8 8 8 8 1 1 1 1 1 1 8 91 90 90 8 1 1 1 1 8 90 90 91 90 8 1 1 1 1 8 90 91 4 90 91 8 1 1 1 8 90 90 91 90 8 1 1 1 1 1 8 91 90 90 8 1 1 1 1 1 8 8 8 8 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 6",
	"4 9 1 64 90 1 1 1 1 1 90 62 65 90 1 1 1 1 1 1 90 63 60 90 1 1 1 1 1 1 90 62 65 90 1 1 1 1 91 1 90 63 60 90 1 1 1 1 1 1 90 62 65 90 8 1 4 1 1 1 90 63 60 90 1 1 91 91 1 1 90 62 65 90 1 1 1 1 1 1 90 63 60 90 1 1 1 1 1 1 90 62 65 90 1 1 1 1 1 90 61 1 8",
	"0 9 1 1 1 1 1 2 1 1 1 1 1 1 1 91 54 51 91 4 1 1 1 1 1 1 1 90 1 1 1 1 1 1 1 91 54 51 91 1 1 1 1 1 8 1 1 90 1 1 8 1 1 1 1 91 54 51 91 1 1 1 1 1 8 1 1 90 1 1 8 1 1 1 1 91 54 51 91 1 1 1 1 1 1 1 1 90 1 1 1 1 1 1 1 91 54 51 91 1 1 1 7",
	// Rotator level
	// "0 9 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 61 1 1 1 1 1 4 1 1 72 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 12",
];
