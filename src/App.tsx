/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, RotateCcw, Download, Settings, ChevronRight,
  Type, Zap, Sparkles, Film, Copy, Check,
  AlignLeft, AlignCenter, AlignRight, Plus, Trash2, GripVertical
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type AnimStyle =
  | 'typewriter'
  | 'fadeUp'
  | 'fadeIn'
  | 'slideRight'
  | 'popIn'
  | 'wave'
  | 'glitch'
  | 'spotlight'
  | 'flip'
  | 'blur'
  | 'bounce'
  | 'neon';

type TextAlign = 'left' | 'center' | 'right';
type DisplayUnit = 'char' | 'word' | 'line';

interface Segment {
  id: string;
  text: string;
  style: AnimStyle;
  color: string;
  fontSize: number;
  fontWeight: '400' | '600' | '700' | '900';
  align: TextAlign;
  displayUnit: DisplayUnit;
  speed: number; // ms per unit
  delay: number; // initial delay ms
  bg: string;
  letterSpacing: number;
  lineHeight: number;
}

interface AnimDef {
  label: string;
  icon: string;
  description: string;
  category: 'basic' | 'dynamic' | 'special';
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ANIM_DEFS: Record<AnimStyle, AnimDef> = {
  typewriter:  { label: '打字机',   icon: '⌨️', description: '逐字出现，附带光标',     category: 'basic' },
  fadeUp:      { label: '上浮淡入', icon: '⬆️', description: '文字从下方浮起',         category: 'basic' },
  fadeIn:      { label: '淡入',     icon: '✨', description: '柔和透明度渐变',         category: 'basic' },
  slideRight:  { label: '滑入',     icon: '➡️', description: '从左侧滑入',             category: 'basic' },
  popIn:       { label: '弹出',     icon: '💥', description: '弹性缩放出现',           category: 'dynamic' },
  wave:        { label: '波浪',     icon: '🌊', description: '文字依次波浪起伏',       category: 'dynamic' },
  glitch:      { label: '故障',     icon: '📺', description: '赛博朋克故障效果',       category: 'special' },
  spotlight:   { label: '聚光灯',   icon: '🔦', description: '光从左扫过文字',         category: 'special' },
  flip:        { label: '翻转',     icon: '🔄', description: '3D翻转入场',             category: 'dynamic' },
  blur:        { label: '模糊',     icon: '🌫️', description: '从虚到实对焦',           category: 'basic' },
  bounce:      { label: '弹跳',     icon: '🏀', description: '文字弹跳落下',           category: 'dynamic' },
  neon:        { label: '霓虹',     icon: '💡', description: '霓虹灯逐渐点亮',         category: 'special' },
};

const PRESETS: Array<{ name: string; icon: string; segments: Partial<Segment>[] }> = [
  {
    name: '短视频爆款', icon: '🔥',
    segments: [
      { text: '你知道吗？', style: 'popIn',      color: '#FACC15', fontSize: 52, fontWeight: '900', align: 'center', speed: 80,  bg: 'transparent' },
      { text: '这个技巧改变了我的生活', style: 'fadeUp', color: '#FFFFFF', fontSize: 40, fontWeight: '700', align: 'center', speed: 60,  bg: 'transparent' },
      { text: '↓ 学会这一招 ↓', style: 'wave',   color: '#34D399', fontSize: 32, fontWeight: '600', align: 'center', speed: 100, bg: 'transparent' },
    ]
  },
  {
    name: '情感金句', icon: '💬',
    segments: [
      { text: '有些话', style: 'fadeIn',  color: '#E2E8F0', fontSize: 36, fontWeight: '400', align: 'center', speed: 120, bg: 'transparent' },
      { text: '只适合藏在心里', style: 'blur',   color: '#F472B6', fontSize: 44, fontWeight: '700', align: 'center', speed: 80,  bg: 'transparent' },
      { text: '默默地，爱着。', style: 'fadeUp', color: '#C4B5FD', fontSize: 32, fontWeight: '400', align: 'center', speed: 100, bg: 'transparent' },
    ]
  },
  {
    name: '科技感', icon: '🤖',
    segments: [
      { text: 'LOADING...', style: 'typewriter', color: '#22D3EE', fontSize: 32, fontWeight: '600', align: 'left',   speed: 60,  bg: 'transparent' },
      { text: 'AI 时代已经来临', style: 'glitch',    color: '#00FF88', fontSize: 48, fontWeight: '900', align: 'center', speed: 80,  bg: 'transparent' },
      { text: '你准备好了吗？', style: 'neon',     color: '#FF6B6B', fontSize: 36, fontWeight: '700', align: 'center', speed: 100, bg: 'transparent' },
    ]
  },
  {
    name: '新闻播报', icon: '📰',
    segments: [
      { text: '【重磅】', style: 'slideRight', color: '#EF4444', fontSize: 28, fontWeight: '700', align: 'left', speed: 60, bg: 'transparent' },
      { text: '突发！重大消息来了', style: 'fadeUp',    color: '#F8FAFC', fontSize: 42, fontWeight: '700', align: 'left', speed: 70, bg: 'transparent' },
      { text: '点击查看详情 →', style: 'bounce',     color: '#94A3B8', fontSize: 24, fontWeight: '400', align: 'left', speed: 80, bg: 'transparent' },
    ]
  },
];

const BG_PRESETS = [
  { name: '纯黑',     value: '#000000' },
  { name: '深夜蓝',   value: '#0F172A' },
  { name: '炭灰',     value: '#1A1A2E' },
  { name: '深紫',     value: '#1E0A3C' },
  { name: '纯白',     value: '#FFFFFF' },
  { name: '暖白',     value: '#FFF8F0' },
];

const COLOR_PRESETS = [
  '#FFFFFF','#FACC15','#34D399','#60A5FA','#F472B6',
  '#FB923C','#A78BFA','#22D3EE','#F87171','#000000',
];

const FONT_SIZES = [24, 28, 32, 36, 40, 44, 48, 52, 60, 72];

function genId() { return Math.random().toString(36).slice(2); }

function makeSegment(overrides: Partial<Segment> = {}): Segment {
  return {
    id: genId(),
    text: '在这里输入文字',
    style: 'fadeUp',
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '700',
    align: 'center',
    displayUnit: 'char',
    speed: 80,
    delay: 0,
    bg: 'transparent',
    letterSpacing: 2,
    lineHeight: 1.4,
    ...overrides,
  };
}

// ─── Per-unit animation: returns [initial, animate] props ────────────────────

type MotionProps = {
  initial: Record<string, unknown>;
  animate: Record<string, unknown> | string;
};

function getUnitMotion(style: AnimStyle, index: number, speed: number, playing: boolean): MotionProps {
  const d = index * (speed / 1000);
  if (!playing) {
    return { initial: { opacity: 0 }, animate: { opacity: 0 } };
  }
  switch (style) {
    case 'typewriter':
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { delay: d, duration: 0.01 } },
      };
    case 'fadeUp':
      return {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0, transition: { delay: d, duration: 0.45, ease: 'easeOut' } },
      };
    case 'fadeIn':
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { delay: d, duration: 0.5 } },
      };
    case 'slideRight':
      return {
        initial: { opacity: 0, x: -32 },
        animate: { opacity: 1, x: 0, transition: { delay: d, duration: 0.4, ease: 'easeOut' } },
      };
    case 'popIn':
      return {
        initial: { opacity: 0, scale: 0.3 },
        animate: { opacity: 1, scale: 1, transition: { delay: d, type: 'spring', stiffness: 400, damping: 20 } },
      };
    case 'wave':
      return {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0, transition: { delay: d, duration: 0.5, ease: 'easeOut' } },
      };
    case 'glitch':
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { delay: d, duration: 0.25, ease: 'easeOut' } },
      };
    case 'spotlight':
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { delay: d, duration: 0.35 } },
      };
    case 'flip':
      return {
        initial: { opacity: 0, rotateX: -90 },
        animate: { opacity: 1, rotateX: 0, transition: { delay: d, duration: 0.5, ease: 'easeOut' } },
      };
    case 'blur':
      return {
        initial: { opacity: 0, filter: 'blur(14px)' },
        animate: { opacity: 1, filter: 'blur(0px)', transition: { delay: d, duration: 0.6 } },
      };
    case 'bounce':
      return {
        initial: { opacity: 0, y: -60 },
        animate: { opacity: 1, y: 0, transition: { delay: d, type: 'spring', stiffness: 300, damping: 12 } },
      };
    case 'neon':
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { delay: d, duration: 0.4 } },
      };
    default:
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { delay: d, duration: 0.4 } },
      };
  }
}

