let noiseShader;
let list_sky = [];
let list_hill = [];
let list_wood = [];
let padding = 100;



// let colorArray = ["#FFCB56", "#FFA259", "#FF7E7E", "#F9B637", "#FFDD9C"];
let colorArray = ["#FFDA73", "#FFC04B", "#C8DEFF", "#FFDAD7", "#FFDD9C"];
let treeColorArray = ["#de980e", "#567739", "#5a6e18", "#a7be41"];
let woodColorArray = ["#2d1e1a", "#6c2317", "#472521", "#64211c", "#6b180f", "#561916", "#761009", "#6d1c0b", "#371810", "#5b231a", "#481b18"];

let paletteColors = [];
let maskAlpha = 1;
let noiseScale = 0.9;

let hillQueue = [];
let hillRevealIndex = 0;
let framesPerHill = 1;

function setup() {
    createCanvas(400, 400, WEBGL);

    noiseShader = buildMaterialShader(noiseMaterial);
    noStroke();

    paletteColors = hex2float(colorArray);

    // background("#FFF1CF");
    background(245);



    colorArray = ["#FFC04B", "#e1edff", "#ffeed7", "#FFDD9C"];
    colorArray = shuffle(colorArray);
    let arr = colorArray.slice(0, 4);
    let sky = new RJ_Rect({
        x: -width / 2,
        y: -height / 2,
        w: width,
        h: height / 2,
        a: 1,
        noiseScale: 0.5,
        clrarray: arr
    })

    sky.draw();

    resetShader();
    push();
    blendMode(MULTIPLY);
    fill("#ffa600");
    circle(random(padding, width / 2 - padding), -height / 6 + 20, 50);
    pop();

    // resetShader();


    colorArray = ["#f9d140", "#87aa60", "#4a6e18", "#aebe41"];
    colorArray = shuffle(colorArray);
    arr = colorArray.slice(0, 4);
    let grass = new RJ_Rect({
        x: -width / 2,
        y: -height / 6 + 30,
        w: width,
        h: height,
        a: 0.7,
        noiseScale: 0.5,
        clrarray: arr
    })

    grass.draw();


    // hill

    let row = 5
    for (let i = 0; i < row; i++) {

        let num = fibonacci(4 + row - i); //4-

        for (let j = 0; j < num; j++) {
            let ifTree = false;
            if (i > row || random() > 0.5) ifTree = true;
            colorArray = ["#bcd086", "#3c6c24", "#3e502f", "#c6d661"];
            colorArray = shuffle(colorArray);
            let clr = colorArray.slice(0, 1);
            let arr = expandColor(clr[0])
            let hill = new RJ_Hill({
                x: random(-width / 2 - padding, width / 2),
                y: -height / 6 + pow(i, 1.5) * 30 + 30 + random(j / 2, j),
                w: pow(i, 2) * 30 + random(20, 50),
                h: pow(i, 2) * 3,
                a: random(0.8, 1),
                noiseScale: 1,
                clrarray: arr,
                span: i * 3 + 5,
                ampScl: i * 20 + 20,
                tree: ifTree
            })
            hillQueue.push(hill);
        }
    }

    for (let i = 0; i < 3; i++) {

        woodColorArray = shuffle(woodColorArray);
        let clr = woodColorArray.slice(0, 1);
        let arr = expandColor(clr[0], 0.3)
            //redwood
        let redwood = new RJ_Redwood({
            x: width / 8 * i - width / 3 + random(-10, 20),
            y: -height / 2 - random(100),
            w: random(20, 60),
            h: height * 1.5,
            clrarray: arr,
            a: random(0.95, 1),
        })

        list_wood.push(redwood);


    }






    // trees
    // let t = new RJ_Tree({
    //     x: -100,
    //     y: -100,
    //     w: 30,
    //     h: 100,
    //     a: random(0.8, 1),
    //     noiseScale: 1,
    // })

    // t.draw();




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

function fibonacci(n) {
    let a = 0,
        b = 1;
    for (let i = 0; i < n; i++) {
        [a, b] = [b, a + b];
    }
    return a;
}

function expandColor(clr, fac = 1) {
    let clrArr = [];
    push();
    colorMode(HSB);
    let scl = 10;
    let hScl = scl * fac;

    for (let i = 0; i < 4; i++) {
        let h = hue(color(clr));
        let s = saturation(color(clr));
        let b = brightness(color(clr));
        let newClr = color(h + random(-hScl, hScl), s + random(-scl, scl), b + random(-scl, scl))

        clrArr.push(newClr.toString('#rrggbb'));
    }
    pop();

    return clrArr;
}

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

    let factor = uniformFloat(0.2);

    let screenColor = [1, 1, 1, 1] - (([1, 1, 1, 1] - mix3) * ([1, 1, 1, 1] - mixb));

    let mixall = mix(mix3, screenColor, factor);



    finalColor.set([mixall.x, mixall.y, mixall.z, mask * uMaskAlpha]);
    // finalColor.set([mixall.x, mixall.y, mixall.z, 1]);
    finalColor.end();
}

