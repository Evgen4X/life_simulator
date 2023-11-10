const player = {
	hp: 100,
	money: 0,
	saturation: 100,
	xp: 0,
	food: 0,
	fatigue: 1,
	time: 0,
};

const actions = {
	work: {
		saturation: -10,
		fatigue: 7.5,
		money: 100,
		time: 28800,
	},
	eat: {
		food: -1,
		saturation: 10,
	},
	food: {
		money: -10,
		fatigue: 0.5,
		food: 1,
		procedure: "actions_food_money_add_-1_round",
	},
	learn: {
		saturation: -10,
		fatigue: 2.5,
		xp: 1,
		time: 3600,
	},
	sleep: {
		saturation: -10,
		fatigue: -Infinity,
		time: 28800,
	},
};

const upgrades = {
	work: {
		money: 10,
		saturation: 1,
		procedure1: "costs_work_xp_multiply_1.07_round",
		procedure2: "costs_work_money_multiply_1.05",
	},
	eat: {
		saturation: 1,
	},
	autoprofit: {
		procedure: "autos_money_NULL_add_0.5",
	},
	food: {
		procedure1: "actions_food_money_multiply_0.25_round",
		procedure2: "costs_food_money_multiply_1.1_round",
		procedure3: "costs_food_xp_add_2",
	},
	learn: {
		xp: 1,
	},
	regeneration: {
		procedure: "autos_hp_NULL_add_0.05",
	},
	photosythesis: {
		procedure: "autos_saturation_NULL_add_0.05",
	},
};

const costs = {
	work: {
		xp: 10,
		money: 100,
	},
	eat: {
		xp: 10,
		money: 100,
	},
	autoprofit: {
		xp: 10,
		money: 500,
	},
	food: {
		xp: 1,
		money: 100,
	},
	learn: {
		xp: 20,
		money: 200,
	},
	regeneration: {
		xp: 10,
		money: 500,
	},
	photosythesis: {
		xp: 10,
		money: 500,
	},
};

const autos = {
	money: 0.05,
	food: 0,
	saturation: 0,
	hp: 0,
	xp: 0,
	fatigue: 0,
	time: 0.1,
};

const stat_time = document.querySelector(".time");
const stat_hp = document.querySelector(".hp");
const stat_money = document.querySelector(".money");
const stat_xp = document.querySelector(".xp");
const stat_food = document.querySelector(".food");
const stat_saturation = document.querySelector(".saturation");
const stat_fatigue = document.querySelector(".fatigue");
const alert_div = document.querySelector(".alert");

function capitalize(text) {
	return text[0].toUpperCase() + text.slice(1);
}

function alert_(message, duration) {
	alert_div.innerHTML = message;
	alert_div.style.top = "40vh";
	setTimeout(() => {
		alert_div.style.top = "-30vh";
	}, duration);
}

function pulse(element, start="#ff0000", end="#000000"){
	element.animate({backgroundColor: start}, {duration: 0, fill: "forwards"});
	element.animate({backgroundColor: end}, {duration: 3000, fill: "forwards"});
}

function update(update_actions = false, update_upgrades = false) {
	for (key in autos) {
		player[key] += autos[key];
	}
	if (player.saturation > 0 && Math.random() < 0.02) {
		player.saturation -= 1;
	}

	if (Math.random() < player.fatigue / 10000) {
		player.hp -= 1;
		pulse(stat_hp)
	}
	if (player.saturation == 0 && Math.random() < 0.08) {
		player.hp -= 1;
		pulse(stat_hp);
	}

	if (player.saturation < 0) {
		player.hp += player.saturation;
		player.saturation = 0;
		pulse(stat_hp);
	}

	if (player.hp <= 0) {
		alert_("You died!", 100000);
		window.clearInterval(game);
	}

	stat_time.innerHTML = `<p>Time</p><span>${Math.floor(player.time)}</span>`;
	stat_food.innerHTML = `<p>Food</p><span>${Math.floor(player.food)}</span>`;
	stat_saturation.innerHTML = `<p>Saturation</p><span>${Math.floor(player.saturation)}</span>`;
	stat_money.innerHTML = `<p>Money</p><span>$${Math.floor(player.money)}</span>`;
	stat_xp.innerHTML = `<p>XP</p><span>${Math.floor(player.xp)}</span>`;
	stat_fatigue.innerHTML = `<p>Fatigue</p><span>${Math.floor(player.fatigue)}</span>`;
	stat_hp.innerHTML = `<p>HP</p><span>${Math.floor(player.hp)}</span>`;

	if (update_actions) {
		document.querySelectorAll(".action").forEach((el) => {
			let name = el.getAttribute("action");
			let text = `<p>${capitalize(name)}</p><table>`;
			for (key in actions[name]) {
				if (!key.startsWith("procedure")) {
					text += `<tr><td>${capitalize(key)}</td><td>${actions[name][key]}</td></tr>`;
				}
			}
			text += `</table><button onwheel="action('${name}');" onclick="action('${name}');">${capitalize(name)}</button>`;
			el.innerHTML = text;
		});
	}

	if (update_upgrades) {
		document.querySelectorAll(".upgrade").forEach((el) => {
			let name = el.getAttribute("upgrade");
			let text = `<p>${capitalize(name)}</p><table>`;
			for (key in upgrades[name]) {
				if (!key.startsWith("procedure")) {
					text += `<tr><td>${capitalize(key)}</td><td>${upgrades[name][key]}</td></tr>`;
				}
			}
			text += `</table><span>Requires ${costs[name].xp}XP and $${costs[name].money}</span><button onclick="upgrade('${name}');">Upgrade</button>`;
			el.innerHTML = text;
		});
	}
}