// ─── AnimatedText Component ───────────────────────────────────────────────────

interface AnimatedTextProps {
  segment: Segment;
  playing: boolean;
  onFinish?: () => void;
}

function AnimatedText({ segment, playing, onFinish }: AnimatedTextProps) {
  const { text, style, color, fontSize, fontWeight, align, displayUnit, speed, letterSpacing, lineHeight } = segment;

  const units: string[] = displayUnit === 'char'
    ? text.split('')
    : displayUnit === 'word'
      ? text.split(/(\s+)/)
      : text.split('\n');

  const [key, setKey] = useState(0);

  useEffect(() => {
    if (playing) setKey(k => k + 1);
  }, [playing]);

  const totalDuration = units.length * speed;

  useEffect(() => {
    if (!playing || !onFinish) return;
    const timer = setTimeout(onFinish, totalDuration + 600);
    return () => clearTimeout(timer);
  }, [playing, key, totalDuration, onFinish]);

  const textAlign = align as React.CSSProperties['textAlign'];
  const neonShadow = `0 0 6px ${color}, 0 0 18px ${color}, 0 0 40px ${color}`;

  return (
    <div style={{ textAlign, fontSize, fontWeight, lineHeight, letterSpacing, perspective: 800, width: '100%', padding: '0 24px', wordBreak: 'break-all' }}>
      {style === 'typewriter' ? (
        <span style={{ color, display: 'inline-block', position: 'relative' }}>
          {units.map((unit, i) => {
            const m = getUnitMotion(style, i, speed, playing);
            return (
              <motion.span
                key={`${key}-${i}`}
                style={{ display: 'inline-block', overflow: 'hidden', whiteSpace: 'pre' }}
                initial={m.initial as any}
                animate={m.animate as any}
              >{unit}</motion.span>
            );
          })}
          {playing && (
            <motion.span
              style={{ display: 'inline-block', color, marginLeft: 2 }}
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            >|</motion.span>
          )}
        </span>
      ) : style === 'spotlight' ? (
        <span style={{ display: 'block' }}>
          {units.map((unit, i) => {
            const m = getUnitMotion(style, i, speed, playing);
            return (
              <motion.span
                key={`${key}-${i}`}
                style={{ display: 'inline-block', whiteSpace: 'pre', color }}
                initial={m.initial as any}
                animate={m.animate as any}
              >{unit === ' ' ? '\u00A0' : unit}</motion.span>
            );
          })}
        </span>
      ) : style === 'neon' ? (
        <span style={{ display: 'block' }}>
          {units.map((unit, i) => {
            const d = i * (speed / 1000);
            return (
              <motion.span
                key={`${key}-${i}`}
                style={{ display: 'inline-block', color, whiteSpace: 'pre' }}
                initial={{ opacity: 0 }}
                animate={playing ? { opacity: 1, textShadow: neonShadow } : { opacity: 0 }}
                transition={{ delay: d, duration: 0.4 }}
              >{unit === ' ' ? '\u00A0' : unit}</motion.span>
            );
          })}
        </span>
      ) : style === 'glitch' ? (
        <span style={{ display: 'block', position: 'relative' }}>
          {units.map((unit, i) => {
            const d = i * (speed / 1000);
            return (
              <motion.span
                key={`${key}-${i}`}
                style={{ display: 'inline-block', color, whiteSpace: 'pre', position: 'relative' }}
                initial={{ opacity: 0 }}
                animate={playing ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: d, duration: 0.25 }}
              >
                <span style={{ position: 'relative', zIndex: 1 }}>{unit === ' ' ? '\u00A0' : unit}</span>
                <motion.span
                  style={{ position: 'absolute', left: 0, top: 0, color: '#0ff', clipPath: 'inset(20% 0 60% 0)', zIndex: 2 }}
                  animate={playing ? { x: [-2, 2, -2, 0], opacity: [0, 0.9, 0.7, 0] } : { opacity: 0 }}
                  transition={{ delay: d + 0.05, duration: 0.2, repeat: 1 }}
                >{unit === ' ' ? '\u00A0' : unit}</motion.span>
                <motion.span
                  style={{ position: 'absolute', left: 0, top: 0, color: '#f0f', clipPath: 'inset(60% 0 10% 0)', zIndex: 2 }}
                  animate={playing ? { x: [2, -2, 2, 0], opacity: [0, 0.9, 0.7, 0] } : { opacity: 0 }}
                  transition={{ delay: d + 0.1, duration: 0.2, repeat: 1 }}
                >{unit === ' ' ? '\u00A0' : unit}</motion.span>
              </motion.span>
            );
          })}
        </span>
      ) : (
        <span style={{ display: 'block' }}>
          {units.map((unit, i) => {
            const m = getUnitMotion(style, i, speed, playing);
            return (
              <motion.span
                key={`${key}-${i}`}
                style={{ display: 'inline-block', color, whiteSpace: 'pre' }}
                initial={m.initial as any}
                animate={m.animate as any}
              >{unit === ' ' ? '\u00A0' : unit}</motion.span>
            );
          })}
        </span>
      )}
    </div>
  );
}

