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

interface ChessBoard3DProps {
  game: ChessGame;
  onMove: (move: Move) => void;
  playerColor?: PieceColor;
  disabled?: boolean;
  className?: string;
}

// Professional tournament-grade Staunton 3D chess pieces matching Reference Studio
function renderPieceSvg(piece: ChessPiece) {
  const isWhite = piece.color === "w";
  const uid = `${piece.color}-${piece.type}`;

  const strokeColor = isWhite ? "#5A381A" : "#EAB308";
  const strokeWidth = isWhite ? 1.2 : 1.3;
  const bodyGrad = `url(#${uid}-body)`;
  const sphereGrad = `url(#${uid}-sphere)`;
  const baseGrad = `url(#${uid}-base)`;
  const goldGrad = `url(#${uid}-gold)`;
  const innerColor = isWhite ? "#8A5C2E" : "#F59E0B";
  const highlightColor = isWhite ? "#FFFFFF" : "#FEF08A";

  const defs = (
    <defs>
      {/* 3D Body Gradient (Directional Light from Top-Left) */}
      <linearGradient id={`${uid}-body`} x1="0.15" y1="0" x2="0.85" y2="1">
        {isWhite ? (
          <>
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="25%" stopColor="#FAF4E8" />
            <stop offset="65%" stopColor="#ECD3B0" />
            <stop offset="90%" stopColor="#C49B68" />
            <stop offset="100%" stopColor="#8F6234" />
          </>
        ) : (
          <>
            <stop offset="0%" stopColor="#554438" />
            <stop offset="25%" stopColor="#352922" />
            <stop offset="65%" stopColor="#1C140F" />
            <stop offset="90%" stopColor="#100A07" />
            <stop offset="100%" stopColor="#060403" />
          </>
        )}
      </linearGradient>

      {/* 3D Spherical Radial Highlight (Light from cx=35%, cy=30%) */}
      <radialGradient id={`${uid}-sphere`} cx="36%" cy="30%" r="65%">
        {isWhite ? (
          <>
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="35%" stopColor="#FAF3E6" />
            <stop offset="70%" stopColor="#DEC095" />
            <stop offset="100%" stopColor="#966735" />
          </>
        ) : (
          <>
            <stop offset="0%" stopColor="#6E594C" />
            <stop offset="35%" stopColor="#382A22" />
            <stop offset="75%" stopColor="#19110D" />
            <stop offset="100%" stopColor="#080504" />
          </>
        )}
      </radialGradient>

      {/* 3D Stepped Base Gradient */}
      <linearGradient id={`${uid}-base`} x1="0.1" y1="0" x2="0.9" y2="1">
        {isWhite ? (
          <>
            <stop offset="0%" stopColor="#FFFDF7" />
            <stop offset="35%" stopColor="#EAD2B0" />
            <stop offset="80%" stopColor="#B38956" />
            <stop offset="100%" stopColor="#6E4B23" />
          </>
        ) : (
          <>
            <stop offset="0%" stopColor="#5A473C" />
            <stop offset="35%" stopColor="#30231C" />
            <stop offset="80%" stopColor="#140D0A" />
            <stop offset="100%" stopColor="#050302" />
          </>
        )}
      </linearGradient>

      {/* Gleaming Royal Gold for Accents & Crowns */}
      <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFFBEB" />
        <stop offset="35%" stopColor="#FDE047" />
        <stop offset="70%" stopColor="#EAB308" />
        <stop offset="100%" stopColor="#A16207" />
      </linearGradient>
    </defs>
  );

  // Common Contact Shadow under every piece for physical 3D grounding
  const contactShadow = (
    <ellipse cx="22.5" cy="41.2" rx="14.5" ry="2.2" fill="rgba(0,0,0,0.4)" />
  );

  // Common 2-Tier Weighted Staunton Pedestal Base
  const renderBase = (widthTier: number = 36) => {
    const half = widthTier / 2;
    const x1 = 22.5 - half;
    const x2 = 22.5 + half;
    return (
      <g>
        {/* Tier 1: Weighted Plinth */}
        <path
          d={`M ${x1} 39.5 L ${x2} 39.5 C ${x2 + 1.5} 39.5 ${x2 + 2} 37.8 ${x2} 37.8 L ${x1} 37.8 C ${x1 - 2} 37.8 ${x1 - 1.5} 39.5 ${x1} 39.5 Z`}
          fill={baseGrad}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        {/* Tier 2: Beveled Upper Torus Ring */}
        <path
          d={`M ${x1 + 2.5} 37.8 L ${x2 - 2.5} 37.8 L ${x2 - 4} 34.8 L ${x1 + 4} 34.8 Z`}
          fill={bodyGrad}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        {/* Torus Highlight Specular Line */}
        <line
          x1={x1 + 4.5}
          y1="35.6"
          x2={x2 - 4.5}
          y2="35.6"
          stroke={highlightColor}
          strokeWidth="1"
          opacity={isWhite ? 0.9 : 0.45}
        />
      </g>
    );
  };

  switch (piece.type) {
    case "k": // King - Crowned with Royal Golden Finial Jewel, Dome & Filigree Ribs (No Cross)
      return (
        <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-[0_5px_8px_rgba(0,0,0,0.35)] select-none">
          {defs}
          {contactShadow}
          {renderBase(37)}

          {/* King Waist & Fluted Gown */}
          <path
            d="M 13.5 34.8 C 17.5 28 16.5 21.5 16.5 17.5 L 28.5 17.5 C 28.5 21.5 27.5 28 31.5 34.8 Z"
            fill={bodyGrad}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          {/* Specular Side Highlight */}
          <path
            d="M 17 33 C 18 28 17.5 22 17.5 18.5"
            stroke={highlightColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity={isWhite ? 0.85 : 0.35}
            fill="none"
          />

          {/* Royal Mantle Collar */}
          <path d="M 12.5 17.5 L 32.5 17.5 L 33 15 L 12 15 Z" fill={bodyGrad} stroke={strokeColor} strokeWidth={strokeWidth} />
          <line x1="13" y1="15.8" x2="32" y2="15.8" stroke={goldGrad} strokeWidth="1.2" />

          {/* Crown Dome & Ribbed Arches */}
          <path
            d="M 12.5 15 C 12.5 9.2 16.5 8 22.5 8 C 28.5 8 32.5 9.2 32.5 15 Z"
            fill={bodyGrad}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          {/* Crown Filigree Ribs */}
          <path d="M 22.5 8 L 22.5 15" stroke={goldGrad} strokeWidth="1.8" />
          <path
            d="M 16.5 10.5 C 18 12.5 20.2 13.8 22.5 13.8 C 24.8 13.8 27 12.5 28.5 10.5"
            stroke={goldGrad}
            strokeWidth="1.6"
            fill="none"
          />

          {/* Center Royal Gemstone */}
          <circle cx="22.5" cy="11.5" r="2" fill={isWhite ? "#DC2626" : "#10B981"} stroke={strokeColor} strokeWidth="0.8" />
          <circle cx="22.1" cy="11" r="0.6" fill="#FFFFFF" opacity="0.9" />

          {/* Coronet Mount on Dome */}
          <path
            d="M 16.5 8.2 C 18.5 6.8 20.8 6 22.5 6 C 24.2 6 26.5 6.8 28.5 8.2 Z"
            fill={goldGrad}
            stroke={strokeColor}
            strokeWidth="0.9"
          />

          {/* Grand Royal Crown Jewel (درّة التاج الملكية - لا صليب) */}
          <circle cx="22.5" cy="4.2" r="3.2" fill={goldGrad} stroke={strokeColor} strokeWidth="1" />
          {/* Specular Jewel Gleam */}
          <ellipse cx="21.3" cy="3.2" rx="1.4" ry="0.9" fill="#FFFFFF" opacity="0.95" />
          {/* Royal Finial Tip */}
          <circle cx="22.5" cy="1" r="1.1" fill={goldGrad} stroke={strokeColor} strokeWidth="0.6" />
        </svg>
      );

    case "q": // Queen - Majestic Flared 5-point Coronet with 5 Glowing Pearls
      return (
        <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-[0_5px_8px_rgba(0,0,0,0.35)] select-none">
          {defs}
          {contactShadow}
          {renderBase(37)}

          {/* Queen Waist & Curved Gown */}
          <path
            d="M 14 34.8 C 18 28 17 22 17 18.5 L 28 18.5 C 28 22 27 28 31 34.8 Z"
            fill={bodyGrad}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          <path
            d="M 17.5 33 C 18.5 28 18 22 18 19.5"
            stroke={highlightColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity={isWhite ? 0.85 : 0.35}
            fill="none"
          />

          {/* Royal Waistband */}
          <path d="M 14 18.5 L 31 18.5 L 31.5 16 L 13.5 16 Z" fill={bodyGrad} stroke={strokeColor} strokeWidth={strokeWidth} />
          <line x1="14.5" y1="16.8" x2="30.5" y2="16.8" stroke={goldGrad} strokeWidth="1.2" />

          {/* Flared 5-point Coronet */}
          <path
            d="M 10.5 16 L 11.5 7.5 L 16.5 13 L 22.5 5.5 L 28.5 13 L 33.5 7.5 L 34.5 16 Z"
            fill={bodyGrad}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          {/* Royal Necklace on Coronet Base */}
          <path d="M 14 16 C 17.5 18 27.5 18 31 16" stroke={goldGrad} strokeWidth="1.8" fill="none" />

          {/* 5 Golden Pearls on Crown Peaks */}
          <circle cx="11.5" cy="7.2" r="2" fill={goldGrad} stroke={strokeColor} strokeWidth="0.8" />
          <circle cx="16.5" cy="12.5" r="1.8" fill={goldGrad} stroke={strokeColor} strokeWidth="0.8" />
          <circle cx="22.5" cy="5.2" r="2.4" fill={goldGrad} stroke={strokeColor} strokeWidth="0.8" />
          <circle cx="28.5" cy="12.5" r="1.8" fill={goldGrad} stroke={strokeColor} strokeWidth="0.8" />
          <circle cx="33.5" cy="7.2" r="2" fill={goldGrad} stroke={strokeColor} strokeWidth="0.8" />

          {/* Pearl Highlights */}
          <circle cx="21.8" cy="4.5" r="0.8" fill="#FFFFFF" opacity="0.9" />
          <circle cx="10.8" cy="6.5" r="0.6" fill="#FFFFFF" opacity="0.9" />
          <circle cx="32.8" cy="6.5" r="0.6" fill="#FFFFFF" opacity="0.9" />
        </svg>
      );

    case "r": // Rook / Tower - Heavy Fortress Castle with 4 Battlements, Embrasure & Loopholes
      return (
        <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-[0_5px_8px_rgba(0,0,0,0.35)] select-none">
          {defs}
          {contactShadow}
          {renderBase(37)}

          {/* Tower Trunk */}
          <path d="M 13 34.8 L 32 34.8 L 30.5 20.5 L 14.5 20.5 Z" fill={bodyGrad} stroke={strokeColor} strokeWidth={strokeWidth} />
          {/* Tower Left Specular Line */}
          <line x1="16" y1="21.5" x2="15" y2="34" stroke={highlightColor} strokeWidth="1.6" opacity={isWhite ? 0.8 : 0.35} />

          {/* Castle Arrow Loop Window */}
          <rect
            x="21"
            y="24"
            width="3"
            height="6.5"
            rx="1.5"
            fill={isWhite ? "#5B3814" : "#F59E0B"}
            stroke={strokeColor}
            strokeWidth="0.8"
          />

          {/* Stone Cornice Ring */}
          <path d="M 11.5 20.5 L 33.5 20.5 L 34 17.5 L 11 17.5 Z" fill={baseGrad} stroke={strokeColor} strokeWidth={strokeWidth} />
          <line x1="12" y1="18.5" x2="33" y2="18.5" stroke={goldGrad} strokeWidth="1" />

          {/* 4 Castle Battlements (Merlons) with 3 Embrasures */}
          <path
            d="M 10.5 17.5 L 34.5 17.5 L 34.5 8.5 L 29.5 8.5 L 29.5 12.5 L 25 12.5 L 25 8.5 L 20 8.5 L 20 12.5 L 15.5 12.5 L 15.5 8.5 L 10.5 8.5 Z"
            fill={bodyGrad}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          {/* Embrasure Depth Shadow Line */}
          <line x1="11" y1="12.5" x2="34" y2="12.5" stroke={strokeColor} strokeWidth="1.2" opacity="0.6" />
        </svg>
      );

    case "b": // Bishop - Mitre with Teardrop Dome, Prominent Diagonal Cut & Finial Sphere
      return (
        <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-[0_5px_8px_rgba(0,0,0,0.35)] select-none">
          {defs}
          {contactShadow}
          {renderBase(36)}

          {/* Bishop Fluted Waist */}
          <path
            d="M 14.5 34.8 C 17.5 29 17 23.5 17 21 L 28 21 C 28 23.5 27.5 29 30.5 34.8 Z"
            fill={bodyGrad}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          {/* Waistband Arc */}
          <path d="M 15 26.5 C 18 28.5 27 28.5 30 26.5" stroke={innerColor} strokeWidth="1.6" fill="none" />

          {/* Mitre Collar */}
          <path d="M 13.5 21 L 31.5 21 L 32 18.5 L 13 18.5 Z" fill={baseGrad} stroke={strokeColor} strokeWidth={strokeWidth} />

          {/* Teardrop Mitre Dome */}
          <path
            d="M 22.5 6.5 C 15.5 6.5 12.5 11.5 12.5 18.5 L 32.5 18.5 C 32.5 11.5 29.5 6.5 22.5 6.5 Z"
            fill={bodyGrad}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />

          {/* Distinctive Bishop Diagonal Slit */}
          <path
            d="M 22.5 9.5 L 29 16.5 M 19 13.5 L 24 19"
            stroke={isWhite ? "#5B3814" : "#F59E0B"}
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Mitre Specular Highlight */}
          <path
            d="M 16 17 C 15 13 18 9 21 8"
            stroke={highlightColor}
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity={isWhite ? 0.8 : 0.4}
            fill="none"
          />

          {/* Golden Finial Sphere on Peak */}
          <circle cx="22.5" cy="5.2" r="2.3" fill={goldGrad} stroke={strokeColor} strokeWidth="0.9" />
          <circle cx="21.7" cy="4.4" r="0.8" fill="#FFFFFF" opacity="0.9" />
        </svg>
      );

    case "n": // Knight - Noble Arabian Tournament Stallion with Arched Crest, Flowing Mane & Expressive Eye
      return (
        <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-[0_5px_8px_rgba(0,0,0,0.35)] select-none">
          {defs}
          {contactShadow}
          {renderBase(37)}

          {/* Authentic Noble Horse Anatomy: Arched Neck, Powerful Chest, Elegant Muzzle & Pointed Ears */}
          <path
            d="M 32 34.8 C 34 29 35 24 34 18.5 C 33 13 28 8 23 7 L 23 3.5 C 22 3.2 21 4.5 20.8 6.5 L 18 2.5 C 16.8 2.8 17 4.8 17.5 7 C 15 10 13 14.5 10.5 19 C 9 21.5 9.2 23.5 11 24 C 12.5 24.5 14 23.5 15 21.5 C 18 20 20.5 22 19 26 C 17.5 29.5 15 32 13.5 34.8 Z"
            fill={bodyGrad}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />

          {/* Horse Muzzle, Mouth Slit & Nostril */}
          <path
            d="M 10.5 24 L 13.5 23"
            stroke={strokeColor}
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <ellipse
            cx="11.2"
            cy="21.5"
            rx="1.2"
            ry="0.8"
            fill={isWhite ? "#5B3814" : "#F59E0B"}
            stroke={strokeColor}
            strokeWidth="0.6"
            transform="rotate(-20 11.2 21.5)"
          />

          {/* Powerful Throat & Chest Shading Accent */}
          <path
            d="M 15 22 C 18 20 19.5 23 18.5 26.5 C 17 30 15 32.5 14 34.8"
            stroke={innerColor}
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
          />

          {/* Defined Equine Jaw & Cheekbone (Masseter) */}
          <path
            d="M 21.5 14 C 23.5 17.5 21.5 22 16 22.5"
            stroke={innerColor}
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
          />

          {/* 4 Deeply Carved Flowing Mane Locks on Crest */}
          <path
            d="M 23.5 8.5 C 26.5 10 29.5 12.5 30 15"
            stroke={innerColor}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 26 13.5 C 29 16 31.5 19 31.5 22"
            stroke={innerColor}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 28 19.5 C 31 22.5 32.5 26 32 29"
            stroke={innerColor}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 28.5 26 C 30.5 29 31 32 30.5 34"
            stroke={innerColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />

          {/* Left Specular Light Ridge along Arched Neck */}
          <path
            d="M 19 9 C 23 12 26 17 26.5 24"
            stroke={highlightColor}
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity={isWhite ? 0.8 : 0.35}
            fill="none"
          />

          {/* Alert Equine Almond Eye */}
          <ellipse
            cx="17"
            cy="12"
            rx="2"
            ry="1.4"
            fill={isWhite ? "#261508" : "#F59E0B"}
            stroke={strokeColor}
            strokeWidth="0.8"
          />
          <circle cx="16.5" cy="11.5" r="0.7" fill="#FFFFFF" />
        </svg>
      );

    case "p": // Pawn - Distinct Spherical Head, Flared Collar Dish, Slender Waist & Weighted Base
    default:
      return (
        <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-[0_4px_7px_rgba(0,0,0,0.32)] select-none">
          {defs}
          {contactShadow}
          {renderBase(35)}

          {/* Slender Concave Stem */}
          <path
            d="M 15 34.8 C 17.5 28 17 22.5 17 19.5 L 28 19.5 C 28 22.5 27.5 28 30 34.8 Z"
            fill={bodyGrad}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          {/* Stem Specular Shading Line */}
          <path
            d="M 18 34 C 19 28 18.5 22 18.5 20"
            stroke={highlightColor}
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity={isWhite ? 0.8 : 0.35}
            fill="none"
          />

          {/* Flared Collar Ring / Dish */}
          <path
            d="M 14.5 19.5 C 14.5 17.8 30.5 17.8 30.5 19.5 C 30.5 21 14.5 21 14.5 19.5 Z"
            fill={baseGrad}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          <line x1="15.5" y1="19.2" x2="29.5" y2="19.2" stroke={goldGrad} strokeWidth="1" />

          {/* 3D Volumetric Spherical Head */}
          <circle
            cx="22.5"
            cy="11.5"
            r="6"
            fill={sphereGrad}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />

          {/* Brilliant 3D Specular Sheen & Highlight Dot */}
          <ellipse
            cx="20.2"
            cy="9.2"
            rx="2.2"
            ry="1.4"
            fill="#FFFFFF"
            opacity={isWhite ? 0.9 : 0.55}
            transform="rotate(-30 20.2 9.2)"
          />
          <circle cx="22" cy="7.8" r="0.6" fill="#FFFFFF" opacity={isWhite ? 0.9 : 0.6} />
        </svg>
      );
  }
}

export default function ChessBoard3D({
  game,
  onMove,
  playerColor = "w",
  disabled = false,
  className = "",
}: ChessBoard3DProps) {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);

  // Clear selection on new game or turn switch
  useEffect(() => {
    setSelectedSquare(null);
    setLegalMoves([]);
  }, [game.turn, game.fullMoves]);

  const handleSquareClick = (sq: Square) => {
    if (disabled) return;

    // If waiting for promotion selection, ignore clicks
    if (pendingPromotion) return;

    const piece = game.getPiece(sq);

    // If clicked on own piece: select it
    if (piece && piece.color === game.turn && piece.color === playerColor) {
      if (selectedSquare === sq) {
        setSelectedSquare(null);
        setLegalMoves([]);
      } else {
        setSelectedSquare(sq);
        setLegalMoves(game.getLegalMovesForSquare(sq));
      }
      return;
    }

    // If a piece was already selected, check if target square is legal move
    if (selectedSquare) {
      const match = legalMoves.find((m) => m.to === sq);
      if (match) {
        const { r } = parseSquare(sq);
        const movingPiece = game.getPiece(selectedSquare);

        // Check if pawn promotion required
        if (movingPiece?.type === "p" && (r === 0 || r === 7)) {
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

  // Perspective rows (Flipped if playing Black)
  const rows = playerColor === "w" ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  const cols = playerColor === "w" ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Captured Black Pieces Tray */}
      <div className="w-full flex items-center justify-between px-3 py-1.5 mb-2 rounded-xl bg-[#201915]/90 border border-[#8B5E34]/50 shadow-md text-xs text-[#E6C687]">
        <span className="font-bold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#3A2D25] border border-[#C6923B]" />
          <span>القطع الملتقطة (الأسود):</span>
        </span>
        <div className="flex items-center gap-1">
          {game.capturedPieces.b.map((p, idx) => (
            <div key={idx} className="w-6 h-6">
              {renderPieceSvg(p)}
            </div>
          ))}
        </div>
      </div>

      {/* Main Realistic Wooden 3D Chessboard matching Reference Studio Design */}
      <div className="relative p-3 sm:p-4 rounded-[28px] bg-gradient-to-br from-[#4E2A12] via-[#3B1E0C] to-[#251206] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),inset_0_2px_4px_rgba(255,220,150,0.35),0_0_0_2px_#7C451D] border-4 border-[#C6923B]">
        {/* Top File Labels (a - h) */}
        <div className="grid grid-cols-8 text-center pb-1 text-[11px] font-black text-[#E8C88B] tracking-wider">
          {cols.map((c) => (
            <span key={c}>{String.fromCharCode(97 + c)}</span>
          ))}
        </div>

        {/* Board with Left and Right Rank Numbers */}
        <div className="flex items-center gap-1.5">
          {/* Left Rank Numbers (8 - 1) */}
          <div className="flex flex-col justify-around h-[300px] sm:h-[400px] text-[11px] font-black text-[#E8C88B] pr-0.5">
            {rows.map((r) => (
              <span key={r} className="flex items-center justify-center h-full">
                {8 - r}
              </span>
            ))}
          </div>

          {/* 8x8 Wooden Chess Grid */}
          <div className="grid grid-cols-8 grid-rows-8 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-xl overflow-hidden border-2 border-[#52290D] shadow-[inset_0_4px_12px_rgba(0,0,0,0.6)]">
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
                        ? "bg-[#F59E0B]/80 shadow-[inset_0_0_12px_rgba(245,158,11,0.9)] ring-2 ring-[#FEF08A] z-10"
                        : isKingCheck
                        ? "bg-[#DC2626] animate-pulse shadow-[inset_0_0_16px_rgba(0,0,0,0.8)] z-10"
                        : isLastMoveFrom || isLastMoveTo
                        ? "bg-[#FCD34D]/35 shadow-inner"
                        : isLight
                        ? "bg-[#EAD5B7] hover:bg-[#F3E3CA]"
                        : "bg-[#8B5327] hover:bg-[#9B6031]"
                    }`}
                  >
                    {/* Legal Move Dot Marker */}
                    {isLegal && !isCapture && (
                      <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#10B981] shadow-[0_2px_6px_rgba(16,185,129,0.7)] ring-2 ring-white/80 pointer-events-none z-10 animate-scale" />
                    )}

                    {/* Legal Capture Ring Marker */}
                    {isCapture && (
                      <span className="absolute inset-1 rounded-full border-4 border-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.8)] pointer-events-none z-10 animate-pulse" />
                    )}

                    {/* Chess Piece SVG */}
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

          {/* Right Rank Numbers (8 - 1) */}
          <div className="flex flex-col justify-around h-[300px] sm:h-[400px] text-[11px] font-black text-[#E8C88B] pl-0.5">
            {rows.map((r) => (
              <span key={r} className="flex items-center justify-center h-full">
                {8 - r}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom File Labels (a - h) */}
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
        <div className="flex items-center gap-1">
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
          <div className="clay-card !p-5 bg-white dark:bg-[#1C183D] border-2 border-brand-500 text-center space-y-3 shadow-2xl">
            <h4 className="text-sm font-black text-slate-900 dark:text-white">
              ترقية البيدق! اختر القطعة الملكية:
            </h4>
            <div className="flex items-center gap-2 justify-center">
              {(["q", "r", "b", "n"] as PieceType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleChoosePromotion(t)}
                  className="w-14 h-14 p-2 rounded-2xl bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 border border-brand-300 flex items-center justify-center active:scale-95 transition-all shadow-md"
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
