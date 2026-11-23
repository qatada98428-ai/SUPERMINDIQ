/**
 * SUPER MIND IQ — Complete Chess Engine & AI
 * Full legal chess move validator, FEN parser, MiniMax Alpha-Beta AI engine,
 * interactive curriculum, and tactics puzzles.
 */

export type PieceType = "p" | "n" | "b" | "r" | "q" | "k"; // lowercase = black, uppercase = white
export type PieceColor = "w" | "b";

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

export type Square = string; // e.g., "e4", "a1"
export type BoardState = (ChessPiece | null)[][]; // 8x8 (row 0 = rank 8, row 7 = rank 1)

export interface Move {
  from: Square;
  to: Square;
  promotion?: PieceType;
  captured?: ChessPiece;
  isCastling?: boolean;
  isEnPassant?: boolean;
}

export interface GameStatus {
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  winner?: PieceColor;
}

// Initial Standard Chess Position in FEN:
export const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export function parseSquare(sq: Square): { r: number; c: number } {
  const file = sq.charCodeAt(0) - 97; // 'a' -> 0
  const rank = 8 - parseInt(sq[1], 10); // '8' -> 0, '1' -> 7
  return { r: rank, c: file };
}

export function toSquare(r: number, c: number): Square {
  const file = String.fromCharCode(97 + c);
  const rank = (8 - r).toString();
  return `${file}${rank}`;
}

export class ChessGame {
  board: BoardState;
  turn: PieceColor = "w";
  castling: { K: boolean; Q: boolean; k: boolean; q: boolean } = {
    K: true, Q: true, k: true, q: true,
  };
  enPassantTarget: Square | null = null;
  halfMoves: number = 0;
  fullMoves: number = 1;
  capturedPieces: { w: ChessPiece[]; b: ChessPiece[] } = { w: [], b: [] };
  moveHistory: Move[] = [];

  constructor(fen: string = STARTING_FEN) {
    this.board = Array(8).fill(null).map(() => Array(8).fill(null));
    this.loadFen(fen);
  }

  loadFen(fen: string) {
    const parts = fen.trim().split(" ");
    const rows = parts[0].split("/");

    this.board = Array(8).fill(null).map(() => Array(8).fill(null));

    for (let r = 0; r < 8; r++) {
      let c = 0;
      for (const char of rows[r]) {
        if (/[1-8]/.test(char)) {
          c += parseInt(char, 10);
        } else {
          const isWhite = char === char.toUpperCase();
          this.board[r][c] = {
            type: char.toLowerCase() as PieceType,
            color: isWhite ? "w" : "b",
          };
          c++;
        }
      }
    }

    this.turn = (parts[1] || "w") as PieceColor;
    const castlingStr = parts[2] || "KQkq";
    this.castling = {
      K: castlingStr.includes("K"),
      Q: castlingStr.includes("Q"),
      k: castlingStr.includes("k"),
      q: castlingStr.includes("q"),
    };
    this.enPassantTarget = parts[3] && parts[3] !== "-" ? parts[3] : null;
    this.halfMoves = parseInt(parts[4] || "0", 10);
    this.fullMoves = parseInt(parts[5] || "1", 10);
  }

  getPiece(sq: Square): ChessPiece | null {
    const { r, c } = parseSquare(sq);
    return this.board[r]?.[c] ?? null;
  }

  clone(): ChessGame {
    const next = new ChessGame();
    next.board = this.board.map((row) => row.map((p) => (p ? { ...p } : null)));
    next.turn = this.turn;
    next.castling = { ...this.castling };
    next.enPassantTarget = this.enPassantTarget;
    next.halfMoves = this.halfMoves;
    next.fullMoves = this.fullMoves;
    next.capturedPieces = {
      w: [...this.capturedPieces.w],
      b: [...this.capturedPieces.b],
    };
    next.moveHistory = [...this.moveHistory];
    return next;
  }

