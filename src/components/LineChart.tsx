import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';
import { colors, font } from '@/theme';
import type { Point } from '@/modules/gym/logic/stats';

function fmtDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * Minimal responsive line chart built on react-native-svg so it renders
 * identically on web and native. Good enough for the trend graphs we need.
 */
export function LineChart({
  data,
  height = 200,
  color = colors.primary,
  unitLabel,
}: {
  data: Point[];
  height?: number;
  color?: string;
  unitLabel?: string;
}) {
  const [width, setWidth] = useState(320);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const padL = 40;
  const padR = 12;
  const padT = 14;
  const padB = 24;
  const innerW = Math.max(1, width - padL - padR);
  const innerH = Math.max(1, height - padT - padB);

  const ys = data.map((d) => d.y);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const span = maxY - minY || 1;
  // Pad the y-range a touch so the line isn't glued to the edges.
  const lo = minY - span * 0.1;
  const hi = maxY + span * 0.1;
  const range = hi - lo || 1;

  const x = (i: number) =>
    padL + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const y = (v: number) => padT + innerH - ((v - lo) / range) * innerH;

  const pointsAttr = data.map((d, i) => `${x(i)},${y(d.y)}`).join(' ');
  const gridVals = [hi, (hi + lo) / 2, lo];

  return (
    <View onLayout={onLayout} style={styles.wrap}>
      <Svg width={width} height={height}>
        {/* horizontal gridlines + y labels */}
        {gridVals.map((v, idx) => {
          const gy = y(v);
          return (
            <Line
              key={`g${idx}`}
              x1={padL}
              y1={gy}
              x2={width - padR}
              y2={gy}
              stroke={colors.border}
              strokeWidth={1}
            />
          );
        })}
        {gridVals.map((v, idx) => (
          <SvgText
            key={`yl${idx}`}
            x={padL - 6}
            y={y(v) + 3}
            fill={colors.textFaint}
            fontSize={font.tiny}
            textAnchor="end"
          >
            {Math.round(v).toString()}
          </SvgText>
        ))}

        {/* the trend line */}
        {data.length > 1 && (
          <Polyline
            points={pointsAttr}
            fill="none"
            stroke={color}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* points */}
        {data.map((d, i) => (
          <Circle key={`p${i}`} cx={x(i)} cy={y(d.y)} r={3.5} fill={color} />
        ))}

        {/* x labels: first + last */}
        {data.length > 0 && (
          <SvgText
            x={x(0)}
            y={height - 6}
            fill={colors.textFaint}
            fontSize={font.tiny}
            textAnchor="start"
          >
            {fmtDate(data[0].x)}
          </SvgText>
        )}
        {data.length > 1 && (
          <SvgText
            x={x(data.length - 1)}
            y={height - 6}
            fill={colors.textFaint}
            fontSize={font.tiny}
            textAnchor="end"
          >
            {fmtDate(data[data.length - 1].x)}
          </SvgText>
        )}

        {unitLabel && (
          <SvgText x={padL} y={10} fill={colors.textMuted} fontSize={font.tiny}>
            {unitLabel}
          </SvgText>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
});
