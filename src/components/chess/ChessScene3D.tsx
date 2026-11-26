"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  Suspense,
  Component,
  ErrorInfo,
  ReactNode,
} from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, Lightformer, ContactShadows } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
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
import {
  RotateCcw,
  Eye,
  Compass,
  FlipVertical2,
  Cpu,
  Sparkles,
  Lock,
  Unlock,
} from "lucide-react";
import { playSoftChessSound } from "@/lib/chess/chess-sound";

export type QualityLevel = "high" | "balanced" | "low";
export type CameraPreset = "classic" | "top" | "low" | "side";

export interface ChessScene3DProps {
  game: ChessGame;
  onMove: (move: Move) => void;
  playerColor?: PieceColor;
  isTwoPlayer?: boolean;
  autoQueen?: boolean;
  flipped?: boolean;
  onToggleFlip?: () => void;
  disabled?: boolean;
  lockCameraByDefault?: boolean;
  statusBadge?: string | null;
  onFallbackTo2D?: () => void;
  className?: string;
}

const PIECE_MODEL_PATHS: Record<PieceType, string> = {
  p: "/models/chess/pawn.glb",
  r: "/models/chess/rook.glb",
  n: "/models/chess/knight.glb",
  b: "/models/chess/bishop.glb",
  q: "/models/chess/queen.glb",
  k: "/models/chess/king.glb?v=2",
};

// Preload all 6 CC0 Staunton GLB models
Object.values(PIECE_MODEL_PATHS).forEach((path) => {
  useGLTF.preload(path);
});

// Convert board (r, c) to 3D world (x, z)
// r=0 (rank 8) -> z=-3.5 | r=7 (rank 1) -> z=+3.5
// c=0 (file a) -> x=-3.5 | c=7 (file h) -> x=+3.5
function squareToWorld(r: number, c: number): [number, number] {
  return [c - 3.5, r - 3.5];
}

function squareStrToWorld(sq: Square): [number, number] {
  const { r, c } = parseSquare(sq);
  return squareToWorld(r, c);
}