function action(name) {
	for (statistic in actions[name]) {
		let value = actions[name][statistic];
		if (statistic.startsWith("procedure")) {
			call_procedure(value);
		} else {
			console.log(statistic + " - " + value);
			if (value == -Infinity) {
				player[statistic] = 1;
			} else if (value < 0) {
				if (player[statistic] >= -value) {
					player[statistic] += value;
				} else {
					pulse(document.querySelector("." + statistic));
					break;
				}
			} else {
				if (statistic != "fatigue" && actions[name][statistic] > 1) {
					player[statistic] += Math.ceil(actions[name][statistic] / Math.max(player.fatigue / 500, 1));
				} else {
					player[statistic] += actions[name][statistic];
				}
			}
		}
	}
	update(true);
}

function upgrade(name) {
	for (require in costs[name]) {
		if (player[require] < costs[name][require]) {
			pulse(document.querySelector("." + require));
			return;
		}
	}

	for (require in costs[name]) {
		player[require] -= costs[name][require];
	}

	for (statistic in upgrades[name]) {
		if (statistic.startsWith("procedure")) {
			call_procedure(upgrades[name][statistic]);
		} else {
			actions[name][statistic] += upgrades[name][statistic];
			pulse(document.querySelector(".action[action=" + name + "]"), "#00ff00", "#ffffff");
		}
	}
	update(true, true);
}

/**
 *
 * @param {string} name
 */
function call_procedure(name) {
	/*
	Ex: actions_food_money_add_100 - adds $100 to cost of food
	*/
	console.log(name);
	let [object, key, parameter, action, value, addition] = name.split("_");
	console.log(object, key, parameter, action, value);
	if (object == "actions") {
		if (action == "multiply") {
			actions[key][parameter] *= parseFloat(value);
		} else if (action == "add") {
			actions[key][parameter] += parseFloat(value);
		}
		if (addition == "round") {
			actions[key][parameter] = Math.round(actions[key][parameter]);
		}
		pulse(".action[action="+key+"]", "#00ff00", "#ffffff");
	} else if (object == "upgrades") {
		if (action == "multiply") {
			upgrades[key][parameter] *= parseFloat(value);
		} else if (action == "add") {
			upgrades[key][parameter] += parseFloat(value);
		}
		if (addition == "round") {
			upgrades[key][parameter] = Math.round(upgrades[key][parameter]);
		}
	} else if (object == "costs") {
		if (action == "multiply") {
			costs[key][parameter] *= parseFloat(value);
		} else if (action == "add") {
			costs[key][parameter] += parseFloat(value);
		}
		if (addition == "round") {
			costs[key][parameter] = Math.round(costs[key][parameter]);
		}
	} else if (object == "autos") {
		if (action == "multiply") {
			autos[key] *= parseFloat(value);
		} else if (action == "add") {
			autos[key] += parseFloat(value);
		}
		if (addition == "round") {
			autos[key] = Math.round(autos[key][parameter]);
		}
	}
}

update(true, true);
var game;

setTimeout(() => {
	alert_("Goal: get $1.000.000", 2000);
}, 500);

setTimeout(() => {
	game = setInterval(update, 100);
}, 3000);
