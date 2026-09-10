let myShader;
let noiseShader;
let voronoiShader;
let woodShader;

let list_sky = [];
let colorArray = ["#FFEDB9", "#FFCB56", "#FFA259", "#FF7E7E"];

let paletteColors = [];

function setup() {
    createCanvas(400, 400, WEBGL);
    noiseShader = buildMaterialShader(noiseMaterial);
    noStroke();

    paletteColors = hex2float(colorArray);

    let c = new RJ_Cirlce({
        x: 20,
        y: 100,
        r: 100,
        clrarray: colorArray
    })

    list_sky.push(c)

}

// function material() {
//     let time = millis() / 1000;
//     finalColor.begin();
//     let r = 0.2 + 0.5 * abs(sin(time + 0));
//     let g = 0.2 + 0.5 * abs(sin(time + 1));
//     let b = 0.2 + 0.5 * abs(sin(time + 2));
//     finalColor.set([r, g, b, 1]);
//     finalColor.end();
// }

function noiseMaterial() {
    finalColor.begin();
    let coord = finalColor.texCoord;
    let uSeed = uniformFloat('uSeed', () => 0);
    let n = noise(coord.x * 0.8 + uSeed, coord.y * 0.8 + uSeed);

    let colorA = uniformVec4('colorA', () => paletteColors[0]);
    let colorB = uniformVec4('colorB', () => paletteColors[1]);
    let colorC = uniformVec4('colorC', () => paletteColors[2]);
    let colorD = uniformVec4('colorD', () => paletteColors[3]);

    let mix1 = mix(colorA, colorB, smoothstep(0.0, 0.33, n));
    let mix2 = mix(mix1, colorC, smoothstep(0.33, 0.66, n));
    let mix3 = mix(mix2, colorD, smoothstep(0.66, 1.0, n));

    let freqX = 5;
    let freqY = 10;
    let maskNoise = noise(coord.x * freqX + uSeed, coord.y * freqY + uSeed);
    let mask = step(0.05, maskNoise);

    let r = [1, 0, 0, 1];
    let g = [0, 1, 0, 1];
    let b = [0, 0, 1, 1];
    let w = [1, 1, 1, 1];
    let noise_rgb = noise(coord.x * 50, coord.y * 50);
    let mixr = mix(r, g, smoothstep(0.0, 0.33, noise_rgb));
    let mixg = mix(mixr, b, smoothstep(0.33, 0.66, noise_rgb));
    let mixb = mix(mixg, w, smoothstep(0.66, 1.0, noise_rgb));

    let factor = uniformFloat(0.2); // 0.2 = mixb 佔比

    // screen blend: 1 - (1-a)*(1-b)，只會變亮不會變暗
    let screenColor = [1, 1, 1, 1] - (([1, 1, 1, 1] - mix3) * ([1, 1, 1, 1] - mixb));

    let mixall = mix(mix3, screenColor, factor);



    finalColor.set([mixall.x, mixall.y, mixall.z, mask]);
    // finalColor.set([mixall.x, mixall.y, mixall.z, 1]);
    finalColor.end();
}




function draw() {

    background(255, 237, 185);
    shader(noiseShader);

    list_sky.forEach(c => {
        c.draw();
    });

}


function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }
    const num = parseInt(hex, 16);
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255
    };
}

function hex2float(colorArr) {
    return colorArr.map(hex => {
        let { r, g, b } = hexToRgb(hex);
        return [r / 255, g / 255, b / 255, 1];
    });
}


class RJ_Cirlce {
    constructor(args) {
        this.x = args.x;
        this.y = args.y;
        this.r = args.r;
        this.clrarray = args.clrarray;
        this.seed = random(10000);
    }

    draw() {
        push();
        translate(this.x, this.y);
        paletteColors = hex2float(this.clrarray)
        noiseShader.setUniform('uSeed', this.seed);
        circle(0, 0, this.r);
        pop();
    }
}