function draw() {

    if (hillRevealIndex >= hillQueue.length) {
        list_wood.forEach(w => {
            w.draw();
        })

        noLoop();
        return;
    }

    if (frameCount % framesPerHill === 0) {
        list_hill.push(hillQueue[hillRevealIndex]);
        list_hill.forEach(h => {
            h.draw();
        })
        hillRevealIndex++;
    }
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


function gaussianPDF(x, peak = 0.5, width = 0.3) {
    const exponent = -((x - peak) ** 2) / (2 * (width ** 2));
    return Math.exp(exponent);
}

// class RJ_Cirlce {
//     constructor(args) {
//         this.x = args.x;
//         this.y = args.y;
//         this.r = args.r;
//         this.clrarray = args.clrarray;
//         this.seed = random(10000);
//     }

//     draw() {
//         push();
//         translate(this.x, this.y);
//         paletteColors = hex2float(this.clrarray)
//         noiseShader.setUniform('uSeed', this.seed);
//         circle(0, 0, this.r);
//         pop();
//     }
// }

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
        this.ampScl = args.ampScl || 45;
        this.span = args.span || 15;
        this.tree = args.tree || false;

        this.clrarray = args.clrarray;
        this.seed = random(100000);
    }

    draw() {
        push();
        translate(this.x, this.y);


        if (this.tree) {

            for (let i = 0; i < this.span; i++) {
                let x = this.w - i;
                noiseSeed(this.seed)
                let amp = noise(x * 0.5) * this.ampScl;
                let y = (-this.h - amp) * gaussianPDF(i / this.span);
                let vx = this.w - i * this.w / this.span;

                treeColorArray = shuffle(treeColorArray);
                let clr = treeColorArray.slice(0, 1);
                let arr = expandColor(clr[0])
                for (let j = 0; j < 3; j++) {
                    let treeHeight = random(this.h * 0.5, this.h * 0.8);
                    let treeWidth = random(this.w / this.span * 0.2, this.w / this.span * 0.5)
                    if (treeHeight > 3 && treeWidth > 3) {


                        let t = new RJ_Tree({
                            x: vx + random(-15, 15),
                            y: y - treeHeight * 0.7 + random(10),
                            w: random(treeWidth * 0.8, treeWidth),
                            h: random(treeHeight * 0.8, treeHeight),
                            a: random(0.8, 1),
                            noiseScale: 1,
                            ampScl: 1.5,
                            clrarray: arr
                        })

                        t.draw();
                    }
                }

                // resetShader();
                // fill(255)
                // circle(vx, y, 10);
            }


        }




        paletteColors = hex2float(this.clrarray);
        maskAlpha = this.a;
        noiseScale = this.noiseScale;
        shader(noiseShader);
        noiseShader.setUniform('uSeed', this.seed);
        noiseSeed(this.seed);

        let maxAmp = this.h + 50;


        beginShape();
        splineVertex(0, 0, 0, 0);
        splineVertex(this.w, 0, 1, 0);

        for (let i = 0; i < this.span; i++) {
            let x = this.w - i;
            let amp = noise(x * 0.5) * this.ampScl;
            let y = (-this.h - amp) * gaussianPDF(i / this.span);
            let vx = this.w - i * this.w / this.span;
            splineVertex(vx, y, vx / this.w, -y / maxAmp);
        }
        splineVertex(0, 0, 0, 0);
        endShape();
        pop();
    }
}


class RJ_Tree {
    constructor(args) {
        this.x = args.x;
        this.y = args.y;
        this.w = args.w;
        this.h = args.h;
        this.clrarray = args.clrarray;
        this.a = args.a;
        this.noiseScale = args.noiseScale;
        this.ampScl = args.ampScl || 10;
        this.span = args.span || 5;
        this.seed = random(100000);
    }

    draw() {

        push();
        translate(this.x, this.y);
        paletteColors = hex2float(this.clrarray);
        maskAlpha = this.a;
        noiseScale = this.noiseScale;
        shader(noiseShader);
        noiseShader.setUniform('uSeed', this.seed);
        noiseSeed(this.seed);

        beginShape();

        splineVertex(0, 0, 0.5, 0);
        splineVertex(-this.w / 2 + random(-this.ampScl, this.ampScl), this.h / 2 + random(-this.ampScl, this.ampScl), 0, 0.5);
        splineVertex(0, this.h, 0.5, 1);
        splineVertex(this.w / 2 + random(-this.ampScl, this.ampScl), this.h / 2 + random(-this.ampScl, this.ampScl), 1, 0.5);
        endShape(CLOSE);

        pop();

    }
}

class RJ_Redwood {
    constructor(args) {
        this.x = args.x;
        this.y = args.y;
        this.w = args.w;
        this.h = args.h;
        this.clrarray = args.clrarray;
        this.a = args.a;
        this.noiseScale = args.noiseScale;
        this.ampScl = args.ampScl || 10;
        this.span = args.span || 15;
        this.seed = random(100000);
        this.guassianFac = random(0.2, 0.3);
    }

    draw() {


        resetShader();

        let num = random([0, 1, 2, 3])
        for (let i = 0; i < num; i++) {
            push();
            translate(this.x, this.y + random(height / 6, height / 2));
            rotate(random(-PI / 5, -PI / 4) + i % 2 * (-PI / 2));
            fill(random(this.clrarray));
            noStroke();
            rect(0, 0, random([40, 60, 70, 80]), random(2, 4), random(5));
            pop();

        }
        push();
        translate(this.x, this.y);
        paletteColors = hex2float(this.clrarray);
        maskAlpha = this.a;
        noiseScale = this.noiseScale;
        shader(noiseShader);
        noiseShader.setUniform('uSeed', this.seed);
        noiseSeed(this.seed);



        beginShape();

        let xShift = 0.6;
        splineVertex(0, 0, 0, 0);
        for (let i = 0; i < this.span; i++) {
            let x = -this.w * gaussianPDF(i / this.span * this.guassianFac);
            let v = i / this.span;
            let y = this.h * v;
            splineVertex(x + random(-xShift, xShift), y, 0, v)
        }
        for (let i = this.span - 1; i >= 0; i--) {
            let x = this.w * gaussianPDF(i / this.span * this.guassianFac);
            let v = i / this.span;
            let y = this.h * v;
            splineVertex(x + random(-xShift, xShift), y, 1, v);
        }
        endShape(CLOSE);

        pop();



    }
}