// ─── useDrag — reusable long-press drag-to-reorder hook ─────────────────────
// Returns props to attach to each draggable row and a ghost element to render.
//
// Usage:
//   const { getRowProps, ghostEl, listRef } = useDrag({ items, onReorder, ghostLabel });
//   <div ref={listRef}> {items.map((item, i) => <div {...getRowProps(i)}>…</div>)} </div>
//   {ghostEl}

import { useRef, useState } from 'react';
import { reorder } from '../utils';

const LONG_PRESS_MS = 350;
const CANCEL_THRESHOLD_PX = 6;

export function useDrag({ items, onReorder, getLabel, getColor }) {
  const dragRef      = useRef(null);
  const dragOverRef  = useRef(null);
  const timerRef     = useRef(null);
  const listRef      = useRef(null);

  const [ghost,    setGhost]    = useState(null); // { idx, floatY, label, color }
  const [overIdx,  setOverIdx]  = useState(null);

  const isDragging  = idx => ghost?.idx === idx;
  const isDropTarget = idx => overIdx === idx && ghost?.idx !== idx;

  const getRowProps = idx => ({
    'data-drag-row': true,
    style: {
      opacity:    isDragging(idx)  ? 0.25 : 1,
      background: isDropTarget(idx) ? '#F0F5EE' : undefined,
      transition: 'opacity 0.15s, background 0.1s',
    },
  });

  const handleTouchStart = (idx, e) => {
    const t = e.touches[0];
    dragRef.current = { pending: true, idx, startY: t.clientY, floatY: t.clientY };
    timerRef.current = setTimeout(() => {
      if (!dragRef.current?.pending) return;
      dragRef.current.pending = false;
      dragRef.current.active  = true;
      dragOverRef.current     = idx;
      if (navigator.vibrate) navigator.vibrate(30);
      setGhost({ idx, floatY: t.clientY, label: getLabel?.(idx) ?? '', color: getColor?.(idx) });
      setOverIdx(idx);
    }, LONG_PRESS_MS);
  };

  const handleTouchMove = e => {
    if (!dragRef.current) return;
    const t = e.touches[0];
    if (dragRef.current.pending) {
      if (Math.abs(t.clientY - dragRef.current.startY) > CANCEL_THRESHOLD_PX) {
        clearTimeout(timerRef.current);
        dragRef.current = null;
      }
      return;
    }
    if (!dragRef.current.active) return;
    e.preventDefault();
    e.stopPropagation();
    dragRef.current.floatY = t.clientY;

    // Update drop target by hit-testing rows
    listRef.current?.querySelectorAll('[data-drag-row]').forEach((row, i) => {
      const rect = row.getBoundingClientRect();
      if (t.clientY >= rect.top && t.clientY <= rect.bottom) {
        dragOverRef.current = i;
        setOverIdx(i);
      }
    });

    // Move ghost via DOM for zero-lag position update
    const ghostEl = document.getElementById('drag-ghost');
    if (ghostEl) ghostEl.style.top = t.clientY + 'px';
  };

  const handleTouchEnd = () => {
    clearTimeout(timerRef.current);
    if (!dragRef.current?.active) { dragRef.current = null; return; }
    const from = dragRef.current.idx;
    const to   = dragOverRef.current ?? from;
    dragRef.current     = null;
    dragOverRef.current = null;
    setGhost(null);
    setOverIdx(null);
    if (to !== from) onReorder(reorder(items, from, to), from, to);
  };

  const handleTouchCancel = () => {
    clearTimeout(timerRef.current);
    dragRef.current = null; dragOverRef.current = null;
    setGhost(null); setOverIdx(null);
  };

  const getDragHandleProps = idx => ({
    onTouchStart:  e => handleTouchStart(idx, e),
    onTouchMove:   handleTouchMove,
    onTouchEnd:    handleTouchEnd,
    onTouchCancel: handleTouchCancel,
    style: { cursor: 'grab', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' },
  });

  const ghostEl = ghost ? (
    <div id="drag-ghost" style={{
      position: 'fixed', left: 16, right: 16, top: ghost.floatY,
      transform: 'translateY(-50%)', background: '#283618', borderRadius: 12,
      padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)', zIndex: 9999, pointerEvents: 'none',
    }}>
      <svg width="16" height="12" viewBox="0 0 16 12" fill="rgba(255,255,255,0.4)">
        <rect y="0" width="16" height="2" rx="1"/>
        <rect y="5" width="16" height="2" rx="1"/>
        <rect y="10" width="16" height="2" rx="1"/>
      </svg>
      {ghost.color && <div style={{ width:10, height:10, borderRadius:'50%', background:ghost.color, flexShrink:0 }}/>}
      <span style={{ fontSize:14, fontWeight:600, color:'#FFFFFF' }}>{ghost.label}</span>
    </div>
  ) : null;

  return { listRef, getRowProps, getDragHandleProps, ghostEl, isDragging, isDropTarget };
}
