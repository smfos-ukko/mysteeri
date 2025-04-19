const image = new Image();
const TILECOUNT = 4;
const SHUFFLES = 50;
image.src = 'stuff/puzzle.png';
let blank;
const SECONDSTAGE = `
    <button id="answerButton">perse</button>
`;
let effort = 0;
let success = 0;
image.onload = () => {
    const tileSize = image.width / TILECOUNT;
    let i = 0;
    for (let y = 0; y < TILECOUNT; y++) {
        for (let x = 0; x < TILECOUNT; x++) {
            const tileCanvas = document.createElement('canvas');
            const wrapper = document.createElement('div');
            wrapper.classList.add('cell');
            wrapper.dataset.index = i;
            i++;
            tileCanvas.width = tileSize;
            tileCanvas.height = tileSize;
            const ctx = tileCanvas.getContext('2d');
            ctx.drawImage(image, x * tileSize, y * tileSize, tileSize, tileSize, 0, 0, tileSize, tileSize);
            wrapper.appendChild(tileCanvas);
            document.getElementById('tileContainer').appendChild(wrapper);
        }
    }

    //SHUFFLE
    const grid = document.querySelector('#tileContainer');
    let cells = Array.from(grid.children);
    blank = cells[Math.floor(Math.random() * cells.length)];
    blank.classList.add('blank');
    blank.style.visibility = 'hidden';
    cells.forEach(cell => grid.appendChild(cell));
    let moves = 0;
    while (moves < SHUFFLES) {
        cells = Array.from(grid.children);
        const randomCell = cells[Math.floor(Math.random() * cells.length)];
        moves = moves + moveCells(grid, randomCell);
        effort++;
    }
    console.log('efforts: ', effort, ' successes: ', success);

    //CLICKETY
    grid.addEventListener('click', e => {
        const clicked = e.target.closest('.cell');
        if (clicked == null) return;
        const newBlank = moveCells(grid, clicked);
    });
}

window.onload = (event) => {
    const style = document.createElement('style');
    style.textContent = `
        #tileContainer {
            grid-template-columns: repeat(${TILECOUNT}, auto);
        }
    `;
    document.head.appendChild(style);
    document.getElementById('container').insertAdjacentHTML('beforeend', SECONDSTAGE);
}

function moveCells(grid, clicked) {
    if (clicked.classList.contains('blank')) return 0;
    const a = getCoords(grid, clicked);
    const b = getCoords(grid, blank);
    if ((Math.abs(b[0] - a[0]) == 1 && a[1] == b[1]) || (Math.abs(b[1] - a[1]) == 1 && a[0] == b[0])) {
        const a2 = clicked.nextSibling;
        const b2 = blank.nextSibling;
        if (a2 === blank) {
            grid.insertBefore(blank, clicked);
        } else if (b2 === clicked) {
            grid.insertBefore(clicked, blank);
        } else {
            grid.insertBefore(clicked, b2);
            grid.insertBefore(blank, a2);
        }
        success++;
        return 1;
    }
    return 0;
}

function getCoords(grid, cell) {
    const cells = Array.from(grid.children);
    const index = cells.indexOf(cell);
    const val = [];
    val[0] = index % TILECOUNT;
    val[1] = Math.floor(index / TILECOUNT);
    return val;
}