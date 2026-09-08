let myShader;
let noiseShader;
let voronoiShader;

let paletteColors = [
    [0.1, 0.2, 0.4, 1],
    [0.2, 0.6, 0.9, 1],
    [0.95, 0.8, 0.2, 1],
    [0.2, 0.85, 0.5, 1]
];

function setup() {
    createCanvas(400, 400, WEBGL);
    myShader = buildMaterialShader(material);
    noiseShader = buildMaterialShader(noiseMaterial);
    // voronoiShader = buildMaterialShader(voronoiMaterial);
    noStroke();
}

function material() {
    let time = millis() / 1000;
    finalColor.begin();
    let r = 0.2 + 0.5 * abs(sin(time + 0));
    let g = 0.2 + 0.5 * abs(sin(time + 1));
    let b = 0.2 + 0.5 * abs(sin(time + 2));
    finalColor.set([r, g, b, 1]);
    finalColor.end();
}

function noiseMaterial() {
    finalColor.begin();
    let coord = finalColor.texCoord;
    let n = noise(coord.x * 4, coord.y * 4);

    let colorA = uniformVec4('colorA', () => paletteColors[0]);
    let colorB = uniformVec4('colorB', () => paletteColors[1]);
    let colorC = uniformVec4('colorC', () => paletteColors[2]);
    let colorD = uniformVec4('colorD', () => paletteColors[3]);

    let mix1 = mix(colorA, colorB, smoothstep(0.0, 0.33, n));
    let mix2 = mix(mix1, colorC, smoothstep(0.33, 0.66, n));
    let mix3 = mix(mix2, colorD, smoothstep(0.66, 1.0, n));

    finalColor.set(mix3);
    finalColor.end();
}


function hash2(p) {
    let a = dot(p, [127.1, 311.7]);
    let b = dot(p, [269.5, 183.3]);
    let sa = fract(sin(a) * 43758.5453123);
    let sb = fract(sin(b) * 43758.5453123);
    return [sa, sb];
}

function voronoiMaterial() {
    finalColor.begin();
    let coord = finalColor.texCoord;
    let p = [coord.x * 6, coord.y * 6];
    let ip = floor(p);
    let fp = fract(p);

    let lo = 0.0 - 1.0;
    let mid = 0.0;
    let hi = 1.0;

    let offset0 = [lo, lo];
    let point0 = hash2(ip + offset0);
    let dist0 = length(offset0 + point0 - fp);

    let offset1 = [mid, lo];
    let point1 = hash2(ip + offset1);
    let dist1 = length(offset1 + point1 - fp);

    let offset2 = [hi, lo];
    let point2 = hash2(ip + offset2);
    let dist2 = length(offset2 + point2 - fp);

    let offset3 = [lo, mid];
    let point3 = hash2(ip + offset3);
    let dist3 = length(offset3 + point3 - fp);

    let offset4 = [mid, mid];
    let point4 = hash2(ip + offset4);
    let dist4 = length(offset4 + point4 - fp);

    let offset5 = [hi, mid];
    let point5 = hash2(ip + offset5);
    let dist5 = length(offset5 + point5 - fp);

    let offset6 = [lo, hi];
    let point6 = hash2(ip + offset6);
    let dist6 = length(offset6 + point6 - fp);

    let offset7 = [mid, hi];
    let point7 = hash2(ip + offset7);
    let dist7 = length(offset7 + point7 - fp);

    let offset8 = [hi, hi];
    let point8 = hash2(ip + offset8);
    let dist8 = length(offset8 + point8 - fp);

    let minDist = min(dist0, dist1);
    minDist = min(minDist, dist2);
    minDist = min(minDist, dist3);
    minDist = min(minDist, dist4);
    minDist = min(minDist, dist5);
    minDist = min(minDist, dist6);
    minDist = min(minDist, dist7);
    minDist = min(minDist, dist8);

    finalColor.set([minDist, minDist, minDist, 1]);
    finalColor.end();
}



function draw() {
    background(245, 245, 220);

    // square with the color-shifting shader
    shader(myShader);
    rectMode(CENTER);
    push();
    translate(-100, 0);
    beginShape();
    vertex(0, 0);
    vertex(100, 0);
    vertex(100, 100);
    vertex(0, 100);
    endShape(CLOSE);
    pop();

    // circle with the noise shader
    shader(noiseShader);
    push();
    translate(100, 0);
    circle(0, 0, 100);
    pop();

    // // triangle with the voronoi noise shader
    // shader(voronoiShader);
    // push();
    // translate(0, 130);
    // triangle(-60, -50, 60, -50, 0, 50);
    // pop();
}