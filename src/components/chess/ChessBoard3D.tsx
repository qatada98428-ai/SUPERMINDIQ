"use client";

import React, { useState, useEffect } from "react";
import {
  ChessGame,
  Square,
  Move,
  ChessPiece,
  PieceType,
  PieceColor,
  parseSquare,
  toSquare,
} from "@/lib/chess/chess-engine";
import { playSoftChessSound } from "@/lib/chess/chess-sound";

interface ChessBoard3DProps {
  game: ChessGame;
  onMove: (move: Move) => void;
  playerColor?: PieceColor;
  isTwoPlayer?: boolean;
  autoQueen?: boolean;
  flipped?: boolean;
  disabled?: boolean;
  statusBadge?: string | null;
  className?: string;
}

// Classic Tournament Staunton Vector Chess Pieces (Warm Ivory & Polished Ebony)
export function renderPieceSvg(piece: ChessPiece) {
  const isWhite = piece.color === "w";
  const uid = `st-${piece.color}-${piece.type}`;

  const strokeColor = isWhite ? "#2B1D14" : "#0B0E14";
  const innerStroke = isWhite ? "#3E2A1D" : "#D6DCE5";
  const highlightStroke = isWhite ? "#FFFFFF" : "#94A3B8";
  const strokeWidth = 1.35;
  const bodyGrad = `url(#${uid}-body)`;
  const baseGrad = `url(#${uid}-base)`;
  const goldGrad = `url(#${uid}-gold)`;

  const defs = (
    <defs>
      <linearGradient id={`${uid}-body`} x1="0.15" y1="0" x2="0.85" y2="1">
        {isWhite ? (
          <>
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="30%" stopColor="#FDF9F0" />
            <stop offset="70%" stopColor="#EAE0CF" />
            <stop offset="100%" stopColor="#CBB89D" />
          </>
        ) : (
          <>
            <stop offset="0%" stopColor="#4B5563" />
            <stop offset="28%" stopColor="#2F3744" />
            <stop offset="70%" stopColor="#1B202A" />
            <stop offset="100%" stopColor="#0E1117" />
          </>
        )}
      </linearGradient>

      <linearGradient id={`${uid}-base`} x1="0" y1="0" x2="0" y2="1">
        {isWhite ? (
          <>
            <stop offset="0%" stopColor="#FFFDF8" />
            <stop offset="50%" stopColor="#E6D9C5" />
            <stop offset="100%" stopColor="#BCA78B" />
          </>
        ) : (
          <>
            <stop offset="0%" stopColor="#3B4352" />
            <stop offset="50%" stopColor="#1E242E" />
            <stop offset="100%" stopColor="#0B0E14" />
          </>
        )}
      </linearGradient>

      <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="45%" stopColor="#EAB308" />
        <stop offset="100%" stopColor="#A16207" />
      </linearGradient>
    </defs>
  );

  const shadow = <ellipse cx="22.5" cy="41.5" rx="14.5" ry="2.2" fill="rgba(0,0,0,0.34)" />;

  const renderBase = (w: number = 34) => {
    const half = w / 2;
    const x1 = 22.5 - half;
    const x2 = 22.5 + half;
    return (
      <g>
        <path
          d={`M ${x1 + 1} 40.5 L ${x2 - 1} 40.5 C ${x2 + 1} 40.5 ${x2 + 1} 38.1 ${x2 - 1} 38.1 L ${x1 + 1} 38.1 C ${x1 - 1} 38.1 ${x1 - 1} 40.5 ${x1 + 1} 40.5 Z`}
          fill={baseGrad}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        <path
          d={`M ${x1 + 2.5} 38.1 L ${x2 - 2.5} 38.1 C ${x2 - 1.5} 38.1 ${x2 - 3.2} 35.3 ${x2 - 4.8} 35.3 L ${x1 + 4.8} 35.3 C ${x1 + 3.2} 35.3 ${x1 + 1.5} 38.1 ${x1 + 2.5} 38.1 Z`}
          fill={bodyGrad}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        <line
          x1={x1 + 5}
          y1="36.4"
          x2={x2 - 5}
          y2="36.4"
          stroke={highlightStroke}
          strokeWidth="1.15"
          strokeLinecap="round"
          opacity={isWhite ? 0.85 : 0.55}
        />
      </g>
    );
  };

  switch (piece.type) {
    case "k": // Classic Staunton King (Imperial Crown Finial)
      return (
        <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-[0_3px_5px_rgba(0,0,0,0.45)] select-none">
          {defs}
          {shadow}
          {renderBase(35)}
          <path
            d="M 13.8 35.3 C 16.8 29.5 16.5 23 16.5 19 L 28.5 19 C 28.5 23 28.2 29.5 31.2 35.3 Z"
            fill={bodyGrad}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          <ellipse cx="22.5" cy="18.8" rx="7.8" ry="2.1" fill={baseGrad} stroke={strokeColor} strokeWidth={strokeWidth} />
          <path
            d="M 11.8 17 C 11 11.2 15.2 8.2 22.5 8.2 C 29.8 8.2 34 11.2 33.2 17 Z"
            fill={bodyGrad}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          <path d="M 22.5 8.2 L 22.5 17" stroke={innerStroke} strokeWidth="1.4" strokeLinecap="round" />
          <path
            d="M 15.5 12 C 18.2 14.2 26.8 14.2 29.5 12"
            stroke={goldGrad}
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          <path d="M 16.2 18.6 L 28.8 18.6" stroke={goldGrad} strokeWidth="1.2" strokeLinecap="round" />
          {/* Royal Crown Finial Jewel */}
          <path d="M 19.2 8.3 L 22.5 5.6 L 25.8 8.3 Z" fill={goldGrad} stroke={strokeColor} strokeWidth="0.9" />
          <circle cx="22.5" cy="4.2" r="2.7" fill={goldGrad} stroke={strokeColor} strokeWidth="1" />
          <circle cx="21.7" cy="3.4" r="0.85" fill="#FFFFFF" opacity="0.95" />
        </svg>
      );

    case "q": // Classic Staunton Queen
      return (
        <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-[0_3px_5px_rgba(0,0,0,0.45)] select-none">
          {defs}
          {shadow}
          {renderBase(35)}
          <path
            d="M 14.2 35.3 C 17 29.5 17 23.5 17 19.8 L 28 19.8 C 28 23.5 28 29.5 30.8 35.3 Z"
            fill={bodyGrad}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          <ellipse cx="22.5" cy="19.6" rx="7.6" ry="2" fill={baseGrad} stroke={strokeColor} strokeWidth={strokeWidth} />
          <path
            d="M 11.5 18 L 8.8 10.5 L 15.5 14.5 L 17.8 8 L 22.5 13.8 L 27.2 8 L 29.5 14.5 L 36.2 10.5 L 33.5 18 Z"
            fill={bodyGrad}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          <path d="M 14 17.8 C 18 19.2 27 19.2 31 17.8" stroke={goldGrad} strokeWidth="1.4" fill="none" />
          <circle cx="8.8" cy="10" r="1.8" fill={goldGrad} stroke={strokeColor} strokeWidth="0.9" />
          <circle cx="17.8" cy="7.4" r="1.9" fill={goldGrad} stroke={strokeColor} strokeWidth="0.9" />
          <circle cx="22.5" cy="5.8" r="2.1" fill={goldGrad} stroke={strokeColor} strokeWidth="0.9" />
          <circle cx="27.2" cy="7.4" r="1.9" fill={goldGrad} stroke={strokeColor} strokeWidth="0.9" />
          <circle cx="36.2" cy="10" r="1.8" fill={goldGrad} stroke={strokeColor} strokeWidth="0.9" />
        </svg>
      );

    case "r": // Classic Staunton Rook
      return (
        <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-[0_3px_5px_rgba(0,0,0,0.45)] select-none">
          {defs}
          {shadow}
          {renderBase(34)}
          <path
            d="M 14.2 35.3 L 15.8 19.5 L 29.2 19.5 L 30.8 35.3 Z"
            fill={bodyGrad}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          <line x1="17.3" y1="21.5" x2="16.4" y2="33.8" stroke={highlightStroke} strokeWidth="1.4" strokeLinecap="round" opacity={isWhite ? 0.85 : 0.45} />
          <path
            d="M 12.2 19.5 L 32.8 19.5 L 34 17 L 34 9.5 L 29.8 9.5 L 29.8 13 L 25.4 13 L 25.4 9.5 L 19.6 9.5 L 19.6 13 L 15.2 13 L 15.2 9.5 L 11 9.5 L 11 17 Z"
            fill={bodyGrad}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          <line x1="12.5" y1="16.8" x2="32.5" y2="16.8" stroke={innerStroke} strokeWidth="1.2" opacity="0.85" />
          <line x1="15.5" y1="19.5" x2="29.5" y2="19.5" stroke={innerStroke} strokeWidth="1.2" opacity="0.85" />
        </svg>
      );

    case "b": // Classic Staunton Bishop
      return (
        <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-[0_3px_5px_rgba(0,0,0,0.45)] select-none">
          {defs}
          {shadow}
          {renderBase(33)}
          <path
            d="M 15.2 35.3 C 17.2 30 17.5 25 17.5 22 L 27.5 22 C 27.5 25 27.8 30 29.8 35.3 Z"
            fill={bodyGrad}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          <ellipse cx="22.5" cy="21.8" rx="6.8" ry="1.9" fill={baseGrad} stroke={strokeColor} strokeWidth={strokeWidth} />
          {/* Classic Teardrop Mitre */}
          <path
            d="M 22.5 8 C 16 10.5 13.5 15.2 14.5 20.6 L 30.5 20.6 C 31.5 15.2 29 10.5 22.5 8 Z"
            fill={bodyGrad}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          {/* Iconic Diagonal Mitre Cut */}
          <path d="M 23.2 10.8 L 28.4 16.8" stroke={innerStroke} strokeWidth="2.1" strokeLinecap="round" />
          <path d="M 17.5 18.8 C 16.8 15.2 18.5 11.8 21.2 10.2" stroke={highlightStroke} strokeWidth="1.3" strokeLinecap="round" opacity={isWhite ? 0.85 : 0.45} fill="none" />
          <circle cx="22.5" cy="6.2" r="2.3" fill={bodyGrad} stroke={strokeColor} strokeWidth={strokeWidth} />
        </svg>
      );

    case "n": // Authentic Classic Staunton Knight (Cburnett Tournament Silhouette!)
      return (
        <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-[0_3px_5px_rgba(0,0,0,0.45)] select-none">
          {defs}
          {shadow}
          {renderBase(34)}
          {/* Arched Stallion Neck & Mane */}
          <path
            d="M 22 10 C 31.5 10.8 36.8 17.5 35.8 35.3 L 14.8 35.3 C 14.8 27.5 23.8 29.5 22.2 17.5"
            fill={bodyGrad}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Noble Horse Head, Ears, Muzzle, Chin & Jaw */}
          <path
            d="M 23.5 17.5 C 23.8 20.3 18.4 24.4 16 26 C 13.2 27.8 13.3 29.8 11.2 29.5 C 10.2 28.6 12.4 26.8 11.1 26.9 C 10.1 26.9 11.2 28 10.1 28.8 C 9.1 28.8 6.4 29.6 6.5 25 C 6.5 23.1 12.2 13.8 12.2 13.8 C 12.2 13.8 14 12 14.1 10.5 C 13.4 9.6 13.6 8.5 13.6 7.5 C 14.5 6.6 16.4 9.8 16.4 9.8 L 18.3 9.8 C 18.3 9.8 19.1 7.9 20.7 7 C 21.6 7 21.6 9.8 21.6 9.8"
            fill={bodyGrad}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Sculpted Mane Ridge Highlight */}
          <path
            d="M 23.8 12 C 30.2 13 33.8 18.5 33.2 33.4"
            stroke={innerStroke}
            strokeWidth="1.3"
            strokeLinecap="round"
            fill="none"
            opacity="0.75"
          />
          {/* Nostril & Expressive Almond Eye */}
          <ellipse cx="9.2" cy="24.5" rx="0.85" ry="0.65" fill={innerStroke} />
          <ellipse
            cx="15.2"
            cy="15.1"
            rx="1.25"
            ry="0.85"
            transform="rotate(-25 15.2 15.1)"
            fill={innerStroke}
          />
          <circle cx="15.5" cy="14.8" r="0.38" fill={isWhite ? "#FFFFFF" : "#0B0E14"} />
        </svg>
      );

    case "p": // Classic Staunton Pawn
    default:
      return (
        <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-[0_3px_5px_rgba(0,0,0,0.45)] select-none">
          {defs}
          {shadow}
          {renderBase(32)}
          <path
            d="M 16 35.3 C 17.8 29 18.5 25 18.5 22 L 26.5 22 C 26.5 25 27.2 29 29 35.3 Z"
            fill={bodyGrad}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          <ellipse cx="22.5" cy="21.5" rx="5.8" ry="1.8" fill={baseGrad} stroke={strokeColor} strokeWidth={strokeWidth} />
          <circle cx="22.5" cy="14.2" r="6.2" fill={bodyGrad} stroke={strokeColor} strokeWidth={strokeWidth} />
          <ellipse
            cx="20.5"
            cy="11.9"
            rx="2.1"
            ry="1.3"
            fill={highlightStroke}
            opacity={isWhite ? 0.9 : 0.6}
            transform="rotate(-30 20.5 11.9)"
          />
        </svg>
      );
  }
}

