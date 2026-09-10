let noiseShader;
let list_sky = [];
let list_hill = [];


// let colorArray = ["#FFCB56", "#FFA259", "#FF7E7E", "#F9B637", "#FFDD9C"];
let colorArray = ["#FFDA73", "#FFC04B", "#C8DEFF", "#FFDAD7", "#FFDD9C"];


let paletteColors = [];
let maskAlpha = 1;
let noiseScale = 0.9;

function setup() {
    createCanvas(400, 400, WEBGL);

    noiseShader = buildMaterialShader(noiseMaterial);
    noStroke();

    paletteColors = hex2float(colorArray);

    background("#FFF1CF");
    for (let i = 0; i < 1; i++) {
        colorArray = ["#FFC04B", "#e1edff", "#ffeed7", "#FFDD9C"];
        // else colorArray = ["#FFDA73", "#FFC04B", "#ffa600", "#FFDD9C"];
        colorArray = shuffle(colorArray);
        let arr = colorArray.slice(0, 4);
        let sky = new RJ_Rect({
            x: -width / 2,
            y: -height / 2,
            w: width,
            h: height,
            a: 1,
            noiseScale: 0.5,
            clrarray: arr
        })
        list_sky.push(sky)
    }
    for (let i = 0; i < 1; i++) {
        list_sky[i].draw();
    }


    // hill
    colorArray = ["#FFC04B", "#e1edff", "#ffeed7", "#FFDD9C"];
    colorArray = shuffle(colorArray);
    let arr = colorArray.slice(0, 4);
    let hill = new RJ_Hill({
        x: 100,
        y: 100,
        w: 100,
        h: 30,
        a: 1,
        noiseScale: 1,
        clrarray: arr
    })
    list_hill.push(hill);

    list_hill.forEach(h => {
        h.draw();
    })


    resetShader();
    blendMode(SCREEN);
    fill("#ffa600");
    let padding = 100;
    circle(random(padding, width - padding) - width / 2, -height / 6, 50)



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
    let uNoiseScale = uniformFloat('noiseScale', () => noiseScale);
    let n = noise(coord.x * uNoiseScale + uSeed, coord.y * uNoiseScale + uSeed);

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
    let uMaskAlpha = uniformFloat('maskAlpha', () => maskAlpha);

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



    finalColor.set([mixall.x, mixall.y, mixall.z, mask * uMaskAlpha]);
    // finalColor.set([mixall.x, mixall.y, mixall.z, 1]);
    finalColor.end();
}




function draw() {



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

class RJ_Rect {
    constructor(args) {
        this.x = args.x;
        this.y = args.y;
        this.w = args.w;
        this.h = args.h
        this.a = args.a;
        this.noiseScale = args.noiseScale;

        this.clrarray = args.clrarray;
        this.seed = random(10000);
    }

    draw() {
        push();
        translate(this.x, this.y);
        paletteColors = hex2float(this.clrarray)
        maskAlpha = this.a;
        noiseScale = this.noiseScale;
        shader(noiseShader);
        noiseShader.setUniform('uSeed', this.seed);
        rect(0, 0, this.w, this.h);
        pop();
    }
}

class RJ_Hill {
    constructor(args) {
        this.x = args.x;
        this.y = args.y;
        this.w = args.w;
        this.h = args.h;
        this.a = args.a;
        this.noiseScale = args.noiseScale;

        this.clrarray = args.clrarray;
        this.seed = random(100000);
    }

    draw() {
        push();
        translate(this.x, this.y);
        paletteColors = hex2float(this.clrarray);
        maskAlpha = this.a;
        shader(noiseShader);
        noiseShader.setUniform('uSeed', this.seed);
        beginShape();
        vertex(0, 0);
        vertex(this.w, 0);
        for (let i = 0; i < 10; i++) {
            let x = this.x + this.w - i;
            let amp = noise(x);
            vertex(x, this.h + amp);
        }
        endShape(CLOSE);
        pop();
    }
}