# UI Improve — Unapplied / Deferred Items

## m1. font-display vs font-body 동일 폰트 (Sora)
- **판단**: 의도적 설계. weight로 위계를 구분하는 미니멀 디자인 접근.
- **향후 고려**: display 용도로 'Space Grotesk'나 'DM Serif Display' 등 도입하면 위계 강화 가능.

## TourGuide 스포트라이트 하드코딩
- **현재**: `rgba(0, 0, 0, 0.6)` — box-shadow 내부라 CSS 변수 사용 불가.
- **향후**: CSS `color-mix()` 지원이 안정화되면 디자인 토큰으로 교체 가능.

## Heatmap 터치 tooltip
- **현재**: `title` + `aria-label`만 적용. 터치에서는 title이 표시되지 않음.
- **향후**: 탭 시 팝업 tooltip 컴포넌트 도입 시 적용 가능.
