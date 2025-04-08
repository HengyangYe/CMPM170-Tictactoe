enum Player {
  X = 'X',
  O = 'O'
}
type CellValue = Player | null | 'blocked';

class Game {
  board: CellValue[][][]; // [z][y][x]
  current: Player = Player.X;
  winner: Player | null = null;
  statusEl = document.getElementById('status') as HTMLParagraphElement;

  constructor() {
    // 初始化 3×3×3
    this.board = Array.from({ length: 3 }, () =>
      Array.from({ length: 3 }, () => Array<CellValue>(3).fill(null))
    );
    // 第二层中心封锁
    this.board[1][1][1] = 'blocked';

    this.render();
    this.updateStatus();
    this.bindUI();
  }

  //绑定 UI
  private bindUI() {
    document.querySelectorAll<HTMLDivElement>('.board').forEach((boardEl) => {
      const z = Number(boardEl.getAttribute('data-z'));

      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          const cell = document.createElement('div');
          cell.className = 'cell';
          cell.dataset.x = String(x);
          cell.dataset.y = String(y);
          cell.dataset.z = String(z);
          cell.addEventListener('click', () => this.handleClick(x, y, z));
          boardEl.appendChild(cell);
        }
      }
    });

    (document.getElementById('restart') as HTMLButtonElement).onclick = () =>
      location.reload();
  }

  /* ---------- 点击落子 ---------- */
  private handleClick(x: number, y: number, z: number) {
    if (this.winner) return;
    if (!this.isLegal(x, y, z)) return;

    this.board[z][y][x] = this.current;

    if (this.checkWin(x, y, z)) {
      this.winner = this.current;
      this.updateStatus(`${this.current} wins! 🎉`);
    } else {
      this.current = this.current === Player.X ? Player.O : Player.X;
      this.updateStatus();
    }

    this.render();
  }

  // Check if legal
  private isLegal(x: number, y: number, z: number): boolean {
    if (this.board[z][y][x] !== null) return false; // 已有子/封锁

    if (z === 0) return true; // 第一层随意

    const below = this.board[z - 1][y][x];

    // 第三层中心例外
    if (z === 2 && x === 1 && y === 1) return true;

    // 必须压在对手子上
    return below === (this.current === Player.X ? Player.O : Player.X);
  }

  /* ---------- 3D 胜负判定 ---------- */
  private checkWin(x: number, y: number, z: number): boolean {
    const p = this.current;

    // 13 个独立方向向量（+/- 会在遍历中两边累计）
    const dirs: [number, number, number][] = [
      [1, 0, 0],  // X 轴
      [0, 1, 0],  // Y 轴
      [0, 0, 1],  // Z 轴
      [1, 1, 0],  // XY 对角
      [1, -1, 0],
      [1, 0, 1],  // XZ 对角
      [1, 0, -1],
      [0, 1, 1],  // YZ 对角
      [0, -1, 1],
      [1, 1, 1],  // 空间对角
      [1, -1, 1],
      [1, 1, -1],
      [1, -1, -1]
    ];

    const inBounds = (x: number, y: number, z: number) =>
      x >= 0 && x < 3 && y >= 0 && y < 3 && z >= 0 && z < 3;

    for (const [dx, dy, dz] of dirs) {
      let count = 1; // 当前格已是本方棋子

      // 向正方向累加
      for (let step = 1; step < 3; step++) {
        const nx = x + dx * step;
        const ny = y + dy * step;
        const nz = z + dz * step;
        if (inBounds(nx, ny, nz) && this.board[nz][ny][nx] === p) {
          count++;
        } else break;
      }

      // 向反方向累加
      for (let step = 1; step < 3; step++) {
        const nx = x - dx * step;
        const ny = y - dy * step;
        const nz = z - dz * step;
        if (inBounds(nx, ny, nz) && this.board[nz][ny][nx] === p) {
          count++;
        } else break;
      }

      if (count >= 3) return true; // 满 3 连线即胜
    }

    return false;
  }

  private render() {
    document.querySelectorAll<HTMLDivElement>('.cell').forEach((cellEl) => {
      const x = Number(cellEl.dataset.x);
      const y = Number(cellEl.dataset.y);
      const z = Number(cellEl.dataset.z);
      const val = this.board[z][y][x];

      cellEl.classList.remove('X', 'O', 'blocked');
      if (val === 'blocked') cellEl.classList.add('blocked');
      else if (val) cellEl.classList.add(val);

      cellEl.textContent = val && val !== 'blocked' ? val : '';
    });
  }

  private updateStatus(msg?: string) {
    this.statusEl.textContent = msg ?? `Current turn: ${this.current}`;
  }
}

new Game();
