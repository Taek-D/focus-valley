// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// Mock AudioContext before importing hook
const mockResume = vi.fn().mockResolvedValue(undefined);

const mockCompressor = {
    threshold: { value: 0 },
    knee: { value: 0 },
    ratio: { value: 0 },
    attack: { value: 0 },
    release: { value: 0 },
    connect: vi.fn(),
};

const mockAnalyser = {
    fftSize: 0,
    smoothingTimeConstant: 0,
    connect: vi.fn(),
};

// We need to be able to mutate state for tests
let mockContextState: AudioContextState = "suspended";

const mockAudioContext = {
    get state() { return mockContextState; },
    resume: mockResume,
    createDynamicsCompressor: vi.fn(() => mockCompressor),
    createAnalyser: vi.fn(() => mockAnalyser),
    destination: {},
    decodeAudioData: vi.fn(),
    createGain: vi.fn(),
    createBufferSource: vi.fn(),
};

// Replace window.AudioContext with a constructor mock
const MockAudioContextCtor = vi.fn().mockImplementation(function () {
    return mockAudioContext;
});
vi.stubGlobal("AudioContext", MockAudioContextCtor);

import { useAudioMixer } from "@/hooks/useAudioMixer";

describe("useAudioMixer - resumeAudio", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockContextState = "suspended";
        mockResume.mockResolvedValue(undefined);
    });

    it("resumeAudio() calls context.resume() when context exists and state is 'suspended'", async () => {
        const { result } = renderHook(() => useAudioMixer());

        // Initialize audio context (initAudio itself may call resume if suspended)
        act(() => {
            result.current.initAudio();
        });

        // Clear calls from initAudio so we only count resumeAudio calls
        mockResume.mockClear();
        mockContextState = "suspended";

        act(() => {
            result.current.resumeAudio();
        });

        expect(mockResume).toHaveBeenCalledTimes(1);
    });

    it("resumeAudio() does NOT call context.resume() when context state is 'running'", async () => {
        const { result } = renderHook(() => useAudioMixer());

        // Initialize audio context
        act(() => {
            result.current.initAudio();
        });

        // Clear calls from initAudio, then set state to running
        mockResume.mockClear();
        mockContextState = "running";

        act(() => {
            result.current.resumeAudio();
        });

        expect(mockResume).not.toHaveBeenCalled();
    });

    it("resumeAudio() does nothing when context is null (audio never initialized)", () => {
        const { result } = renderHook(() => useAudioMixer());

        // Do NOT call initAudio - context remains null

        act(() => {
            result.current.resumeAudio();
        });

        expect(mockResume).not.toHaveBeenCalled();
    });
});