// ─── Preview Canvas ───────────────────────────────────────────────────────────

interface PreviewProps {
  segments: Segment[];
  bgColor: string;
  playing: boolean;
  currentIdx: number;
  onSegmentEnd: () => void;
  ratio: '9:16' | '16:9' | '1:1';
}

function PreviewCanvas({ segments, bgColor, playing, currentIdx, onSegmentEnd, ratio }: PreviewProps) {
  const ratioStyle: Record<string, React.CSSProperties> = {
    '9:16': { width: '100%', aspectRatio: '9/16', maxWidth: 320 },
    '16:9': { width: '100%', aspectRatio: '16/9', maxWidth: 640 },
    '1:1':  { width: '100%', aspectRatio: '1/1',  maxWidth: 420 },
  };

  const seg = segments[currentIdx];

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
      <div
        style={{
          ...ratioStyle[ratio],
          background: bgColor,
          borderRadius: 16,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        {/* bg segments individual */}
        {segments.map((s, i) => s.bg !== 'transparent' && i === currentIdx && (
          <div key={s.id} style={{ position: 'absolute', inset: 0, background: s.bg, zIndex: 0 }} />
        ))}

        <AnimatePresence mode="wait">
          {seg && (
            <motion.div
              key={seg.id + currentIdx}
              style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
            >
              <AnimatedText
                segment={seg}
                playing={playing}
                onFinish={onSegmentEnd}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* watermark */}
        <div style={{
          position: 'absolute', bottom: 12, right: 14,
          fontSize: 11, color: 'rgba(255,255,255,0.2)',
          fontFamily: 'monospace', letterSpacing: 1,
          zIndex: 10,
        }}>口播动画</div>
      </div>
    </div>
  );
}

// ─── Segment Editor Row ───────────────────────────────────────────────────────

interface SegRowProps {
  seg: Segment;
  index: number;
  active: boolean;
  onSelect: () => void;
  onChange: (updated: Partial<Segment>) => void;
  onDelete: () => void;
}

function SegRow({ seg, index, active, onSelect, onDelete }: SegRowProps) {
  return (
    <div
      onClick={onSelect}
      style={{
        borderRadius: 12,
        border: active ? '1.5px solid #6366F1' : '1.5px solid rgba(255,255,255,0.08)',
        background: active ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.03)',
        padding: '12px 14px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ color: 'rgba(255,255,255,0.3)', cursor: 'grab' }}><GripVertical size={14} /></div>
        <div style={{
          width: 22, height: 22, borderRadius: 6,
          background: 'rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, flexShrink: 0,
        }}>{index + 1}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13, color: '#F1F5F9', fontWeight: 600,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{seg.text || '（空）'}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
            {ANIM_DEFS[seg.style].icon} {ANIM_DEFS[seg.style].label} · {seg.fontSize}px · {seg.speed}ms/字
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 12, height: 12, borderRadius: '50%',
            background: seg.color, border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0,
          }} />
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.2)', padding: 2, borderRadius: 4,
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [segments, setSegments] = useState<Segment[]>([
    makeSegment({ text: '你有没有想过', style: 'fadeUp', color: '#FFFFFF', fontSize: 44, fontWeight: '700', speed: 70 }),
    makeSegment({ text: '一句话', style: 'popIn',  color: '#FACC15', fontSize: 60, fontWeight: '900', speed: 60 }),
    makeSegment({ text: '能改变一个人的命运？', style: 'wave', color: '#34D399', fontSize: 36, fontWeight: '600', speed: 80 }),
  ]);
  const [activeId, setActiveId] = useState<string>(segments[0]?.id ?? '');
  const [bgColor, setBgColor] = useState('#0F172A');
  const [ratio, setRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [playing, setPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'style' | 'text' | 'anim'>('text');
  const [showPresetPanel, setShowPresetPanel] = useState(false);

  const activeSeg = segments.find(s => s.id === activeId);
  const activeIndex = segments.findIndex(s => s.id === activeId);

  const updateSeg = useCallback((id: string, changes: Partial<Segment>) => {
    setSegments(prev => prev.map(s => s.id === id ? { ...s, ...changes } : s));
  }, []);

  const addSegment = () => {
    const newSeg = makeSegment({ text: '新的一行文字', style: 'fadeUp' });
    setSegments(prev => [...prev, newSeg]);
    setActiveId(newSeg.id);
  };

  const deleteSegment = (id: string) => {
    setSegments(prev => {
      const next = prev.filter(s => s.id !== id);
      if (next.length === 0) return prev;
      return next;
    });
    setActiveId(() => {
      const remaining = segments.filter(s => s.id !== id);
      return remaining[0]?.id ?? '';
    });
  };

  const handlePlay = () => {
    if (playing) {
      setPlaying(false);
    } else {
      setCurrentIdx(0);
      setPlaying(true);
    }
  };

  const handleReset = () => {
    setPlaying(false);
    setCurrentIdx(0);
  };

  const handleSegmentEnd = useCallback(() => {
    setCurrentIdx(prev => {
      if (prev < segments.length - 1) return prev + 1;
      setPlaying(false);
      return prev;
    });
  }, [segments.length]);

  const applyPreset = (preset: typeof PRESETS[0]) => {
    const newSegs = preset.segments.map(s => makeSegment(s));
    setSegments(newSegs);
    setActiveId(newSegs[0]?.id ?? '');
    setShowPresetPanel(false);
  };

  const handleCopyInfo = () => {
    const info = segments.map((s, i) => `${i + 1}. ${s.text} [${ANIM_DEFS[s.style].label}]`).join('\n');
    navigator.clipboard.writeText(info).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0F',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'PingFang SC', 'Microsoft YaHei', 'Segoe UI', sans-serif",
      color: '#F1F5F9',
      overflow: 'hidden',
    }}>

      {/* ── Top Bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 56,
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(10,10,20,0.9)', backdropFilter: 'blur(12px)',
        zIndex: 100, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg, #6366F1, #A855F7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Film size={15} color="white" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: 0.5 }}>口播文字动画生成器</span>
          <span style={{
            fontSize: 10, padding: '2px 7px', borderRadius: 20,
            background: 'linear-gradient(135deg,#6366F1,#A855F7)',
            color: 'white', fontWeight: 600, letterSpacing: 0.5,
          }}>PRO</span>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => setShowPresetPanel(v => !v)}
            style={{
              background: showPresetPanel ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: showPresetPanel ? '#818CF8' : '#94A3B8',
              borderRadius: 8, padding: '6px 14px',
              fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <Sparkles size={13} /> 预设模板
          </button>
          <button
            onClick={handleCopyInfo}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#94A3B8', borderRadius: 8, padding: '6px 14px',
              fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {copied ? <><Check size={13} /> 已复制</> : <><Copy size={13} /> 复制配置</>}
          </button>
          <button
            style={{
              background: 'linear-gradient(135deg,#6366F1,#A855F7)',
              border: 'none', color: 'white', borderRadius: 8, padding: '6px 16px',
              fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              fontWeight: 600,
            }}
          >
            <Download size={13} /> 导出
          </button>
        </div>
      </div>

      {/* ── Preset Panel ── */}
      <AnimatePresence>
        {showPresetPanel && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              overflow: 'hidden', borderBottom: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(15,15,30,0.95)', flexShrink: 0, zIndex: 90,
            }}
          >
            <div style={{ padding: '16px 24px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 12, color: '#64748B', width: '100%', marginBottom: 4, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                选择预设模板快速开始
              </div>
              {PRESETS.map(p => (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p)}
                  style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#E2E8F0', borderRadius: 10, padding: '10px 18px',
                    fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(99,102,241,0.15)';
                    e.currentTarget.style.borderColor = '#6366F1';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  }}
                >
                  <span style={{ fontSize: 18 }}>{p.icon}</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>{p.segments.length} 段文字</div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Layout ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* ── Left: Segment List ── */}
        <div style={{
          width: 260, flexShrink: 0,
          borderRight: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', flexDirection: 'column',
          background: 'rgba(10,10,20,0.6)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '14px 16px 10px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              文字段落 ({segments.length})
            </span>
            <button
              onClick={addSegment}
              style={{
                background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                color: '#818CF8', borderRadius: 6, padding: '4px 10px',
                fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <Plus size={12} /> 添加
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {segments.map((s, i) => (
              <SegRow
                key={s.id}
                seg={s}
                index={i}
                active={s.id === activeId}
                onSelect={() => { setActiveId(s.id); setCurrentIdx(i); }}
                onChange={changes => updateSeg(s.id, changes)}
                onDelete={() => deleteSegment(s.id)}
              />
            ))}
          </div>

          {/* Playback controls */}
          <div style={{
            padding: '14px 16px',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handlePlay}
                style={{
                  flex: 1, background: playing
                    ? 'rgba(239,68,68,0.15)'
                    : 'linear-gradient(135deg,#6366F1,#A855F7)',
                  border: playing ? '1px solid rgba(239,68,68,0.4)' : 'none',
                  color: 'white', borderRadius: 10, padding: '10px',
                  fontSize: 13, cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 600,
                }}
              >
                {playing ? <><Pause size={14} /> 暂停</> : <><Play size={14} /> 播放</>}
              </button>
              <button
                onClick={handleReset}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94A3B8', borderRadius: 10, padding: '10px 14px',
                  fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                <RotateCcw size={14} />
              </button>
            </div>

            {/* Progress */}
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {segments.map((s, i) => (
                <div
                  key={s.id}
                  onClick={() => { setCurrentIdx(i); setActiveId(s.id); }}
                  style={{
                    flex: 1, height: 4, borderRadius: 2, cursor: 'pointer',
                    background: i === currentIdx
                      ? '#6366F1'
                      : i < currentIdx
                        ? 'rgba(99,102,241,0.4)'
                        : 'rgba(255,255,255,0.1)',
                    transition: 'all 0.3s',
                  }}
                />
              ))}
            </div>
            <div style={{ fontSize: 11, color: '#475569', textAlign: 'center' }}>
              {currentIdx + 1} / {segments.length}
            </div>
          </div>
        </div>

        {/* ── Center: Preview ── */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.04) 0%, transparent 70%)',
          padding: 32, gap: 20, overflow: 'auto',
        }}>

          {/* Ratio selector */}
          <div style={{ display: 'flex', gap: 6 }}>
            {(['9:16', '1:1', '16:9'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRatio(r)}
                style={{
                  background: ratio === r ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                  border: ratio === r ? '1px solid #6366F1' : '1px solid rgba(255,255,255,0.1)',
                  color: ratio === r ? '#818CF8' : '#64748B',
                  borderRadius: 8, padding: '5px 14px', fontSize: 12, cursor: 'pointer',
                  fontWeight: ratio === r ? 600 : 400,
                }}
              >{r}</button>
            ))}
          </div>

          <div style={{ width: '100%', maxWidth: ratio === '16:9' ? 640 : ratio === '1:1' ? 420 : 320 }}>
            <PreviewCanvas
              segments={segments}
              bgColor={bgColor}
              playing={playing}
              currentIdx={currentIdx}
              onSegmentEnd={handleSegmentEnd}
              ratio={ratio}
            />
          </div>

          {/* Quick tips */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              '💡 点击段落可单独预览',
              '⚡ 速度越小出现越快',
              '🎨 每段可设置不同动画',
            ].map(tip => (
              <div key={tip} style={{
                fontSize: 11, color: '#475569', padding: '4px 10px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 20,
              }}>{tip}</div>
            ))}
          </div>
        </div>

        {/* ── Right: Editor Panel ── */}
        {activeSeg && (
          <div style={{
            width: 300, flexShrink: 0,
            borderLeft: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', flexDirection: 'column',
            background: 'rgba(10,10,20,0.6)',
            overflow: 'hidden',
          }}>

            {/* Tabs */}
            <div style={{
              display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)',
              padding: '0 4px',
            }}>
              {([
                { key: 'text', icon: <Type size={13} />, label: '文本' },
                { key: 'anim', icon: <Zap size={13} />, label: '动画' },
                { key: 'style', icon: <Settings size={13} />, label: '样式' },
              ] as const).map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  style={{
                    flex: 1, background: 'none',
                    border: 'none', borderBottom: tab === t.key ? '2px solid #6366F1' : '2px solid transparent',
                    color: tab === t.key ? '#818CF8' : '#475569',
                    padding: '13px 4px 11px',
                    fontSize: 12, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                    fontWeight: tab === t.key ? 600 : 400,
                    transition: 'all 0.2s',
                  }}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* ── Text Tab ── */}
              {tab === 'text' && (
                <>
                  <PanelSection title="文字内容">
                    <textarea
                      value={activeSeg.text}
                      onChange={e => updateSeg(activeSeg.id, { text: e.target.value })}
                      style={{
                        width: '100%', background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8, padding: '10px 12px',
                        color: '#F1F5F9', fontSize: 14, resize: 'vertical',
                        minHeight: 80, outline: 'none', boxSizing: 'border-box',
                        fontFamily: 'inherit', lineHeight: 1.6,
                      }}
                      placeholder="输入口播文字…"
                    />
                  </PanelSection>

                  <PanelSection title="字体大小">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {FONT_SIZES.map(s => (
                        <button
                          key={s}
                          onClick={() => updateSeg(activeSeg.id, { fontSize: s })}
                          style={{
                            background: activeSeg.fontSize === s ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)',
                            border: activeSeg.fontSize === s ? '1px solid #6366F1' : '1px solid rgba(255,255,255,0.08)',
                            color: activeSeg.fontSize === s ? '#818CF8' : '#94A3B8',
                            borderRadius: 6, padding: '5px 9px', fontSize: 11,
                            cursor: 'pointer', fontWeight: activeSeg.fontSize === s ? 600 : 400,
                          }}
                        >{s}</button>
                      ))}
                    </div>
                  </PanelSection>

                  <PanelSection title="字重">
                    <div style={{ display: 'flex', gap: 6 }}>
                      {([['400', '细'], ['600', '中'], ['700', '粗'], ['900', '黑']] as const).map(([w, l]) => (
                        <button
                          key={w}
                          onClick={() => updateSeg(activeSeg.id, { fontWeight: w })}
                          style={{
                            flex: 1,
                            background: activeSeg.fontWeight === w ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                            border: activeSeg.fontWeight === w ? '1px solid #6366F1' : '1px solid rgba(255,255,255,0.08)',
                            color: activeSeg.fontWeight === w ? '#818CF8' : '#94A3B8',
                            borderRadius: 6, padding: '7px 0', fontSize: 12,
                            cursor: 'pointer', fontWeight: parseInt(w) as number,
                          }}
                        >{l}</button>
                      ))}
                    </div>
                  </PanelSection>

                  <PanelSection title="对齐">
                    <div style={{ display: 'flex', gap: 6 }}>
                      {([
                        ['left', <AlignLeft size={14} />],
                        ['center', <AlignCenter size={14} />],
                        ['right', <AlignRight size={14} />],
                      ] as const).map(([a, icon]) => (
                        <button
                          key={a}
                          onClick={() => updateSeg(activeSeg.id, { align: a })}
                          style={{
                            flex: 1,
                            background: activeSeg.align === a ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                            border: activeSeg.align === a ? '1px solid #6366F1' : '1px solid rgba(255,255,255,0.08)',
                            color: activeSeg.align === a ? '#818CF8' : '#94A3B8',
                            borderRadius: 6, padding: '8px 0', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >{icon}</button>
                      ))}
                    </div>
                  </PanelSection>

                  <PanelSection title="字间距">
                    <SliderInput
                      min={-2} max={20} step={0.5}
                      value={activeSeg.letterSpacing}
                      onChange={v => updateSeg(activeSeg.id, { letterSpacing: v })}
                      unit="px"
                    />
                  </PanelSection>
                </>
              )}

              {/* ── Anim Tab ── */}
              {tab === 'anim' && (
                <>
                  <PanelSection title="动画效果">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {(Object.entries(ANIM_DEFS) as [AnimStyle, AnimDef][]).map(([key, def]) => (
                        <button
                          key={key}
                          onClick={() => updateSeg(activeSeg.id, { style: key })}
                          style={{
                            background: activeSeg.style === key ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                            border: activeSeg.style === key ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.07)',
                            color: '#E2E8F0', borderRadius: 8, padding: '9px 12px',
                            fontSize: 13, cursor: 'pointer', textAlign: 'left',
                            display: 'flex', alignItems: 'center', gap: 10,
                            transition: 'all 0.15s',
                          }}
                        >
                          <span style={{ fontSize: 16, flexShrink: 0 }}>{def.icon}</span>
                          <div>
                            <div style={{ fontWeight: activeSeg.style === key ? 600 : 400, fontSize: 13, color: activeSeg.style === key ? '#818CF8' : '#E2E8F0' }}>
                              {def.label}
                            </div>
                            <div style={{ fontSize: 11, color: '#475569', marginTop: 1 }}>{def.description}</div>
                          </div>
                          {activeSeg.style === key && (
                            <ChevronRight size={12} style={{ marginLeft: 'auto', color: '#6366F1' }} />
                          )}
                        </button>
                      ))}
                    </div>
                  </PanelSection>

                  <PanelSection title="出现单元">
                    <div style={{ display: 'flex', gap: 6 }}>
                      {([['char', '逐字'], ['word', '逐词'], ['line', '整行']] as const).map(([u, l]) => (
                        <button
                          key={u}
                          onClick={() => updateSeg(activeSeg.id, { displayUnit: u })}
                          style={{
                            flex: 1,
                            background: activeSeg.displayUnit === u ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                            border: activeSeg.displayUnit === u ? '1px solid #6366F1' : '1px solid rgba(255,255,255,0.08)',
                            color: activeSeg.displayUnit === u ? '#818CF8' : '#94A3B8',
                            borderRadius: 6, padding: '8px 0', fontSize: 12, cursor: 'pointer',
                          }}
                        >{l}</button>
                      ))}
                    </div>
                  </PanelSection>

                  <PanelSection title="动画速度">
                    <SliderInput
                      min={20} max={300} step={10}
                      value={activeSeg.speed}
                      onChange={v => updateSeg(activeSeg.id, { speed: v })}
                      unit="ms/单元"
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                      {[['20', '极速'], ['80', '正常'], ['200', '慢速']].map(([v, l]) => (
                        <button
                          key={v}
                          onClick={() => updateSeg(activeSeg.id, { speed: parseInt(v) })}
                          style={{
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                            color: '#64748B', borderRadius: 6, padding: '4px 10px',
                            fontSize: 11, cursor: 'pointer',
                          }}
                        >{l}</button>
                      ))}
                    </div>
                  </PanelSection>
                </>
              )}

              {/* ── Style Tab ── */}
              {tab === 'style' && (
                <>
                  <PanelSection title="文字颜色">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                      {COLOR_PRESETS.map(c => (
                        <button
                          key={c}
                          onClick={() => updateSeg(activeSeg.id, { color: c })}
                          style={{
                            width: 26, height: 26, borderRadius: 6,
                            background: c,
                            border: activeSeg.color === c ? '2px solid #6366F1' : '1.5px solid rgba(255,255,255,0.15)',
                            cursor: 'pointer',
                            boxShadow: activeSeg.color === c ? '0 0 0 2px rgba(99,102,241,0.3)' : 'none',
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="color"
                        value={activeSeg.color}
                        onChange={e => updateSeg(activeSeg.id, { color: e.target.value })}
                        style={{ width: 32, height: 32, borderRadius: 6, border: 'none', cursor: 'pointer', background: 'none', padding: 0 }}
                      />
                      <input
                        value={activeSeg.color}
                        onChange={e => updateSeg(activeSeg.id, { color: e.target.value })}
                        style={{
                          flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 6, padding: '6px 10px', color: '#F1F5F9', fontSize: 12, outline: 'none',
                        }}
                      />
                    </div>
                  </PanelSection>

                  <PanelSection title="背景颜色">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                      {BG_PRESETS.map(b => (
                        <button
                          key={b.value}
                          onClick={() => setBgColor(b.value)}
                          title={b.name}
                          style={{
                            width: 36, height: 26, borderRadius: 6,
                            background: b.value,
                            border: bgColor === b.value ? '2px solid #6366F1' : '1.5px solid rgba(255,255,255,0.15)',
                            cursor: 'pointer',
                            fontSize: 9, color: b.value === '#FFFFFF' || b.value === '#FFF8F0' ? '#000' : '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >{b.name}</button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="color"
                        value={bgColor}
                        onChange={e => setBgColor(e.target.value)}
                        style={{ width: 32, height: 32, borderRadius: 6, border: 'none', cursor: 'pointer', background: 'none', padding: 0 }}
                      />
                      <input
                        value={bgColor}
                        onChange={e => setBgColor(e.target.value)}
                        style={{
                          flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 6, padding: '6px 10px', color: '#F1F5F9', fontSize: 12, outline: 'none',
                        }}
                      />
                    </div>
                  </PanelSection>

                  <PanelSection title="行高">
                    <SliderInput
                      min={1} max={2.5} step={0.1}
                      value={activeSeg.lineHeight}
                      onChange={v => updateSeg(activeSeg.id, { lineHeight: v })}
                      unit="x"
                    />
                  </PanelSection>

                  {/* Preview of current segment inline */}
                  <PanelSection title="当前段预览">
                    <div style={{
                      background: bgColor, borderRadius: 10,
                      height: 90, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', overflow: 'hidden',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}>
                      <div style={{
                        fontSize: Math.min(activeSeg.fontSize, 32),
                        fontWeight: activeSeg.fontWeight,
                        color: activeSeg.color,
                        textAlign: activeSeg.align,
                        letterSpacing: activeSeg.letterSpacing,
                        lineHeight: activeSeg.lineHeight,
                        padding: '0 12px',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {activeSeg.text}
                      </div>
                    </div>
                  </PanelSection>
                </>
              )}

            </div>

            {/* Segment info footer */}
            <div style={{
              padding: '10px 14px',
              borderTop: '1px solid rgba(255,255,255,0.07)',
              fontSize: 11, color: '#475569',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span>段落 {activeIndex + 1} / {segments.length}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => {
                    const next = segments[activeIndex - 1];
                    if (next) { setActiveId(next.id); setCurrentIdx(activeIndex - 1); }
                  }}
                  disabled={activeIndex === 0}
                  style={{
                    background: 'none', border: 'none', color: activeIndex === 0 ? '#1E293B' : '#94A3B8',
                    cursor: activeIndex === 0 ? 'default' : 'pointer', fontSize: 14,
                  }}
                >‹</button>
                <button
                  onClick={() => {
                    const next = segments[activeIndex + 1];
                    if (next) { setActiveId(next.id); setCurrentIdx(activeIndex + 1); }
                  }}
                  disabled={activeIndex === segments.length - 1}
                  style={{
                    background: 'none', border: 'none',
                    color: activeIndex === segments.length - 1 ? '#1E293B' : '#94A3B8',
                    cursor: activeIndex === segments.length - 1 ? 'default' : 'pointer', fontSize: 14,
                  }}
                >›</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{
        fontSize: 11, color: '#64748B', fontWeight: 600,
        letterSpacing: 0.6, textTransform: 'uppercase',
        marginBottom: 8,
      }}>{title}</div>
      {children}
    </div>
  );
}

interface SliderInputProps {
  min: number; max: number; step: number; value: number;
  onChange: (v: number) => void; unit?: string;
}

function SliderInput({ min, max, step, value, onChange, unit }: SliderInputProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ flex: 1, accentColor: '#6366F1', cursor: 'pointer' }}
      />
      <div style={{
        minWidth: 52, textAlign: 'center',
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 6, padding: '4px 0', fontSize: 11, color: '#94A3B8',
      }}>{value}{unit}</div>
    </div>
  );
}
