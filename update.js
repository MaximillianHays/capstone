function swapStars(a, b) {
	if (!localStorage.getItem("stars")) return;
	let stars = JSON.parse(localStorage.getItem("stars"));
	swap(stars, a - 1, b - 1);
	localStorage.setItem("stars", JSON.stringify(stars));
}
let version = +localStorage.getItem("version") ?? 0;
if (localStorage.getItem("initialVersion") == null && localStorage.getItem("stars")) localStorage.setItem("initialVersion", 0);
switch (version) {
	case 0:
		swapStars(4, 5);
	case 1:
		swapStars(4, 8);
		swapStars(5, 9);
		stars[9] = stars[5];
		stars[5] = 0;
}
version = 2;
localStorage.setItem("version", version);
if (localStorage.getItem("initialVersion") == null) localStorage.setItem("initialVersion", version);
if (!localStorage.getItem("hints")) localStorage.setItem("hints", Math.random() < 0.5);