// ---------------------------------------------------------------------------
// Procedural Wood & Coordinate Canvas Textures (Zero external downloads!)
// ---------------------------------------------------------------------------
function createWoodTexture(
  baseHex: string,
  grainHex: string,
  highlightHex: string,
  seed: number = 1
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle multi-layered organic wood grain fibers
  let s = seed * 9301 + 49297;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  for (let i = 0; i < 160; i++) {
    const y = rand() * 512;
    const thickness = 0.6 + rand() * 3.5;
    ctx.strokeStyle = rand() > 0.35 ? grainHex : highlightHex;
    ctx.globalAlpha = 0.06 + rand() * 0.14;
    ctx.lineWidth = thickness;
    ctx.beginPath();
    ctx.moveTo(0, y);
    const wave1 = (rand() - 0.5) * 14;
    const wave2 = (rand() - 0.5) * 14;
    ctx.bezierCurveTo(170, y + wave1, 340, y + wave2, 512, y + (rand() - 0.5) * 8);
    ctx.stroke();
  }

  // Soft cathedral ring undertones
  ctx.globalAlpha = 0.05;
  ctx.strokeStyle = grainHex;
  for (let k = 0; k < 6; k++) {
    const cx = rand() * 512;
    const cy = rand() * 512;
    for (let r = 20; r < 140; r += 16) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * 2.4, r * 0.45, 0.05, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function createCoordinateStripTexture(labels: string[], horizontal: boolean): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = horizontal ? 1024 : 96;
  canvas.height = horizontal ? 96 : 1024;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#E8C882";
  ctx.font = "bold 46px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const step = 1024 / 8;
  labels.forEach((label, i) => {
    const pos = step * i + step / 2;
    if (horizontal) {
      ctx.fillText(label, pos, 48);
    } else {
      ctx.fillText(label, 48, pos);
    }
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// ---------------------------------------------------------------------------
// Error Boundary for WebGL Resilience
// ---------------------------------------------------------------------------
class WebGLErrorBoundary extends Component<
  { children: ReactNode; onFallback?: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; onFallback?: () => void }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("3D Chess WebGL Error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-[420px] sm:h-[520px] rounded-3xl bg-[#1A1334] border-2 border-amber-500/40 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="text-4xl">♟️</div>
          <h3 className="text-base font-black text-amber-300">
            تعذر تشغيل العرض ثلاثي الأبعاد (WebGL) على هذا المتصفح
          </h3>
          <p className="text-xs text-slate-300 max-w-sm">
            يمكنك التبديل فوراً إلى الوضع الكلاسيكي ثنائي الأبعاد (2D) للاستمرار في اللعب بسلاسة كاملة.
          </p>
          {this.props.onFallback && (
            <button
              type="button"
              onClick={this.props.onFallback}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-lg"
            >
              التبديل إلى وضع 2D الآن
            </button>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Staunton GLB Piece Geometry Hook (Extracts & shares BufferGeometries)
// ---------------------------------------------------------------------------
function useStauntonGeometries(): Record<PieceType, THREE.BufferGeometry[]> {
  const pawnGltf = useGLTF(PIECE_MODEL_PATHS.p);
  const rookGltf = useGLTF(PIECE_MODEL_PATHS.r);
  const knightGltf = useGLTF(PIECE_MODEL_PATHS.n);
  const bishopGltf = useGLTF(PIECE_MODEL_PATHS.b);
  const queenGltf = useGLTF(PIECE_MODEL_PATHS.q);
  const kingGltf = useGLTF(PIECE_MODEL_PATHS.k);

  return useMemo(() => {
    const extract = (scene: THREE.Group): THREE.BufferGeometry[] => {
      const geos: THREE.BufferGeometry[] = [];
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          geos.push((obj as THREE.Mesh).geometry);
        }
      });
      return geos;
    };

    return {
      p: extract(pawnGltf.scene),
      r: extract(rookGltf.scene),
      n: extract(knightGltf.scene),
      b: extract(bishopGltf.scene),
      q: extract(queenGltf.scene),
      k: extract(kingGltf.scene),
    };
  }, [pawnGltf, rookGltf, knightGltf, bishopGltf, queenGltf, kingGltf]);
}

// ---------------------------------------------------------------------------
// Animated 3D Staunton Piece
// ---------------------------------------------------------------------------
interface AnimatedPieceProps {
  piece: ChessPiece;
  square: Square;
  geometries: THREE.BufferGeometry[];
  material: THREE.MeshStandardMaterial;
  selectedMaterial: THREE.MeshStandardMaterial;
  isSelected: boolean;
  isMovable: boolean;
  castShadow: boolean;
  animFrom?: Square | null;
  animKey?: number;
  onClick: (sq: Square) => void;
}

function AnimatedStauntonPiece({
  piece,
  square,
  geometries,
  material,
  selectedMaterial,
  isSelected,
  isMovable,
  castShadow,
  animFrom,
  animKey,
  onClick,
}: AnimatedPieceProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const [targetX, targetZ] = useMemo(() => squareStrToWorld(square), [square]);

  // Spawn at animFrom on frame 0 to prevent any single-frame teleport flash
  const initialPos = useMemo<[number, number, number]>(() => {
    if (animFrom && animFrom !== square) {
      const [fx, fz] = squareStrToWorld(animFrom);
      return [fx, 0, fz];
    }
    return [targetX, 0, targetZ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animation state stored in refs for 60fps zero-re-render frames
  const animState = useRef<{
    active: boolean;
    startX: number;
    startZ: number;
    progress: number;
    isKnight: boolean;
  }>({
    active: Boolean(animFrom && animFrom !== square),
    startX: initialPos[0],
    startZ: initialPos[2],
    progress: animFrom && animFrom !== square ? 0 : 1,
    isKnight: piece.type === "n",
  });

  useEffect(() => {
    if (animFrom && animFrom !== square) {
      const [fx, fz] = squareStrToWorld(animFrom);
      animState.current = {
        active: true,
        startX: fx,
        startZ: fz,
        progress: 0,
        isKnight: piece.type === "n",
      };
      if (groupRef.current) {
        groupRef.current.position.set(fx, 0, fz);
      }
    } else {
      animState.current.active = false;
      animState.current.progress = 1;
      if (groupRef.current) {
        groupRef.current.position.set(targetX, 0, targetZ);
      }
    }
  }, [animFrom, animKey, square, targetX, targetZ, piece.type]);

  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;

    const dt = Math.min(delta, 0.05);
    const anim = animState.current;

    if (anim.active) {
      anim.progress = Math.min(1, anim.progress + dt / 0.34);
      // Ease-out cubic
      const t = 1 - Math.pow(1 - anim.progress, 3);
      const curX = THREE.MathUtils.lerp(anim.startX, targetX, t);
      const curZ = THREE.MathUtils.lerp(anim.startZ, targetZ, t);
      const arcHeight = anim.isKnight ? 1.15 : 0.24;
      const curY = Math.sin(anim.progress * Math.PI) * arcHeight;
      g.position.set(curX, curY, curZ);

      if (anim.progress >= 1) {
        anim.active = false;
        g.position.set(targetX, 0, targetZ);
      }
    } else {
      // Smooth idle elevation when selected or hovered
      const desiredY = isSelected ? 0.22 : hovered && isMovable ? 0.08 : 0;
      g.position.x = THREE.MathUtils.lerp(g.position.x, targetX, dt * 14);
      g.position.z = THREE.MathUtils.lerp(g.position.z, targetZ, dt * 14);
      g.position.y = THREE.MathUtils.lerp(g.position.y, desiredY, dt * 14);
    }
  });

  // Poly Haven knight snout points +Z; White pieces sit at +Z and face -Z (Math.PI)
  const rotY = piece.color === "w" ? Math.PI : 0;

  return (
    <group
      ref={groupRef}
      position={initialPos}
      rotation={[0, rotY, 0]}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onClick(square);
      }}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        if (isMovable) {
          setHovered(true);
          document.body.style.cursor = "pointer";
        }
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      {geometries.map((geo, idx) => (
        <mesh
          key={idx}
          geometry={geo}
          material={isSelected ? selectedMaterial : material}
          castShadow={castShadow}
          receiveShadow={castShadow}
        />
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Captured Piece Ghost Exit Animation (lifts, spins & fades away smoothly!)
// ---------------------------------------------------------------------------
interface CapturedGhost {
  id: number;
  piece: ChessPiece;
  square: Square;
}

function CapturedPieceGhost({
  ghost,
  geometries,
  onDone,
}: {
  ghost: CapturedGhost;
  geometries: THREE.BufferGeometry[];
  onDone: (id: number) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const progressRef = useRef(0);
  const doneRef = useRef(false);
  const [x, z] = useMemo(() => squareStrToWorld(ghost.square), [ghost.square]);

  const ghostMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: ghost.piece.color === "w" ? "#F4ECE0" : "#2D2420",
        roughness: 0.3,
        metalness: 0.1,
        transparent: true,
        opacity: 1,
      }),
    [ghost.piece.color]
  );

  useEffect(() => {
    return () => {
      ghostMat.dispose();
    };
  }, [ghostMat]);

  useFrame((_, delta) => {
    if (doneRef.current || !groupRef.current) return;
    progressRef.current = Math.min(1, progressRef.current + Math.min(delta, 0.05) / 0.45);
    const p = progressRef.current;
    const ease = 1 - Math.pow(1 - p, 2);

    groupRef.current.position.set(x, ease * 1.45, z);
    groupRef.current.rotation.y = (ghost.piece.color === "w" ? Math.PI : 0) + ease * Math.PI * 1.2;
    const s = Math.max(0.01, 1 - ease * 0.85);
    groupRef.current.scale.set(s, s, s);
    ghostMat.opacity = Math.max(0, 1 - ease);

    if (p >= 1) {
      doneRef.current = true;
      onDone(ghost.id);
    }
  });

  return (
    <group ref={groupRef} position={[x, 0, z]}>
      {geometries.map((geo, i) => (
        <mesh key={i} geometry={geo} material={ghostMat} />
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Camera Controller with Smooth Preset Transitions + OrbitControls
// ---------------------------------------------------------------------------
function CameraRig({
  preset,
  presetTrigger,
  viewAsBlack,
  locked,
}: {
  preset: CameraPreset;
  presetTrigger: number;
  viewAsBlack: boolean;
  locked: boolean;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const transitioningRef = useRef(false);
  const targetPosRef = useRef(new THREE.Vector3(0, 8.6, 9.8));

  useEffect(() => {
    const sign = viewAsBlack ? -1 : 1;
    if (preset === "classic") {
      targetPosRef.current.set(0, 8.6, 9.8 * sign);
    } else if (preset === "top") {
      targetPosRef.current.set(0, 12.2, 0.7 * sign);
    } else if (preset === "low") {
      targetPosRef.current.set(0, 4.8, 11.2 * sign);
    } else if (preset === "side") {
      targetPosRef.current.set(9.0 * sign, 7.2, 5.2 * sign);
    }
    transitioningRef.current = true;
  }, [preset, presetTrigger, viewAsBlack]);

  useFrame((_, delta) => {
    if (!transitioningRef.current) return;
    const dt = Math.min(delta, 0.05);
    camera.position.lerp(targetPosRef.current, dt * 6);
    if (controlsRef.current) {
      controlsRef.current.target.lerp(new THREE.Vector3(0, 0, 0), dt * 6);
      controlsRef.current.update();
    }
    if (camera.position.distanceTo(targetPosRef.current) < 0.06) {
      camera.position.copy(targetPosRef.current);
      transitioningRef.current = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enabled={!locked}
      enableRotate={!locked}
      enableZoom={!locked}
      enableDamping
      dampingFactor={0.075}
      enablePan={false}
      minDistance={5.0}
      maxDistance={15.5}
      minPolarAngle={0.08}
      maxPolarAngle={Math.PI / 2.22}
      onStart={() => {
        transitioningRef.current = false;
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Realistic Wooden Board & Interactive Squares
// ---------------------------------------------------------------------------
interface ChessBoardWorldProps {
  game: ChessGame;
  selectedSquare: Square | null;
  legalMoves: Move[];
  kingCheckSq: Square | null;
  lastMove?: Move;
  isTwoPlayer: boolean;
  playerColor: PieceColor;
  quality: QualityLevel;
  onSquareClick: (sq: Square) => void;
  animInfo: {
    key: number;
    move?: Move;
    rookFrom?: Square;
    rookTo?: Square;
  };
  capturedGhosts: CapturedGhost[];
  onGhostDone: (id: number) => void;
}

function ChessBoardWorld({
  game,
  selectedSquare,
  legalMoves,
  kingCheckSq,
  lastMove,
  isTwoPlayer,
  playerColor,
  quality,
  onSquareClick,
  animInfo,
  capturedGhosts,
  onGhostDone,
}: ChessBoardWorldProps) {
  const geometries = useStauntonGeometries();
  const shadowsEnabled = quality !== "low";

  // Procedural Wood & Coordinate Textures (cleaned up on unmount)
  const textures = useMemo(() => {
    const lightWood = createWoodTexture("#F3E1C2", "#D6B78B", "#FFF4E0", 11);
    const darkWood = createWoodTexture("#6E3C1A", "#4A250C", "#8B5129", 27);
    const frameWood = createWoodTexture("#3D1F0D", "#230F05", "#5C3118", 42);
    const filesTex = createCoordinateStripTexture(["a", "b", "c", "d", "e", "f", "g", "h"], true);
    const ranksTex = createCoordinateStripTexture(["8", "7", "6", "5", "4", "3", "2", "1"], false);
    return { lightWood, darkWood, frameWood, filesTex, ranksTex };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(textures).forEach((t) => t.dispose());
    };
  }, [textures]);

  // Shared PBR Piece Materials (Classic Boxwood Ivory & Polished Walnut Ebony)
  const materials = useMemo(() => {
    const whiteMat = new THREE.MeshStandardMaterial({
      color: "#F7EFE2",
      roughness: 0.24,
      metalness: 0.04,
      envMapIntensity: 0.9,
    });
    const whiteSelected = new THREE.MeshStandardMaterial({
      color: "#FFF8EB",
      emissive: "#D97706",
      emissiveIntensity: 0.28,
      roughness: 0.2,
      metalness: 0.08,
    });
    const blackMat = new THREE.MeshStandardMaterial({
      color: "#281E1A",
      roughness: 0.22,
      metalness: 0.14,
      envMapIntensity: 1.15,
    });
    const blackSelected = new THREE.MeshStandardMaterial({
      color: "#3A2C26",
      emissive: "#F59E0B",
      emissiveIntensity: 0.34,
      roughness: 0.18,
      metalness: 0.18,
    });
    const lightSquareMat = new THREE.MeshStandardMaterial({
      map: textures.lightWood,
      roughness: 0.36,
      metalness: 0.02,
    });
    const darkSquareMat = new THREE.MeshStandardMaterial({
      map: textures.darkWood,
      roughness: 0.38,
      metalness: 0.03,
    });
    return { whiteMat, whiteSelected, blackMat, blackSelected, lightSquareMat, darkSquareMat };
  }, [textures]);

  useEffect(() => {
    return () => {
      Object.values(materials).forEach((m) => m.dispose());
    };
  }, [materials]);

  // Collect all active pieces on the board
  const piecesOnBoard = useMemo(() => {
    const list: { piece: ChessPiece; sq: Square; r: number; c: number }[] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = game.board[r][c];
        if (p) {
          list.push({ piece: p, sq: toSquare(r, c), r, c });
        }
      }
    }
    return list;
  }, [game]);

  const legalSet = useMemo(() => new Set(legalMoves.map((m) => m.to)), [legalMoves]);

  return (
    <group>
      {/* Mahogany Sculpted Wooden Base Frame */}
      <mesh position={[0, -0.22, 0]} receiveShadow={shadowsEnabled} castShadow={shadowsEnabled}>
        <boxGeometry args={[9.1, 0.38, 9.1]} />
        <meshStandardMaterial
          map={textures.frameWood}
          roughness={0.34}
          metalness={0.08}
        />
      </mesh>

      {/* Stepped Outer Pedestal Lip */}
      <mesh position={[0, -0.45, 0]} receiveShadow={shadowsEnabled}>
        <boxGeometry args={[9.42, 0.14, 9.42]} />
        <meshStandardMaterial color="#1E0E06" roughness={0.42} metalness={0.12} />
      </mesh>

      {/* Inlaid Brushed Brass Trim Frame around 8x8 Grid (sits cleanly beneath square top at y=0) */}
      <mesh position={[0, -0.042, 0]} receiveShadow={shadowsEnabled}>
        <boxGeometry args={[8.18, 0.056, 8.18]} />
        <meshStandardMaterial color="#C99A3B" roughness={0.28} metalness={0.82} />
      </mesh>

      {/* Coordinate Strips on Mahogany Border (a-h & 1-8) */}
      <mesh position={[0, -0.025, 4.32]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 0.4]} />
        <meshBasicMaterial map={textures.filesTex} transparent opacity={0.92} />
      </mesh>
      <mesh position={[0, -0.025, -4.32]} rotation={[-Math.PI / 2, 0, Math.PI]}>
        <planeGeometry args={[8, 0.4]} />
        <meshBasicMaterial map={textures.filesTex} transparent opacity={0.92} />
      </mesh>
      <mesh position={[-4.32, -0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.4, 8]} />
        <meshBasicMaterial map={textures.ranksTex} transparent opacity={0.92} />
      </mesh>
      <mesh position={[4.32, -0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.4, 8]} />
        <meshBasicMaterial map={textures.ranksTex} transparent opacity={0.92} />
      </mesh>

      {/* Dark Walnut Grout Backing Slab so crisp fine grid lines appear between every square */}
      <mesh position={[0, -0.025, 0]} receiveShadow={shadowsEnabled}>
        <boxGeometry args={[8.02, 0.044, 8.02]} />
        <meshStandardMaterial color="#241106" roughness={0.5} metalness={0.05} />
      </mesh>

      {/* 64 Individual Maple & Walnut Wooden Squares with crisp grid separation lines */}
      {Array.from({ length: 8 }).map((_, r) =>
        Array.from({ length: 8 }).map((__, c) => {
          const sq = toSquare(r, c);
          const [wx, wz] = squareToWorld(r, c);
          const isLight = (r + c) % 2 === 0;
          const isSelected = selectedSquare === sq;
          const isLegal = legalSet.has(sq);
          const hasPiece = Boolean(game.board[r][c]);
          const isCapture = isLegal && hasPiece;
          const isLastFrom = lastMove?.from === sq;
          const isLastTo = lastMove?.to === sq;
          const isCheckSq = kingCheckSq === sq;

          return (
            <group key={sq} position={[wx, 0, wz]}>
              <mesh
                position={[0, -0.02, 0]}
                material={isLight ? materials.lightSquareMat : materials.darkSquareMat}
                receiveShadow={shadowsEnabled}
                onClick={(e: ThreeEvent<MouseEvent>) => {
                  e.stopPropagation();
                  onSquareClick(sq);
                }}
              >
                <boxGeometry args={[0.974, 0.04, 0.974]} />
              </mesh>

              {/* Last Move Warm Amber Tint */}
              {(isLastFrom || isLastTo) && !isSelected && !isCheckSq && (
                <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[0.96, 0.96]} />
                  <meshBasicMaterial color="#FBBF24" transparent opacity={0.34} />
                </mesh>
              )}

              {/* Selected Square Luminous Gold Highlight */}
              {isSelected && (
                <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[0.96, 0.96]} />
                  <meshBasicMaterial color="#F59E0B" transparent opacity={0.58} />
                </mesh>
              )}

              {/* King in Check Crimson Warning */}
              {isCheckSq && (
                <mesh position={[0, 0.007, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[0.96, 0.96]} />
                  <meshBasicMaterial color="#DC2626" transparent opacity={0.72} />
                </mesh>
              )}

              {/* Legal Empty Square Dot Indicator */}
              {isLegal && !isCapture && (
                <mesh
                  position={[0, 0.015, 0]}
                  rotation={[-Math.PI / 2, 0, 0]}
                  onClick={(e: ThreeEvent<MouseEvent>) => {
                    e.stopPropagation();
                    onSquareClick(sq);
                  }}
                >
                  <circleGeometry args={[0.19, 24]} />
                  <meshBasicMaterial color="#10B981" transparent opacity={0.85} />
                </mesh>
              )}

              {/* Legal Capture Ring Indicator */}
              {isCapture && (
                <mesh
                  position={[0, 0.016, 0]}
                  rotation={[-Math.PI / 2, 0, 0]}
                  onClick={(e: ThreeEvent<MouseEvent>) => {
                    e.stopPropagation();
                    onSquareClick(sq);
                  }}
                >
                  <ringGeometry args={[0.34, 0.45, 32]} />
                  <meshBasicMaterial color="#EF4444" transparent opacity={0.9} />
                </mesh>
              )}
            </group>
          );
        })
      )}

      {/* 3D Staunton Chess Pieces */}
      {piecesOnBoard.map(({ piece, sq }) => {
        const isMovable = isTwoPlayer
          ? piece.color === game.turn
          : piece.color === game.turn && piece.color === playerColor;

        let animFrom: Square | null = null;
        if (animInfo.move && animInfo.move.to === sq) {
          animFrom = animInfo.move.from;
        } else if (animInfo.rookTo === sq && animInfo.rookFrom) {
          animFrom = animInfo.rookFrom;
        }

        return (
          <AnimatedStauntonPiece
            key={`${piece.color}-${piece.type}-${sq}`}
            piece={piece}
            square={sq}
            geometries={geometries[piece.type]}
            material={piece.color === "w" ? materials.whiteMat : materials.blackMat}
            selectedMaterial={
              piece.color === "w" ? materials.whiteSelected : materials.blackSelected
            }
            isSelected={selectedSquare === sq}
            isMovable={isMovable}
            castShadow={shadowsEnabled}
            animFrom={animFrom}
            animKey={animInfo.key}
            onClick={onSquareClick}
          />
        );
      })}

      {/* Captured Pieces Ghost Exit Animations */}
      {capturedGhosts.map((ghost) => (
        <CapturedPieceGhost
          key={ghost.id}
          ghost={ghost}
          geometries={geometries[ghost.piece.type]}
          onDone={onGhostDone}
        />
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Main Real 3D Chess Component
// ---------------------------------------------------------------------------
export default function ChessScene3D({
  game,
  onMove,
  playerColor = "w",
  isTwoPlayer = false,
  autoQueen = false,
  flipped = false,
  onToggleFlip,
  disabled = false,
  lockCameraByDefault = true,
  statusBadge = null,
  onFallbackTo2D,
  className = "",
}: ChessScene3DProps) {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>("classic");
  const [presetTrigger, setPresetTrigger] = useState(0);
  const [cameraLocked, setCameraLocked] = useState<boolean>(lockCameraByDefault);
  const [contextLost, setContextLost] = useState(false);

  // Sync camera lock automatically when switching between Vs Computer (locked) & other modes
  useEffect(() => {
    setCameraLocked(lockCameraByDefault);
  }, [lockCameraByDefault]);

  // Auto-detect device capabilities for optimal mobile/weak-device FPS
  const [quality, setQuality] = useState<QualityLevel>("balanced");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isSmall = window.innerWidth < 768;
    const cores = navigator.hardwareConcurrency || 4;
    if (isSmall || cores <= 4) {
      setQuality("balanced");
    } else {
      setQuality("high");
    }
  }, []);

  // Track latest move & captured piece for smooth 3D animations
  const prevHistoryLenRef = useRef(game.moveHistory.length);
  const prevBoardRef = useRef(game.board.map((row) => row.map((p) => (p ? { ...p } : null))));
  const [animInfo, setAnimInfo] = useState<{
    key: number;
    move?: Move;
    rookFrom?: Square;
    rookTo?: Square;
  }>({ key: 0 });
  const [capturedGhosts, setCapturedGhosts] = useState<CapturedGhost[]>([]);
  const ghostIdRef = useRef(1);

  useEffect(() => {
    const newLen = game.moveHistory.length;
    if (newLen === prevHistoryLenRef.current + 1) {
      const last = game.moveHistory[newLen - 1];
      let rookFrom: Square | undefined;
      let rookTo: Square | undefined;

      // Detect castling rook slide for simultaneous animation
      const f = parseSquare(last.from);
      const t = parseSquare(last.to);
      const movedPiece = game.board[t.r][t.c];
      if (movedPiece?.type === "k" && Math.abs(t.c - f.c) === 2) {
        if (t.c === 6) {
          rookFrom = toSquare(f.r, 7);
          rookTo = toSquare(f.r, 5);
        } else if (t.c === 2) {
          rookFrom = toSquare(f.r, 0);
          rookTo = toSquare(f.r, 3);
        }
      }

      // Detect captured piece (direct or en passant) from previous board snapshot
      const prevPieceAtDest = prevBoardRef.current[t.r]?.[t.c];
      if (prevPieceAtDest) {
        setCapturedGhosts((prev) => [
          ...prev,
          { id: ghostIdRef.current++, piece: prevPieceAtDest, square: last.to },
        ]);
      } else if (last.isEnPassant) {
        const epSq = toSquare(f.r, t.c);
        const epPiece = prevBoardRef.current[f.r]?.[t.c];
        if (epPiece) {
          setCapturedGhosts((prev) => [
            ...prev,
            { id: ghostIdRef.current++, piece: epPiece, square: epSq },
          ]);
        }
      }

      setAnimInfo({
        key: Date.now() + newLen,
        move: last,
        rookFrom,
        rookTo,
      });
    } else if (newLen !== prevHistoryLenRef.current) {
      // Reset / Undo
      setAnimInfo({ key: Date.now() });
      setCapturedGhosts([]);
    }

    prevHistoryLenRef.current = newLen;
    prevBoardRef.current = game.board.map((row) => row.map((p) => (p ? { ...p } : null)));
  }, [game]);

  // Clear selection when turn changes
  useEffect(() => {
    setSelectedSquare(null);
    setLegalMoves([]);
  }, [game.turn, game.fullMoves, game.moveHistory.length]);

  const handleSquareClick = (sq: Square) => {
    if (disabled || pendingPromotion) return;

    const piece = game.getPiece(sq);
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

  // Camera side: flips when player plays black or manually flipped
  const viewAsBlack = isTwoPlayer ? flipped : (playerColor === "b") !== flipped;

  const dpr: [number, number] =
    quality === "high" ? [1, 2] : quality === "balanced" ? [1, 1.35] : [0.8, 1];

  const shadowMapSize = quality === "high" ? 1024 : 512;

  return (
    <div className={`relative w-full flex flex-col items-center select-none ${className}`}>
      {/* Top Camera & Quality Control Strip */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 px-3 py-2 mb-2.5 rounded-2xl bg-[#1D1639]/90 border border-[#C6923B]/40 shadow-md text-[11px]">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-amber-300 font-black flex items-center gap-1 ml-1">
            <Eye className="w-3.5 h-3.5" />
            <span>الزاوية:</span>
          </span>
          {(
            [
              { id: "classic" as CameraPreset, label: "3D كلاسيكي" },
              { id: "top" as CameraPreset, label: "علوي" },
              { id: "low" as CameraPreset, label: "منخفض" },
              { id: "side" as CameraPreset, label: "جانبي" },
            ]
          ).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setCameraPreset(p.id);
                setPresetTrigger((n) => n + 1);
              }}
              className={`px-2 py-1 rounded-lg font-bold transition-all ${
                cameraPreset === p.id
                  ? "bg-amber-400 text-slate-950 shadow"
                  : "bg-white/10 text-slate-200 hover:bg-white/20"
              }`}
            >
              {p.label}
            </button>
          ))}
          {onToggleFlip && (
            <button
              type="button"
              onClick={onToggleFlip}
              className="px-2 py-1 rounded-lg bg-white/10 hover:bg-amber-400/20 text-amber-200 font-bold flex items-center gap-1 transition-all"
              title="قلب الرقعة 180 درجة"
            >
              <FlipVertical2 className="w-3.5 h-3.5" />
              <span>قلب</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setCameraLocked((l) => !l)}
            className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
              cameraLocked
                ? "bg-indigo-500/80 text-white border border-indigo-300/60"
                : "bg-white/10 text-amber-200 hover:bg-white/20"
            }`}
            title={cameraLocked ? "الرقعة ثابتة بمكانها — اضغط للتدوير الحر" : "تدوير حر — اضغط لتثبيت الرقعة"}
          >
            {cameraLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{cameraLocked ? "ثابتة" : "تدوير حر"}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setCameraPreset("classic");
              setPresetTrigger((n) => n + 1);
            }}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-all"
            title="إعادة ضبط الكاميرا"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Performance / Quality Switcher for Phones & Weak Devices */}
        <div className="flex items-center gap-1">
          <Cpu className="w-3.5 h-3.5 text-emerald-300" />
          {(
            [
              { id: "low" as QualityLevel, label: "خفيف" },
              { id: "balanced" as QualityLevel, label: "متوازن" },
              { id: "high" as QualityLevel, label: "فائق" },
            ]
          ).map((q) => (
            <button
              key={q.id}
              type="button"
              onClick={() => setQuality(q.id)}
              className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                quality === q.id
                  ? "bg-emerald-500 text-slate-950"
                  : "bg-white/5 text-slate-300 hover:bg-white/15"
              }`}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Real 3D WebGL Canvas Container */}
      <div className="relative w-full h-[390px] sm:h-[490px] lg:h-[530px] rounded-[28px] overflow-hidden border-2 border-[#C6923B]/80 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.85)] bg-[radial-gradient(ellipse_at_top,#2B2054_0%,#150F2E_58%,#0A0717_100%)]">
        {contextLost ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="text-3xl">⚠️</div>
            <p className="text-sm font-black text-amber-300">
              تم إيقاف سياق الرسوميات مؤقتاً لتوفير طاقة الجهاز
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setContextLost(false)}
                className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-black text-xs"
              >
                إعادة تشغيل 3D
              </button>
              {onFallbackTo2D && (
                <button
                  type="button"
                  onClick={onFallbackTo2D}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white font-bold text-xs"
                >
                  التبديل لوضع 2D
                </button>
              )}
            </div>
          </div>
        ) : (
          <WebGLErrorBoundary onFallback={onFallbackTo2D}>
            <Canvas
              shadows={quality !== "low"}
              dpr={dpr}
              camera={{ position: [0, 8.6, 9.8], fov: 40, near: 0.1, far: 60 }}
              gl={{
                antialias: quality !== "low",
                powerPreference: quality === "low" ? "low-power" : "high-performance",
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.08,
              }}
              onCreated={({ gl }) => {
                gl.domElement.addEventListener("webglcontextlost", (e) => {
                  e.preventDefault();
                  setContextLost(true);
                });
              }}
            >
              {/* Natural Warm Studio Lighting */}
              <ambientLight intensity={0.42} color="#FFF7EA" />
              <hemisphereLight args={["#FFF5E4", "#2E1C14", 0.55]} />

              {/* Main Key Sun/Studio Directional Light with Soft Shadows */}
              <directionalLight
                position={[6.5, 11.5, 6.5]}
                intensity={1.75}
                color="#FFF6E6"
                castShadow={quality !== "low"}
                shadow-mapSize-width={shadowMapSize}
                shadow-mapSize-height={shadowMapSize}
                shadow-camera-near={2}
                shadow-camera-far={28}
                shadow-camera-left={-6.5}
                shadow-camera-right={6.5}
                shadow-camera-top={6.5}
                shadow-camera-bottom={-6.5}
                shadow-bias={-0.0005}
              />

              {/* Cool Rim / Fill Light to Sculpt Ebony & Ivory Contours */}
              <directionalLight position={[-7, 6, -6]} intensity={0.75} color="#C7DBFF" />
              <pointLight position={[0, 7, 0]} intensity={0.3} color="#FFE8C2" />

              {/* Offline Procedural Studio Environment (Zero external HDR downloads!) */}
              <Environment resolution={quality === "high" ? 256 : 128}>
                <Lightformer
                  form="rect"
                  intensity={2.2}
                  color="#FFF4E0"
                  position={[0, 8, 4]}
                  rotation={[Math.PI / 2.4, 0, 0]}
                  scale={[10, 6, 1]}
                />
                <Lightformer
                  form="circle"
                  intensity={1.4}
                  color="#D8E6FF"
                  position={[-7, 5, -5]}
                  scale={5}
                />
                <Lightformer
                  form="ring"
                  intensity={1.1}
                  color="#FFE0A6"
                  position={[7, 4, -3]}
                  scale={4}
                />
              </Environment>

              <Suspense fallback={null}>
                <ChessBoardWorld
                  game={game}
                  selectedSquare={selectedSquare}
                  legalMoves={legalMoves}
                  kingCheckSq={kingCheckSq}
                  lastMove={lastMove}
                  isTwoPlayer={isTwoPlayer}
                  playerColor={playerColor}
                  quality={quality}
                  onSquareClick={handleSquareClick}
                  animInfo={animInfo}
                  capturedGhosts={capturedGhosts}
                  onGhostDone={(id) =>
                    setCapturedGhosts((prev) => prev.filter((g) => g.id !== id))
                  }
                />
                {quality === "high" && (
                  <ContactShadows
                    position={[0, -0.52, 0]}
                    opacity={0.55}
                    scale={16}
                    blur={2.2}
                    far={4}
                    color="#07040F"
                  />
                )}
              </Suspense>

              <CameraRig
                preset={cameraPreset}
                presetTrigger={presetTrigger}
                viewAsBlack={viewAsBlack}
                locked={cameraLocked}
              />
            </Canvas>
          </WebGLErrorBoundary>
        )}

        {/* Floating Non-Shifting Status Pill (e.g. AI Thinking — zero board jump!) */}
        {statusBadge && (
          <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-full bg-[#1B143B]/90 backdrop-blur-md border border-amber-400/50 text-xs font-black text-amber-200 shadow-lg animate-pulse">
            {statusBadge}
          </div>
        )}

        {/* Subtle Interactive Hint Pill */}
        <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-bold text-amber-200/80">
          <span className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
            <Compass className="w-3 h-3 text-amber-400" />
            <span>
              {cameraLocked
                ? "الرقعة ثابتة • انقر على القطع للتحريك (اضغط «ثابتة» لتفعيل التدوير الحر)"
                : "اسحب لتدوير الرقعة • مرّر للتقريب • انقر لتحريك القطع"}
            </span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-emerald-300">
            <Sparkles className="w-3 h-3" />
            <span>Staunton 3D (CC0)</span>
          </span>
        </div>

        {/* Pawn Promotion Modal Overlay */}
        {pendingPromotion && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="p-5 rounded-3xl bg-[#1C163B] border-2 border-amber-400 text-center space-y-3 shadow-2xl">
              <h4 className="text-sm font-black text-amber-300">
                ترقية البيدق! اختر القطعة الملكية:
              </h4>
              <div className="flex items-center gap-2.5 justify-center">
                {(
                  [
                    { type: "q" as PieceType, label: "وزير ♛" },
                    { type: "r" as PieceType, label: "قلعة ♜" },
                    { type: "b" as PieceType, label: "فيل ♝" },
                    { type: "n" as PieceType, label: "حصان ♞" },
                  ]
                ).map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => handleChoosePromotion(item.type)}
                    className="px-3.5 py-3 rounded-2xl bg-white/10 hover:bg-amber-400 hover:text-slate-950 border border-amber-400/50 text-xs font-black text-white transition-all active:scale-95 shadow-md"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Captured Pieces Compact Summary Bar */}
      <div className="w-full grid grid-cols-2 gap-2 mt-2.5">
        <div className="px-3 py-1.5 rounded-xl bg-[#201915]/90 border border-[#8B5E34]/40 text-[11px] flex items-center justify-between">
          <span className="text-[#E6C687] font-bold">الأسرى (الأسود):</span>
          <span className="text-sm tracking-wide text-slate-200 truncate">
            {game.capturedPieces.b.length === 0
              ? "—"
              : game.capturedPieces.b
                  .map((p) => ({ p: "♟", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚" }[p.type]))
                  .join("")}
          </span>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-[#201915]/90 border border-[#8B5E34]/40 text-[11px] flex items-center justify-between">
          <span className="text-[#E6C687] font-bold">الأسرى (الأبيض):</span>
          <span className="text-sm tracking-wide text-amber-100 truncate">
            {game.capturedPieces.w.length === 0
              ? "—"
              : game.capturedPieces.w
                  .map((p) => ({ p: "♙", r: "♖", n: "♘", b: "♗", q: "♕", k: "♔" }[p.type]))
                  .join("")}
          </span>
        </div>
      </div>
    </div>
  );
}
