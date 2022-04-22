/*
allele combinations represented as:
    H - heterozygous
    D - homozygous dominant
    R - homozygous recessive

genotypes represented as:
    ex: for aaBBCc -> RDH
*/

const readline = require("readline");

const regcheck = new RegExp(/^(H|D|R)+$/);

/**
 * 
 * @param {String} p1 
 * @param {String} p2 
 * @param {String} target 
 * @returns {Boolean}
 */
function calculate (p1, p2, target) {
    // ensure no unexpected lower case characters that could mess up comparasons
    p1 = p1.toUpperCase();
    p2 = p2.toUpperCase();
    target = target.toUpperCase();

    // ensure all lengths are the same
    if (p1.length !== p2.length || p2.length !== target.length) {
        return -1;
    }

    // ensure only valid characters are used
    if (!(p1.match(regcheck) && p2.match(regcheck) && target.match(regcheck))) {
        return -1;
    }

    let division_count = 0;

    // loop over combinations
    for (let i = 0; i < p1.length; i ++) {

        // impossibility checks
        if ((p1[i] === "D" || p2[i] === "D") && target[i] === "R") {
            return 0;
        }

        if ((p1[i] === "R" || p2[i] === "R") && target[i] === "D") {
            return 0;
        }

        if (target[i] === "H" && p1[i] === p2[i] && p1[i] !== "H") {
            return 0;
        }

        // calculate probability
        if (target[i] === "H") {
            // gaurrenteed
            if (p1[i] !== p2[i] && (p1[i] !== "H" && p2[i] !== "H")) {
                continue;
            }

            // either both heterozygous or one is homozygous
            division_count += 1;
        // homozygous
        } else {
            if (p1[i] === p2[i] && p1[i] === "H") {
                division_count += 2;
                continue;
            }

            // one homozygous one heterozygous
            if (p1[i] !== p2[i]) {
                division_count += 1;
            }
        }
    }
    return Math.pow(2, division_count);
}


const rl = readline.createInterface({
    input : process.stdin,
    output : process.stdout,
});

/**
 * 
 * @param {String} prompt 
 * @returns {Promise<String>}
 */
function input (prompt) {
    return new Promise((Resolve, Reject) => {
        rl.question(prompt, (a) => {
            Resolve(a);
        });
    });
}

const normal = "\x1b[0m";
const green = "\x1b[38;2;0;200;0m";
const red = "\x1b[38;2;220;0;0m";
const yellow = "\x1b[38;2;255;255;0m";

async function runcycle () {
    let in1 = await input("Enter parent 1: ");
    let in2 = await input("Enter parent 2: ");
    let in3 = await input("Enter target  : ");

    const res = calculate(in1, in2, in3);

    if (res < 0) {
        console.log(`${red}failed: input error${normal}`);
    } else if (res === 0) {
        console.log(`${red}result:${normal} impossible target${normal}`);
    } else {
        console.log(`${green}result:${normal} target found in ${yellow}1${normal}/${yellow}${res}${normal} offspring ${yellow}${Math.floor((1/res)*10000)/100}%${normal}`);
    }
}

// main loop
async function main () {
    while (true) {
        await runcycle();

        // if (!(await input("Again? ")).toLowerCase().match(/\b(yes|y|ok)\b/)) {
        if ((await input("Again (y/N): ")).toLowerCase() !== "y") {
            rl.close();
            break;
        }
    }
}

main();