export default function ChessBoard3D({
  game,
  onMove,
  playerColor = "w",
  isTwoPlayer = false,
  autoQueen = false,
  flipped = false,
  disabled = false,
  statusBadge = null,
  className = "",
}: ChessBoard3DProps) {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);

  // Clear selection on new game or turn switch
  useEffect(() => {
    setSelectedSquare(null);
    setLegalMoves([]);
  }, [game.turn, game.fullMoves, game.moveHistory.length]);

  const handleSquareClick = (sq: Square) => {
    if (disabled || pendingPromotion) return;

    const piece = game.getPiece(sq);

    // In 2-player local mode, either White or Black can select their pieces when it's their turn
    const canSelectOwn = isTwoPlayer
      ? Boolean(piece && piece.color === game.turn)
      : Boolean(piece && piece.color === game.turn && piece.color === playerColor);

    if (canSelectOwn) {
      if (selectedSquare === sq) {
        setSelectedSquare(null);
        setLegalMoves([]);
      } else {
        setSelectedSquare(sq);
        setLegalMoves(game.getLegalMovesForSquare(sq));
        playSoftChessSound("select");
      }
      return;
    }

    // If a piece was already selected, check if target square is a legal destination
    if (selectedSquare) {
      const match = legalMoves.find((m) => m.to === sq);
      if (match) {
        const { r } = parseSquare(sq);
        const movingPiece = game.getPiece(selectedSquare);

        if (movingPiece?.type === "p" && (r === 0 || r === 7)) {
          if (autoQueen) {
            onMove({ ...match, promotion: "q" });
            setSelectedSquare(null);
            setLegalMoves([]);
            return;
          }
          setPendingPromotion({ from: selectedSquare, to: sq });
          return;
        }

        onMove(match);
        setSelectedSquare(null);
        setLegalMoves([]);
      } else {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    }
  };

  const handleChoosePromotion = (promoPiece: PieceType) => {
    if (!pendingPromotion) return;
    onMove({
      from: pendingPromotion.from,
      to: pendingPromotion.to,
      promotion: promoPiece,
    });
    setPendingPromotion(null);
    setSelectedSquare(null);
    setLegalMoves([]);
  };

  const inCheck = game.isCheck(game.turn);
  const kingPos = inCheck ? game.findKing(game.turn) : null;
  const kingCheckSq = kingPos ? toSquare(kingPos.r, kingPos.c) : null;
  const lastMove = game.moveHistory[game.moveHistory.length - 1];

  const viewAsBlack = isTwoPlayer ? flipped : (playerColor === "b") !== flipped;
  const rows = !viewAsBlack ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  const cols = !viewAsBlack ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Captured Black Pieces Tray */}
      <div className="w-full flex items-center justify-between px-3 py-1.5 mb-2 rounded-xl bg-[#201915]/90 border border-[#8B5E34]/50 shadow-md text-xs text-[#E6C687]">
        <span className="font-bold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#3A2D25] border border-[#C6923B]" />
          <span>القطع الملتقطة (الأسود):</span>
        </span>
        <div className="flex items-center gap-0.5 flex-wrap">
          {game.capturedPieces.b.map((p, idx) => (
            <div key={idx} className="w-6 h-6">
              {renderPieceSvg(p)}
            </div>
          ))}
        </div>
      </div>

      {/* Classic Wooden 2D Chessboard (forced LTR so files a->h always run left-to-right) */}
      <div
        dir="ltr"
        className="relative p-3 sm:p-4 rounded-[28px] bg-gradient-to-br from-[#4E2A12] via-[#3B1E0C] to-[#251206] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),inset_0_2px_4px_rgba(255,220,150,0.35),0_0_0_2px_#7C451D] border-4 border-[#C6923B]"
      >
        {statusBadge && (
          <div
            dir="rtl"
            className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1 rounded-full bg-[#1B143B]/90 backdrop-blur-md border border-amber-400/50 text-[11px] font-black text-amber-200 shadow-lg animate-pulse"
          >
            {statusBadge}
          </div>
        )}
        {/* Top File Labels */}
        <div className="grid grid-cols-8 text-center pb-1 text-[11px] font-black text-[#E8C88B] tracking-wider">
          {cols.map((c) => (
            <span key={c}>{String.fromCharCode(97 + c)}</span>
          ))}
        </div>

        {/* Board with Left and Right Rank Numbers */}
        <div className="flex items-center gap-1.5">
          <div className="flex flex-col justify-around h-[304px] sm:h-[424px] text-[11px] font-black text-[#E8C88B] pr-0.5">
            {rows.map((r) => (
              <span key={r} className="flex items-center justify-center h-full">
                {8 - r}
              </span>
            ))}
          </div>

          {/* 8x8 Wooden Chess Grid */}
          <div className="grid grid-cols-8 grid-rows-8 w-[304px] h-[304px] sm:w-[424px] sm:h-[424px] rounded-xl overflow-hidden border-2 border-[#52290D] shadow-[inset_0_4px_12px_rgba(0,0,0,0.6)]">
            {rows.map((r) =>
              cols.map((c) => {
                const sq = toSquare(r, c);
                const piece = game.board[r][c];
                const isLight = (r + c) % 2 === 0;
                const isSelected = selectedSquare === sq;
                const isLegal = legalMoves.some((m) => m.to === sq);
                const isCapture = isLegal && Boolean(piece);
                const isLastMoveFrom = lastMove?.from === sq;
                const isLastMoveTo = lastMove?.to === sq;
                const isKingCheck = kingCheckSq === sq;

                return (
                  <div
                    key={sq}
                    onClick={() => handleSquareClick(sq)}
                    className={`relative flex items-center justify-center cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? "bg-[#F59E0B]/85 shadow-[inset_0_0_12px_rgba(245,158,11,0.9)] ring-2 ring-[#FEF08A] z-10"
                        : isKingCheck
                        ? "bg-[#DC2626] animate-pulse shadow-[inset_0_0_16px_rgba(0,0,0,0.8)] z-10"
                        : isLastMoveFrom || isLastMoveTo
                        ? "bg-[#FCD34D]/45 shadow-inner"
                        : isLight
                        ? "bg-[#EAD5B7] hover:bg-[#F3E3CA]"
                        : "bg-[#8B5327] hover:bg-[#9B6031]"
                    }`}
                  >
                    {isLegal && !isCapture && (
                      <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#10B981] shadow-[0_2px_6px_rgba(16,185,129,0.7)] ring-2 ring-white/80 pointer-events-none z-10" />
                    )}

                    {isCapture && (
                      <span className="absolute inset-1 rounded-full border-4 border-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.8)] pointer-events-none z-10 animate-pulse" />
                    )}

                    {piece && (
                      <div className="w-[88%] h-[88%] transition-transform hover:scale-105 active:scale-95 z-20">
                        {renderPieceSvg(piece)}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="flex flex-col justify-around h-[304px] sm:h-[424px] text-[11px] font-black text-[#E8C88B] pl-0.5">
            {rows.map((r) => (
              <span key={r} className="flex items-center justify-center h-full">
                {8 - r}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom File Labels */}
        <div className="grid grid-cols-8 text-center pt-1 text-[11px] font-black text-[#E8C88B] tracking-wider">
          {cols.map((c) => (
            <span key={c}>{String.fromCharCode(97 + c)}</span>
          ))}
        </div>
      </div>

      {/* Captured White Pieces Tray */}
      <div className="w-full flex items-center justify-between px-3 py-1.5 mt-2 rounded-xl bg-[#201915]/90 border border-[#8B5E34]/50 shadow-md text-xs text-[#E6C687]">
        <span className="font-bold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#FFFDF7] border border-[#C6923B]" />
          <span>القطع الملتقطة (الأبيض):</span>
        </span>
        <div className="flex items-center gap-0.5 flex-wrap">
          {game.capturedPieces.w.map((p, idx) => (
            <div key={idx} className="w-6 h-6">
              {renderPieceSvg(p)}
            </div>
          ))}
        </div>
      </div>

      {/* Pawn Promotion Modal */}
      {pendingPromotion && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-3xl p-4 animate-in fade-in">
          <div className="p-5 rounded-3xl bg-[#1C183D] border-2 border-amber-400 text-center space-y-3 shadow-2xl">
            <h4 className="text-sm font-black text-amber-300">
              ترقية البيدق! اختر القطعة الملكية:
            </h4>
            <div className="flex items-center gap-2 justify-center">
              {(["q", "r", "b", "n"] as PieceType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleChoosePromotion(t)}
                  className="w-14 h-14 p-2 rounded-2xl bg-white/10 hover:bg-amber-400/20 border border-amber-400/60 flex items-center justify-center active:scale-95 transition-all shadow-md"
                >
                  {renderPieceSvg({ type: t, color: game.turn })}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
