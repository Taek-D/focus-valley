---
name: focus-valley-audio
description: Web Audio API 패턴, 노이즈 생성 알고리즘, 오디오 트랙 관리. Use when working with sounds, audio mixer, or adding new sound types.
---

# Audio Skill

## Architecture

```
useAudioMixer (hook)
├── AudioContext (single instance, lazy init on user gesture)
├── tracksRef: Map<NoiseType, { gainNode, source }>
└── Per track:
    [BufferSource] → [BiquadFilter?] → [GainNode] → [destination]
```

## Noise Generation Algorithms

| Type | Algorithm | Filter | Character |
|------|-----------|--------|-----------|
| white | `Math.random() * 2 - 1` | None | Static hiss |
| rain | Pink noise (Paul Kellet) | lowpass 800Hz | Gentle rain |
| fire | Brown noise (cumulative random walk) | lowpass 250Hz | Deep rumble |
| cafe | White noise (default) | None | Placeholder |
| stream | White noise (default) | None | Placeholder |

## Important Constraints

- **AudioContext must be created from user gesture** (browser policy). `initAudio()` handles this.
- **Tracks are lazy-loaded**: Only created when volume > 0 for the first time
- **Buffers are 2 seconds, looped**: `source.loop = true` with `2 * sampleRate` buffer
- **Gain transitions use `setTargetAtTime`** with 0.1s time constant for smooth volume changes
- **Mute preserves volume state**: `isMuted` flag zeroes gain without changing `volumes` record

## Adding a New Sound Type

1. Add type to `NoiseType` union in `useAudioMixer.ts`
2. Add noise generation algorithm in `createNoiseBuffer()`
3. Optionally add a BiquadFilter in `startTrack()` for character shaping
4. Add initial volume `0` in the `volumes` state
5. Add track entry in `AudioMixer.tsx` tracks array with label and icon

## Common Pitfalls

- Never create AudioContext outside of a click/touch handler
- Always check `contextRef.current.state === "suspended"` and call `.resume()`
- Filter chains: connect source -> filter -> gainNode (not source -> gainNode -> filter)