  // Generate pseudo-legal moves for a specific piece
  private getRawMoves(r: number, c: number): { r: number; c: number; isEnPassant?: boolean; isCastling?: boolean }[] {
    const piece = this.board[r][c];
    if (!piece || piece.color !== this.turn) return [];

    const moves: { r: number; c: number; isEnPassant?: boolean; isCastling?: boolean }[] = [];
    const dir = piece.color === "w" ? -1 : 1;
    const startRank = piece.color === "w" ? 6 : 1;

    // 1. Pawn Moves
    if (piece.type === "p") {
      // 1 square forward
      if (r + dir >= 0 && r + dir < 8 && !this.board[r + dir][c]) {
        moves.push({ r: r + dir, c });
        // 2 squares forward from start rank
        if (r === startRank && !this.board[r + 2 * dir][c]) {
          moves.push({ r: r + 2 * dir, c });
        }
      }

      // Diagonal captures
      for (const dc of [-1, 1]) {
        const nr = r + dir;
        const nc = c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          const target = this.board[nr][nc];
          if (target && target.color !== piece.color) {
            moves.push({ r: nr, c: nc });
          } else if (this.enPassantTarget && toSquare(nr, nc) === this.enPassantTarget) {
            moves.push({ r: nr, c: nc, isEnPassant: true });
          }
        }
      }
    }

