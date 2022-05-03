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
        return -2;
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

/**
 * 
 * @param {String} prompt 
 * @param {{min?:Number,max?:Number}} restriction 
 * @returns {Promise<Number>}
 */
async function get_num (prompt, restriction) {
    restriction = restriction === undefined ? {} : restriction;
    return new Promise(async (Resolve, Reject) => {
        while (true) {
            let n = await input(prompt);
            n = Number(n);
            if (n.toString() === "NaN" || (restriction.min !== undefined && n < restriction.min) || (restriction.max !== undefined && n > restriction.max)) {
                console.log("\x1b[2K\x1b[1A\x1b[2K\x1b[1A");
            } else {
                Resolve(n);
                return;
            }
        }
    });
}

/**
 * 
 * @param {String} prompt 
 * @param {{length?:Number}} restriction 
 * @returns {Promise<String>}
 */
async function get_str (prompt, restriction) {
    restriction = restriction === undefined ? {} : restriction;
    return new Promise(async (Resolve, Reject) => {
        while (true) {
            let n = await input(prompt);
            if ((restriction.length !== undefined && n.length !== restriction.length)) {
                console.log("\x1b[2K\x1b[1A\x1b[2K\x1b[1A");
            } else {
                Resolve(n);
                return;
            }
        }
    });
}

const normal = "\x1b[0m";
const green = "\x1b[38;2;0;200;0m";
const red = "\x1b[38;2;220;0;0m";
const yellow = "\x1b[38;2;255;255;0m";

const ecodes = {
    "-1" : "genotype length difference",
    "-2" : "invalid character input",
    "-3" : "number less than allowed minimum",
};

/**
 * 
 * @param {Number} ecode 
 */
function print_error (ecode) {
    console.log(`${red}failed - input error: ${ecodes[ecode]}${normal}`);
}

function print_impossible_target () {
    console.log(`${red}result:${normal} impossible target${normal}`);
}

/**
 * 
 * @param {Number} res 
 */
function print_target_data (res) {
    console.log(`${green}result:${normal} target found in ${yellow}1${normal}/${yellow}${res}${normal} offspring ${yellow}${Math.floor((1/res)*10000)/100}%${normal}`);
}

/**
 * 
 * @param {Boolean} retout 
 * @returns {Number|void}
 */
async function runbasic (retout) {
    let in1 = await input("Enter parent 1: ");
    let in2 = await input("Enter parent 2: ");
    let in3 = await input("Enter target  : ");

    const res = calculate(in1, in2, in3);

    if (retout) {
        return res;
    }

    if (res < 0) {
        print_error(res);
    } else if (res === 0) {
        print_impossible_target();
    } else {
        print_target_data(res);
    }
}

async function runincom () {
    let ninc = await get_num("# of traits displaying incomplete dominance: ", {min:1});

    let totaltraits = await get_num("total # of traits: ", {min:ninc});

    /**@type {[Number]} */
    let lst = [];
    /**@type {[String]} */
    let maps = [];

    for (let i = 0; i < ninc; i ++) {
        lst.push(await get_num(`enter position of allele ${i+1} displaying incomplete dominance: `, {min:0, max:totaltraits-1}));
        maps.push(await get_str(`enter values to replace HDR in the order of HDR: `, {length:3}));
    }

    console.log(lst);
    console.log(maps);

    const conv = "HDR";

    /**
     * @param {String} str 
     * @returns {String}
     */
    const formating = (str) => {
        str = str.split("");
        for (let i = 0; i < lst.length; i ++) {
            str[lst[i]] = conv[maps[i].indexOf(str[lst[i]])];
        }
    }

    let in1 = formating(await input("Enter parent 1: "));
    let in2 = formating(await input("Enter parent 2: "));
    let in3 = formating(await input("Enter target  : "));

    //
}

async function runcycle () {
    // get op
    let opinput = await input("> ");
    
    // exit program
    if (opinput.match(/\b(exit|close|done|stop)\b/)) {
        return true;
    }

    // basic matching (complete dominance)
    if (opinput.match(/\b(basic|simple|complete|comp)\b/)) {
        await runbasic();
    }

    // advanced matching (incomplete dominance)
    if (opinput.match(/\b(inco|incomplete|advin)\b/)) {
        await runincom();
    }
}

// main loop
async function main () {
    while (true) {
        if (await runcycle()) {
            rl.close();
            break;
        }

        // if (!(await input("Again? ")).toLowerCase().match(/\b(yes|y|ok)\b/)) {
        // if ((await input("Again (y/N): ")).toLowerCase() !== "y") {
        //     rl.close();
        //     break;
        // }
    }
}

main();