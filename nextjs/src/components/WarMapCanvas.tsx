'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Stage, Layer, Circle, Rect, Line, Text, Group, Transformer, Arrow } from 'react-konva';
import Konva from 'konva';

interface Icon {
  id: number;
  user_name: string;
  x: number;
  y: number;
  border_color: string;
}

interface Flag {
  id: number;
  x: number;
  y: number;
  memo: string;
}

interface Drawing {
  id: number;
  type: string;
  points: string;
  color: string;
  stroke_width: number;
}

interface OnlineUser {
  user_id: number;
  nickname: string;
  user_color: string;
}

interface WarMapCanvasProps {
  sessionId: number;
  userId: number;
  userNickname: string;
  userColor: string;
}

type Tool = 'select' | 'icon' | 'flag' | 'arrow' | 'line' | 'rect' | 'circle' | 'text';

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

export default function WarMapCanvas({
  sessionId,
  userId,
  userNickname,
  userColor,
}: WarMapCanvasProps) {
  const [tool, setTool] = useState<Tool>('select');
  const [strokeColor, setStrokeColor] = useState('#e94560');
  const [fillColor, setFillColor] = useState('#e94560');
  const [icons, setIcons] = useState<Icon[]>([]);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const [currentDrawing, setCurrentDrawing] = useState<any>(null);

  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  // Load data
  useEffect(() => {
    loadSessionData();
    const interval = setInterval(() => {
      loadSessionData();
      updatePresence();
    }, 5000);

    updatePresence();

    return () => {
      clearInterval(interval);
      removePresence();
    };
  }, [sessionId, userId]);

  // Update transformer
  useEffect(() => {
    if (transformerRef.current && stageRef.current) {
      const stage = stageRef.current;
      const selectedNode = stage.findOne(`#icon-${selectedId}`) || stage.findOne(`#flag-${selectedId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
      } else {
        transformerRef.current.nodes([]);
      }
    }
  }, [selectedId, icons, flags]);

  const loadSessionData = async () => {
    try {
      const [iconsRes, flagsRes, drawingsRes, usersRes] = await Promise.all([
        fetch(`/api/icons?sessionId=${sessionId}`),
        fetch(`/api/flags?sessionId=${sessionId}`),
        fetch(`/api/drawings?sessionId=${sessionId}`),
        fetch(`/api/presence?sessionId=${sessionId}`),
      ]);

      const [iconsData, flagsData, drawingsData, usersData] = await Promise.all([
        iconsRes.json(),
        flagsRes.json(),
        drawingsRes.json(),
        usersRes.json(),
      ]);

      setIcons(iconsData);
      setFlags(flagsData);
      setDrawings(drawingsData);
      setOnlineUsers(usersData || []);
    } catch (err) {
      console.error('Failed to load session data:', err);
    }
  };

  const updatePresence = async () => {
    try {
      await fetch('/api/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userId,
          nickname: userNickname,
          userColor,
        }),
      });
    } catch (err) {
      console.error('Failed to update presence:', err);
    }
  };

  const removePresence = async () => {
    try {
      await fetch(`/api/presence?sessionId=${sessionId}&userId=${userId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to remove presence:', err);
    }
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    if (tool === 'select') {
      const clickedOnEmpty = e.target === stage;
      if (clickedOnEmpty) {
        setSelectedId(null);
      }
      return;
    }

    if (tool === 'icon') {
      const name = prompt('유저 이름:');
      if (name) {
        createIcon(pos.x, pos.y, name);
      }
      return;
    }

    if (tool === 'flag') {
      const memo = prompt('메모:') || '';
      createFlag(pos.x, pos.y, memo);
      return;
    }

    if (tool === 'text') {
      const text = prompt('텍스트:') || '텍스트';
      createTextDrawing(pos.x, pos.y, text);
      return;
    }

    setIsDrawing(true);
    setDrawStart({ x: pos.x, y: pos.y });
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    const newDrawing = createTempDrawing(drawStart.x, drawStart.y, pos.x, pos.y);
    setCurrentDrawing(newDrawing);
  };

  const handleMouseUp = async (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    setIsDrawing(false);

    if (tool === 'arrow') {
      await createArrowDrawing(drawStart.x, drawStart.y, pos.x, pos.y);
    } else if (tool === 'line') {
      await createLineDrawing(drawStart.x, drawStart.y, pos.x, pos.y);
    } else if (tool === 'rect') {
      await createRectDrawing(drawStart.x, drawStart.y, pos.x, pos.y);
    } else if (tool === 'circle') {
      await createCircleDrawing(drawStart.x, drawStart.y, pos.x, pos.y);
    }

    setCurrentDrawing(null);
  };

  const createTempDrawing = (x1: number, y1: number, x2: number, y2: number) => {
    switch (tool) {
      case 'arrow':
        return { type: 'arrow', points: [x1, y1, x2, y2], color: strokeColor };
      case 'line':
        return { type: 'line', points: [x1, y1, x2, y2], color: strokeColor };
      case 'rect':
        return { type: 'rect', x: Math.min(x1, x2), y: Math.min(y1, y2), width: Math.abs(x2 - x1), height: Math.abs(y2 - y1), color: strokeColor };
      case 'circle':
        const r = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        return { type: 'circle', x: x1, y: y1, radius: r, color: strokeColor };
      default:
        return null;
    }
  };

  const createIcon = async (x: number, y: number, name: string) => {
    try {
      const res = await fetch('/api/icons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userName: name,
          x: Math.round(x),
          y: Math.round(y),
          borderColor: userColor,
          placedBy: userId,
        }),
      });

      if (res.ok) {
        loadSessionData();
      }
    } catch (err) {
      console.error('Failed to create icon:', err);
    }
  };

  const createFlag = async (x: number, y: number, memo: string) => {
    try {
      const res = await fetch('/api/flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          x: Math.round(x),
          y: Math.round(y),
          memo,
          createdBy: userId,
        }),
      });

      if (res.ok) {
        loadSessionData();
      }
    } catch (err) {
      console.error('Failed to create flag:', err);
    }
  };

  const createArrowDrawing = async (x1: number, y1: number, x2: number, y2: number) => {
    await createDrawing('arrow', JSON.stringify([x1, y1, x2, y2]));
  };

  const createLineDrawing = async (x1: number, y1: number, x2: number, y2: number) => {
    await createDrawing('line', JSON.stringify([x1, y1, x2, y2]));
  };

  const createRectDrawing = async (x1: number, y1: number, x2: number, y2: number) => {
    await createDrawing('rect', JSON.stringify([Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1)]));
  };

  const createCircleDrawing = async (x1: number, y1: number, x2: number, y2: number) => {
    const r = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    await createDrawing('circle', JSON.stringify([x1, y1, r]));
  };

  const createTextDrawing = async (x: number, y: number, text: string) => {
    await createDrawing('text', JSON.stringify([x, y, text]));
  };

  const createDrawing = async (type: string, points: string) => {
    try {
      const res = await fetch('/api/drawings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          type,
          points,
          color: strokeColor,
          strokeWidth: 3,
          createdBy: userId,
        }),
      });

      if (res.ok) {
        loadSessionData();
      }
    } catch (err) {
      console.error('Failed to create drawing:', err);
    }
  };

  const handleObjectClick = (id: number, objType: string) => {
    if (tool === 'select') {
      setSelectedId(id);
    }
  };

  const handleObjectDragEnd = async (e: Konva.KonvaEventObject<DragEvent>, id: number, objType: string) => {
    const x = Math.round(e.target.x());
    const y = Math.round(e.target.y());

    if (objType === 'icon') {
      await fetch('/api/icons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, x, y }),
      });
    } else if (objType === 'flag') {
      await fetch('/api/flags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, x, y }),
      });
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
      // Check if it's an icon or flag
      const isIcon = icons.some(i => i.id === selectedId);
      const isFlag = flags.some(f => f.id === selectedId);
      const isDrawing = drawings.some(d => d.id === selectedId);

      if (isIcon) {
        deleteIcon(selectedId);
      } else if (isFlag) {
        deleteFlag(selectedId);
      } else if (isDrawing) {
        deleteDrawing(selectedId);
      }
    }
  }, [selectedId, icons, flags, drawings]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const deleteIcon = async (id: number) => {
    try {
      const res = await fetch(`/api/icons?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSelectedId(null);
        loadSessionData();
      }
    } catch (err) {
      console.error('Failed to delete icon:', err);
    }
  };

  const deleteFlag = async (id: number) => {
    try {
      const res = await fetch(`/api/flags?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSelectedId(null);
        loadSessionData();
      }
    } catch (err) {
      console.error('Failed to delete flag:', err);
    }
  };

  const deleteDrawing = async (id: number) => {
    try {
      const res = await fetch(`/api/drawings?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSelectedId(null);
        loadSessionData();
      }
    } catch (err) {
      console.error('Failed to delete drawing:', err);
    }
  };

  const parsePoints = (pointsStr: string): number[] => {
    try {
      return JSON.parse(pointsStr);
    } catch {
      return [];
    }
  };

  const tools = [
    { id: 'select', icon: '👆', label: '선택' },
    { id: 'icon', icon: '👤', label: '유저' },
    { id: 'flag', icon: '🚩', label: '플래그' },
    { id: 'arrow', icon: '➡️', label: '화살표' },
    { id: 'line', icon: '📏', label: '선' },
    { id: 'rect', icon: '⬜', label: '사각형' },
    { id: 'circle', icon: '⭕', label: '원' },
    { id: 'text', icon: '📝', label: '텍스트' },
  ];

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Tools */}
      <div className="w-[70px] bg-gradient-to-b from-[#16213e] to-[#1a1a2e] border-r border-[#0f3460] p-2 flex flex-col gap-1 overflow-y-auto shrink-0">
        <div className="text-[10px] text-gray-500 text-center mb-2 pb-2 border-b border-[#0f3460]">도구</div>

        {tools.map(t => (
          <button
            key={t.id}
            onClick={() => setTool(t.id as Tool)}
            className={`p-2 rounded-lg text-[11px] flex flex-col items-center gap-1 transition-all ${
              tool === t.id
                ? 'bg-[#e94560] text-white'
                : 'bg-[#0f3460] text-gray-300 hover:bg-[#1a4a7a]'
            }`}
          >
            <span className="text-lg">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}

        <div className="mt-auto pt-2 border-t border-[#0f3460]">
          <div className="text-[9px] text-gray-500 text-center mb-1">선 색상</div>
          <input
            type="color"
            value={strokeColor}
            onChange={(e) => setStrokeColor(e.target.value)}
            className="w-full h-6 rounded cursor-pointer"
          />
          <div className="text-[9px] text-gray-500 text-center mt-2 mb-1">채우기</div>
          <input
            type="color"
            value={fillColor}
            onChange={(e) => setFillColor(e.target.value)}
            className="w-full h-6 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-[#16213e] border-b border-[#0f3460] px-3 py-1 flex items-center gap-3 text-xs text-gray-400 shrink-0">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            연결됨
          </span>
          <span>👤: {icons.length}</span>
          <span>🚩: {flags.length}</span>
          <span>➕: {drawings.length}</span>
        </div>

        <div className="flex-1 overflow-auto bg-[#0a0a14]">
          <div className="inline-block">
            <Stage
              ref={stageRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              style={{ cursor: tool === 'select' ? 'default' : 'crosshair' }}
            >
              <Layer>
                {/* Icons */}
                {icons.map(icon => (
                  <Group
                    key={icon.id}
                    id={`icon-${icon.id}`}
                    x={icon.x}
                    y={icon.y}
                    draggable={tool === 'select'}
                    onClick={() => handleObjectClick(icon.id, 'icon')}
                    onDragEnd={(e) => handleObjectDragEnd(e, icon.id, 'icon')}
                  >
                    <Circle
                      radius={16}
                      fill={icon.border_color}
                    />
                    <Text
                      text={icon.user_name.charAt(0).toUpperCase()}
                      fontSize={12}
                      fill="white"
                      offsetX={4}
                      offsetY={4}
                      fontStyle="bold"
                    />
                  </Group>
                ))}

                {/* Flags */}
                {flags.map(flag => (
                  <Group
                    key={flag.id}
                    id={`flag-${flag.id}`}
                    x={flag.x}
                    y={flag.y}
                    draggable={tool === 'select'}
                    onClick={() => handleObjectClick(flag.id, 'flag')}
                    onDragEnd={(e) => handleObjectDragEnd(e, flag.id, 'flag')}
                  >
                    <Rect
                      width={3}
                      height={25}
                      fill="#888"
                      offsetY={12}
                    />
                    <Rect
                      width={18}
                      height={18}
                      fill={fillColor}
                      offsetX={9}
                      offsetY={9}
                    />
                  </Group>
                ))}

                {/* Drawings */}
                {drawings.map(drawing => {
                  const pts = parsePoints(drawing.points);
                  if (drawing.type === 'line') {
                    return (
                      <Line
                        key={drawing.id}
                        id={`drawing-${drawing.id}`}
                        points={pts}
                        stroke={drawing.color}
                        strokeWidth={drawing.stroke_width}
                        onClick={() => handleObjectClick(drawing.id, 'drawing')}
                        draggable={tool === 'select'}
                        onDragEnd={(e) => {
                          // Simplified: just reload data
                          loadSessionData();
                        }}
                      />
                    );
                  }
                  if (drawing.type === 'arrow') {
                    return (
                      <Arrow
                        key={drawing.id}
                        id={`drawing-${drawing.id}`}
                        points={pts}
                        stroke={drawing.color}
                        fill={drawing.color}
                        strokeWidth={drawing.stroke_width}
                        pointerLength={15}
                        pointerWidth={15}
                        onClick={() => handleObjectClick(drawing.id, 'drawing')}
                        draggable={tool === 'select'}
                      />
                    );
                  }
                  if (drawing.type === 'rect') {
                    return (
                      <Rect
                        key={drawing.id}
                        id={`drawing-${drawing.id}`}
                        x={pts[0]}
                        y={pts[1]}
                        width={pts[2]}
                        height={pts[3]}
                        stroke={drawing.color}
                        strokeWidth={drawing.stroke_width}
                        fill="transparent"
                        onClick={() => handleObjectClick(drawing.id, 'drawing')}
                        draggable={tool === 'select'}
                      />
                    );
                  }
                  if (drawing.type === 'circle') {
                    return (
                      <Circle
                        key={drawing.id}
                        id={`drawing-${drawing.id}`}
                        x={pts[0]}
                        y={pts[1]}
                        radius={pts[2]}
                        stroke={drawing.color}
                        strokeWidth={drawing.stroke_width}
                        fill="transparent"
                        onClick={() => handleObjectClick(drawing.id, 'drawing')}
                        draggable={tool === 'select'}
                      />
                    );
                  }
                  if (drawing.type === 'text') {
                    return (
                      <Text
                        key={drawing.id}
                        id={`drawing-${drawing.id}`}
                        x={pts[0]}
                        y={pts[1]}
                        text={String(pts[2] || '텍스트')}
                        fill={drawing.color}
                        fontSize={16}
                        onClick={() => handleObjectClick(drawing.id, 'drawing')}
                        draggable={tool === 'select'}
                      />
                    );
                  }
                  return null;
                })}

                {/* Current drawing preview */}
                {currentDrawing && (
                  <>
                    {currentDrawing.type === 'line' && (
                      <Line
                        points={currentDrawing.points}
                        stroke={currentDrawing.color}
                        strokeWidth={3}
                      />
                    )}
                    {currentDrawing.type === 'arrow' && (
                      <Arrow
                        points={currentDrawing.points}
                        stroke={currentDrawing.color}
                        fill={currentDrawing.color}
                        strokeWidth={3}
                        pointerLength={15}
                        pointerWidth={15}
                      />
                    )}
                    {currentDrawing.type === 'rect' && (
                      <Rect
                        x={currentDrawing.x}
                        y={currentDrawing.y}
                        width={currentDrawing.width}
                        height={currentDrawing.height}
                        stroke={currentDrawing.color}
                        strokeWidth={3}
                        fill="transparent"
                      />
                    )}
                    {currentDrawing.type === 'circle' && (
                      <Circle
                        x={currentDrawing.x}
                        y={currentDrawing.y}
                        radius={currentDrawing.radius}
                        stroke={currentDrawing.color}
                        strokeWidth={3}
                        fill="transparent"
                      />
                    )}
                  </>
                )}

                <Transformer ref={transformerRef} />
              </Layer>
            </Stage>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Online Users */}
      <div className="w-[140px] bg-gradient-to-b from-[#16213e] to-[#1a1a2e] border-l border-[#0f3460] p-2 shrink-0">
        <div className="text-[10px] text-gray-500 text-center pb-2 border-b border-[#0f3460]">
          🟢 온라인 사용자
        </div>
        <div className="mt-2 space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
          {onlineUsers.length === 0 ? (
            <div className="text-[10px] text-gray-600 text-center py-4">없음</div>
          ) : (
            onlineUsers.map(user => (
              <div
                key={user.user_id}
                className="flex items-center gap-2 p-2 bg-[#0a0a14] rounded-lg"
              >
                <div className="w-2 h-2 rounded-full bg-green-500 shrink-0"></div>
                <div
                  className="w-3 h-3 rounded shrink-0"
                  style={{ backgroundColor: user.user_color }}
                ></div>
                <div className="text-[11px] text-gray-300 truncate">
                  {user.nickname}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