    // 2. Knight Moves
    if (piece.type === "n") {
      const knightOffsets = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1],
      ];
      for (const [dr, dc] of knightOffsets) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          const target = this.board[nr][nc];
          if (!target || target.color !== piece.color) {
            moves.push({ r: nr, c: nc });
          }
        }
      }
    }

    // 3. Sliding Pieces (Rook, Bishop, Queen)
    if (piece.type === "r" || piece.type === "b" || piece.type === "q") {
      const directions: [number, number][] = [];
      if (piece.type === "r" || piece.type === "q") {
        directions.push([0, 1], [0, -1], [1, 0], [-1, 0]);
      }
      if (piece.type === "b" || piece.type === "q") {
        directions.push([1, 1], [1, -1], [-1, 1], [-1, -1]);
      }

      for (const [dr, dc] of directions) {
        let nr = r + dr;
        let nc = c + dc;
        while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          const target = this.board[nr][nc];
          if (!target) {
            moves.push({ r: nr, c: nc });
          } else {
            if (target.color !== piece.color) {
              moves.push({ r: nr, c: nc });
            }
            break; // ray blocked
          }
          nr += dr;
          nc += dc;
        }
      }
    }

    // 4. King Moves & Castling
    if (piece.type === "k") {
      const kingOffsets = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],          [0, 1],
        [1, -1],  [1, 0],  [1, 1],
      ];
      for (const [dr, dc] of kingOffsets) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          const target = this.board[nr][nc];
          if (!target || target.color !== piece.color) {
            moves.push({ r: nr, c: nc });
          }
        }
      }

      // Castling rules:
      const rank = piece.color === "w" ? 7 : 0;
      if (r === rank && c === 4 && !this.isSquareAttacked(r, c, piece.color === "w" ? "b" : "w")) {
        // Kingside O-O
        const canKingside = piece.color === "w" ? this.castling.K : this.castling.k;
        if (
          canKingside &&
          !this.board[rank][5] && !this.board[rank][6] &&
          !this.isSquareAttacked(rank, 5, piece.color === "w" ? "b" : "w") &&
          !this.isSquareAttacked(rank, 6, piece.color === "w" ? "b" : "w")
        ) {
          moves.push({ r: rank, c: 6, isCastling: true });
        }

        // Queenside O-O-O
        const canQueenside = piece.color === "w" ? this.castling.Q : this.castling.q;
        if (
          canQueenside &&
          !this.board[rank][1] && !this.board[rank][2] && !this.board[rank][3] &&
          !this.isSquareAttacked(rank, 2, piece.color === "w" ? "b" : "w") &&
          !this.isSquareAttacked(rank, 3, piece.color === "w" ? "b" : "w")
        ) {
          moves.push({ r: rank, c: 2, isCastling: true });
        }
      }
    }

    return moves;
  }

  isSquareAttacked(r: number, c: number, byColor: PieceColor): boolean {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const p = this.board[row][col];
        if (p && p.color === byColor) {
          // Pawn attacks
          if (p.type === "p") {
            const pdir = byColor === "w" ? -1 : 1;
            if (row + pdir === r && (col - 1 === c || col + 1 === c)) return true;
          } else if (p.type === "n") {
            const dr = Math.abs(row - r);
            const dc = Math.abs(col - c);
            if ((dr === 1 && dc === 2) || (dr === 2 && dc === 1)) return true;
          } else if (p.type === "k") {
            if (Math.abs(row - r) <= 1 && Math.abs(col - c) <= 1) return true;
          } else {
            // Slider ray checks
            const isDiag = Math.abs(row - r) === Math.abs(col - c);
            const isStraight = row === r || col === c;
            if ((p.type === "b" && isDiag) || (p.type === "r" && isStraight) || (p.type === "q" && (isDiag || isStraight))) {
              const dr = Math.sign(r - row);
              const dc = Math.sign(c - col);
              let currR = row + dr;
              let currC = col + dc;
              let blocked = false;
              while (currR !== r || currC !== c) {
                if (this.board[currR][currC]) {
                  blocked = true;
                  break;
                }
                currR += dr;
                currC += dc;
              }
              if (!blocked) return true;
            }
          }
        }
      }
    }
    return false;
  }

  findKing(color: PieceColor): { r: number; c: number } | null {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        if (p && p.type === "k" && p.color === color) return { r, c };
      }
    }
    return null;
  }

  isCheck(color: PieceColor = this.turn): boolean {
    const king = this.findKing(color);
    if (!king) return false;
    return this.isSquareAttacked(king.r, king.c, color === "w" ? "b" : "w");
  }

  // Generate 100% legal moves
  getLegalMovesForSquare(sq: Square): Move[] {
    const { r, c } = parseSquare(sq);
    const piece = this.board[r][c];
    if (!piece || piece.color !== this.turn) return [];

    const raw = this.getRawMoves(r, c);
    const legal: Move[] = [];

    for (const dest of raw) {
      const destSq = toSquare(dest.r, dest.c);
      // Simulate move
      const cloned = this.clone();
      cloned.executeRawMove(sq, destSq, dest.isEnPassant, dest.isCastling);

      // King cannot be in check after move
      if (!cloned.isCheck(this.turn)) {
        // If pawn reaches 8th/1st rank, offer queen promotion
        if (piece.type === "p" && (dest.r === 0 || dest.r === 7)) {
          legal.push({ from: sq, to: destSq, promotion: "q" });
        } else {
          legal.push({
            from: sq,
            to: destSq,
            isEnPassant: dest.isEnPassant,
            isCastling: dest.isCastling,
            captured: this.board[dest.r][dest.c] || undefined,
          });
        }
      }
    }

    return legal;
  }

  getAllLegalMoves(): Move[] {
    const all: Move[] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        if (p && p.color === this.turn) {
          all.push(...this.getLegalMovesForSquare(toSquare(r, c)));
        }
      }
    }
    return all;
  }

  private executeRawMove(from: Square, to: Square, isEnPassant?: boolean, isCastling?: boolean, promotion?: PieceType) {
    const f = parseSquare(from);
    const t = parseSquare(to);
    const piece = this.board[f.r][f.c]!;

    if (isEnPassant) {
      const capturedR = f.r;
      const capturedC = t.c;
      this.board[capturedR][capturedC] = null;
    }

    if (isCastling) {
      const rank = f.r;
      if (t.c === 6) {
        // Kingside O-O
        this.board[rank][5] = this.board[rank][7];
        this.board[rank][7] = null;
      } else if (t.c === 2) {
        // Queenside O-O-O
        this.board[rank][3] = this.board[rank][0];
        this.board[rank][0] = null;
      }
    }

    // Move piece
    this.board[t.r][t.c] = promotion ? { type: promotion, color: piece.color } : piece;
    this.board[f.r][f.c] = null;
  }

  makeMove(move: Move): boolean {
    const legals = this.getLegalMovesForSquare(move.from);
    const valid = legals.find(
      (m) => m.to === move.to && (!move.promotion || m.promotion === move.promotion)
    );
    if (!valid) return false;

    const f = parseSquare(move.from);
    const t = parseSquare(move.to);
    const piece = this.board[f.r][f.c]!;
    const captured = this.board[t.r][t.c];

    if (captured) {
      if (captured.color === "w") this.capturedPieces.w.push(captured);
      else this.capturedPieces.b.push(captured);
    }

    this.executeRawMove(move.from, move.to, valid.isEnPassant, valid.isCastling, move.promotion);

    // Update castling rights
    if (piece.type === "k") {
      if (piece.color === "w") { this.castling.K = false; this.castling.Q = false; }
      else { this.castling.k = false; this.castling.q = false; }
    }
    if (piece.type === "r") {
      if (f.r === 7 && f.c === 7) this.castling.K = false;
      if (f.r === 7 && f.c === 0) this.castling.Q = false;
      if (f.r === 0 && f.c === 7) this.castling.k = false;
      if (f.r === 0 && f.c === 0) this.castling.q = false;
    }

    // Set En Passant target
    if (piece.type === "p" && Math.abs(f.r - t.r) === 2) {
      this.enPassantTarget = toSquare((f.r + t.r) / 2, f.c);
    } else {
      this.enPassantTarget = null;
    }

    this.moveHistory.push(move);
    this.turn = this.turn === "w" ? "b" : "w";
    if (this.turn === "w") this.fullMoves++;
    return true;
  }

  getStatus(): GameStatus {
    const legalMoves = this.getAllLegalMoves();
    const inCheck = this.isCheck(this.turn);

    if (legalMoves.length === 0) {
      if (inCheck) {
        return {
          isCheck: true,
          isCheckmate: true,
          isStalemate: false,
          isDraw: false,
          winner: this.turn === "w" ? "b" : "w",
        };
      } else {
        return {
          isCheck: false,
          isCheckmate: false,
          isStalemate: true,
          isDraw: true,
        };
      }
    }

    return {
      isCheck: inCheck,
      isCheckmate: false,
      isStalemate: false,
      isDraw: false,
    };
  }
}

