function swapStars(a, b) {
	if (!localStorage.getItem("stars")) return;
	let stars = JSON.parse(localStorage.getItem("stars"));
	swap(stars, a, b);
	localStorage.setItem("stars", JSON.stringify(stars));
}
let version = +localStorage.getItem("version") ?? 0;
if (localStorage.getItem("initialVersion") == null && localStorage.getItem("stars")) localStorage.setItem("initialVersion", 0);
switch (version) {
	case 0:
		swapStars(3, 4);
}
version = 1;
localStorage.setItem("version", version);
if (localStorage.getItem("initialVersion") == null) localStorage.setItem("initialVersion", version);