// =========================================================================
// AI CHESS ENGINE (MiniMax with Alpha-Beta Pruning)
// =========================================================================

const PIECE_VALS: Record<PieceType, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Positional bonuses for center control
const PAWN_PST = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

export function evaluateBoard(game: ChessGame): number {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = game.board[r][c];
      if (p) {
        const val = PIECE_VALS[p.type] + (p.type === "p" ? PAWN_PST[p.color === "w" ? r : 7 - r][c] : 0);
        score += p.color === "w" ? val : -val;
      }
    }
  }
  return score;
}

export function findBestAiMove(game: ChessGame, depth: number = 2): Move | null {
  const moves = game.getAllLegalMoves();
  if (moves.length === 0) return null;

  // Level 1: Random or simple capture
  if (depth <= 1) {
    const captures = moves.filter((m) => m.captured);
    if (captures.length > 0 && Math.random() > 0.3) {
      return captures[Math.floor(Math.random() * captures.length)];
    }
    return moves[Math.floor(Math.random() * moves.length)];
  }

  let bestMove: Move = moves[0];
  const isMax = game.turn === "w";
  let bestScore = isMax ? -Infinity : Infinity;

  for (const m of moves) {
    const clone = game.clone();
    clone.makeMove(m);
    const score = minimax(clone, depth - 1, -Infinity, Infinity, !isMax);

    if (isMax) {
      if (score > bestScore) {
        bestScore = score;
        bestMove = m;
      }
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMove = m;
      }
    }
  }

  return bestMove;
}

function minimax(game: ChessGame, depth: number, alpha: number, beta: number, isMax: boolean): number {
  if (depth === 0) return evaluateBoard(game);

  const moves = game.getAllLegalMoves();
  if (moves.length === 0) {
    if (game.isCheck(game.turn)) return isMax ? -10000 : 10000;
    return 0; // stalemate
  }

  if (isMax) {
    let maxEval = -Infinity;
    for (const m of moves) {
      const clone = game.clone();
      clone.makeMove(m);
      const evalScore = minimax(clone, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const m of moves) {
      const clone = game.clone();
      clone.makeMove(m);
      const evalScore = minimax(clone, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

// =========================================================================
// CHESS ACADEMY CURRICULUM DATA
// =========================================================================

export interface ChessLesson {
  id: string;
  level: number;
  titleAr: string;
  titleEn: string;
  taglineAr: string;
  piecesCovered: string[];
  fen: string;
  explanationAr: string[];
  exerciseGoalAr: string;
  expectedMove: { from: Square; to: Square };
}

export const CHESS_CURRICULUM: ChessLesson[] = [
  {
    id: "lesson-pawn-promotion",
    level: 1,
    titleAr: "الدرس 1: زحف البيدق والترقية الملكية (Pawn Promotion)",
    titleEn: "Lesson 1: Pawn Movement & Promotion",
    taglineAr: "كيف يتحول أضعف جندي إلى أقوى قطعة على الرقعة",
    piecesCovered: ["p", "q", "k"],
    fen: "3k4/4P3/8/8/8/8/8/4K3 w - - 0 1",
    explanationAr: [
      "البيدق يتحرك للأمام خطوة واحدة، وفي نقلته الأولى يمكنه التقدم خطوتين.",
      "عندما ينجح البيدق في الوصول إلى الصف الثامن (آخر صف على الرقعة)، يرتقي فوراً ليتحول إلى وزير أو رخ أو فيل أو حصان!",
      "الترقية إلى وزير (Queening) هي السلاح الحاسم في نهايات الأدوار.",
    ],
    exerciseGoalAr: "ادفع البيدق الأبيض من e7 إلى e8 ليرتقي إلى وزير متوج!",
    expectedMove: { from: "e7", to: "e8" },
  },
  {
    id: "lesson-knight-fork",
    level: 2,
    titleAr: "الدرس 2: شوكة الحصان الملكية (The Royal Fork)",
    titleEn: "Lesson 2: The Royal Knight Fork",
    taglineAr: "مهاجمة قطعتين ثمينتين في نفس اللحظة بحركة واحدة",
    piecesCovered: ["n", "k", "r"],
    fen: "r3k3/8/8/3N4/8/8/8/4K3 w - - 0 1",
    explanationAr: [
      "الحصان هو القطعة الوحيدة التي تقفز فوق القطع في مسار حرف L.",
      "تحدث الشوكة (Fork) عندما يقفز الحصان إلى خانة يهاجم فيها هدفين مهمين في نفس اللحظة دون حماية.",
      "عندما يهاجم الحصان الملك والرخ معاً، يُجبر الملك على الهروب ويسقط الرخ!",
    ],
    exerciseGoalAr: "حرك الحصان من d5 إلى c7 لتصنع شوكة ملكية تهجم على الملك والرخ في آن واحد!",
    expectedMove: { from: "d5", to: "c7" },
  },
  {
    id: "lesson-pin",
    level: 3,
    titleAr: "الدرس 3: تكتيك الربط المطلق (The Absolute Pin)",
    titleEn: "Lesson 3: The Absolute Pin Tactic",
    taglineAr: "شل حركة قطعة الخصم خلف قطعة أكثر قيمة",
    piecesCovered: ["r", "q", "k"],
    fen: "4k3/4q3/8/8/8/8/4R3/4K3 w - - 0 1",
    explanationAr: [
      "الربط (Pin) هو إيقاع قطعة للخصم في خط نار مباشر أمام قطعة أهم (مثل الملك).",
      "الربط المطلق: عندما يكون الملك خلف القطعة المربوطة مباشرة، يمنع القانون تحريكها نهائياً لحماية الملك من الكش!",
      "استغل شل حركة الوزير المربوط واقبض عليه لحسم التفوق المادي.",
    ],
    exerciseGoalAr: "الرخ الأبيض يربط الوزير الأسود أمام الملك تماماً: التقط الوزير بنقلة الرخ من e2 إلى e7!",
    expectedMove: { from: "e2", to: "e7" },
  },
  {
    id: "lesson-mate-in-1",
    level: 4,
    titleAr: "الدرس 4: كش مات في نقلة واحدة - ضربة نابليون (Scholar's Mate)",
    titleEn: "Lesson 4: Scholar's Mate in 1",
    taglineAr: "استغلال النقطة الضعيفة f7 لإنهاء الدور فوراً",
    piecesCovered: ["q", "b", "k"],
    fen: "r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1",
    explanationAr: [
      "النقطة f7 لدى الأسود هي أضعف خانة في بداية الدور لأن الملك وحده من يحميها.",
      "عند تكاتف الفيل الأبيض على c4 والوزير على f3 بالهجوم المشترك على f7، ينهار دفاع الخصم فوراً.",
      "التقاط الوزير للبيدق على f7 يحقق الكش مات لأن الفيل يحمي الوزير والملك لا يستطيع التقاطه!",
    ],
    exerciseGoalAr: "حرك الوزير الأبيض من f3 إلى f7 وأعلن الكش مات الفوري الحاسم!",
    expectedMove: { from: "f3", to: "f7" },
  },
  {
    id: "lesson-back-rank",
    level: 5,
    titleAr: "الدرس 5: مات الصف الخلفي القاتل (Back-Rank Mate)",
    titleEn: "Lesson 5: Back-Rank Mate",
    taglineAr: "محاصرة الملك خلف بيادقه بضربة رخ قاصمة",
    piecesCovered: ["r", "k", "p"],
    fen: "3r2k1/5ppp/8/8/8/8/8/3R2K1 w - - 0 1",
    explanationAr: [
      "عندما يبيت الملك وراء 3 بيادق غير متحركة، يصبح الصف الثامن أشبه بسجن مغلق.",
      "إذا وصل رخ الخصم للصف الأخير وقضى على الرخ المدافع، تنتهي الجولة بالكش مات لعدم وجود مهرب.",
      "النصيحة الدفاعية: اصنع نافذة هروب (Luft) لملكك بدفع أحد البيادق مبكراً!",
    ],
    exerciseGoalAr: "التقط رخ الخصم بحركة الرخ من d1 إلى d8 لتعلن كش مات الصف الأخير الفوري!",
    expectedMove: { from: "d1", to: "d8" },
  },
  {
    id: "lesson-skewer",
    level: 6,
    titleAr: "الدرس 6: السيخ التكتيكي القاطع (The Skewer)",
    titleEn: "Lesson 6: The Skewer Attack",
    taglineAr: "إجبار القطعة الكبرى على الهروب لصيد ما خلفها",
    piecesCovered: ["r", "k"],
    fen: "4k2r/8/8/8/8/8/8/R3K3 w Qk - 0 1",
    explanationAr: [
      "السيخ (Skewer) عكس الربط: تهاجم فيه قطعة كبرى في الأمام (الملك)، لإجباره على الابتعاد وكشف قطعة خلفه.",
      "عندما يهرب الملك من الكش على الصف الثامن، يبقى الرخ غير المحمي فريسة سهلة في النقلة التالية.",
      "السلاح الأقوى في نهايات ألعاب الأرخاخ والأساقفة!",
    ],
    exerciseGoalAr: "حرك الرخ من a1 إلى a8 ليهدد الملك مجبراً إياه على الهروب وكاشفاً الرخ خلفه!",
    expectedMove: { from: "a1", to: "a8" },
  },
];

// =========================================================================
// CHESS TACTICS PUZZLES BANK
// =========================================================================

export interface ChessPuzzle {
  id: string;
  titleAr: string;
  fen: string;
  solution: { from: Square; to: Square };
  hintAr: string;
  explanationAr: string;
}

export const TACTICS_PUZZLES: ChessPuzzle[] = [
  {
    id: "puz-1",
    titleAr: "لغز 1: كش مات الوزير في الصف الأخير",
    fen: "6k1/5ppp/8/8/8/8/5PPP/4Q1K1 w - - 0 1",
    solution: { from: "e1", to: "e8" },
    hintAr: "انظر إلى الصف الأخير، الملك الأسود محاصر خلف بيادقه!",
    explanationAr: "الوزير ينزل للصف الثامن e8 ليوجه كش مات قاطع، لأن البيادق تحبس الملك ولا يوجد مهرب.",
  },
  {
    id: "puz-2",
    titleAr: "لغز 2: شوكة الحصان القاضية بين الملك والرخ",
    fen: "4r1k1/5ppp/8/3N4/8/8/5PPP/6K1 w - - 0 1",
    solution: { from: "d5", to: "e7" },
    hintAr: "الحصان يستطيع القفز إلى خانة يهدد فيها الملك والرخ معاً!",
    explanationAr: "قفزة الحصان إلى e7 تعلن كش للملك وتهجم على الرخ في e8 في نفس اللحظة!",
  },
  {
    id: "puz-3",
    titleAr: "لغز 3: سيخ الرخ على الصف الأخير",
    fen: "4k2r/8/8/8/8/8/8/R3K3 w Qk - 0 1",
    solution: { from: "a1", to: "a8" },
    hintAr: "وجّه كش للملك على نفس الصف الذي يقف عليه رخه غير المحمي!",
    explanationAr: "النقلة Ra8 تهاجم الملك بكش، ومجبراً الملك على الابتعاد لتلتقط رخ h8 في النقلة التالية.",
  },
  {
    id: "puz-4",
    titleAr: "لغز 4: مات نابليون السريع على f7",
    fen: "r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1",
    solution: { from: "f3", to: "f7" },
    hintAr: "الوزير والفيل يتعاونان للهجوم على أضعف خانة للملك الأسود!",
    explanationAr: "النقلة Qxf7# كش مات فوري لأن الملك لا يستطيع التقاط الوزير المحمي بالفيل.",
  },
  {
    id: "puz-5",
    titleAr: "لغز 5: مات الصف الخلفي بكسر الرخ",
    fen: "3r2k1/5ppp/8/8/8/8/8/3R2K1 w - - 0 1",
    solution: { from: "d1", to: "d8" },
    hintAr: "التقط رخ الخصم المحمي بالملك فقط وافرض الكش مات!",
    explanationAr: "Rxd8# تقضي على الرخ وتفرض الكش مات لأن بيادق الأسود f7,g7,h7 تحبس ملكها.",
  },
  {
    id: "puz-6",
    titleAr: "لغز 6: الربط المطلق للوزير",
    fen: "4k3/4q3/8/8/8/8/4R3/4K3 w - - 0 1",
    solution: { from: "e2", to: "e7" },
    hintAr: "استغل أن الوزير مربوط أمام الملك تماماً واقبض عليه!",
    explanationAr: "Rxe7+ تأكل الوزير دون خوف لأن الوزير مربوط ولا يستطيع الهروب من حماية الملك.",
  },
  {
    id: "puz-7",
    titleAr: "لغز 7: ترقية البيدق الخاطفة",
    fen: "3k4/4P3/8/8/8/8/8/4K3 w - - 0 1",
    solution: { from: "e7", to: "e8" },
    hintAr: "البيدق على بعد خطوة واحدة فقط من الصف الثامن!",
    explanationAr: "e8=Q+ يرتقي البيدق فوراً إلى وزير مع كش للملك لتبدأ خطة الفوز الحاسم.",
  },
  {
    id: "puz-8",
    titleAr: "لغز 8: شوكة الحصان الملكية على c7",
    fen: "r3k3/8/8/3N4/8/8/8/4K3 w - - 0 1",
    solution: { from: "d5", to: "c7" },
    hintAr: "الخانة c7 خانة سحرية للحصان لتهديد الملك والرخ معاً!",
    explanationAr: "Nc7+ تعلن كش للملك على e8 وتهدد الرخ على a8 في آن واحد، لتكسب الرخ كاملاً.",
  },
];
