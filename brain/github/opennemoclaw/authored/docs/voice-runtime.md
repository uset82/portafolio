<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/opennemoclaw/blob/main/docs/voice-runtime.md; checkedOn: 2026-07-31; redactions: 0 -->

# Voice Input And Output

`LocalVoiceService` wraps local speech tools and `VoiceRuntimeService` composes them with the existing `AgentLifecycleService.chatWithAgent(...)` path. The result is a single host-side flow:

1. Transcribe input audio with `whisper.cpp`
2. Send the transcript through the normal NemoClaw runtime
3. Synthesize the assistant reply with Piper

## Example

```ts
import {
  AgentLifecycleService,
  LocalVoiceService,
  VoiceRuntimeService
} from '@nemoclaw/core';

const lifecycleService = new AgentLifecycleService({
  // normal NemoClaw lifecycle dependencies
});

const voiceService = new LocalVoiceService({
  whisperCommand: 'C:/tools/whisper.cpp/build/bin/whisper-cli',
  piperCommand: 'piper'
});

const voiceRuntime = new VoiceRuntimeService({
  lifecycleService,
  voiceService
});

const result = await voiceRuntime.chatWithVoice({
  agent: 'ops-agent',
  inputAudioPath: 'C:/audio/request.wav',
  outputAudioPath: 'C:/audio/reply.wav',
  createNewConversation: true,
  transcription: {
    modelPath: 'C:/models/ggml-base.en.bin',
    language: 'en'
  },
  synthesis: {
    modelPath: 'C:/voices/en_US-lessac-medium.onnx'
  }
});

console.log(result.transcription.text);
console.log(result.response);
console.log(result.synthesis.outputPath);
```

## Piper Module Mode

If your environment does not expose a `piper` executable directly, point the service at `python -m piper`:

```ts
const voiceService = new LocalVoiceService({
  whisperCommand: 'C:/tools/whisper.cpp/build/bin/whisper-cli',
  piperCommand: 'python',
  piperBaseArgs: ['-m', 'piper']
});
```

For Piper-compatible environments that expect text on standard input instead of as a positional argument, pass `textInput: 'stdin'` inside `synthesis`.

## Behavior

- Voice turns reuse the normal lifecycle chat path, so conversations, memory, tools, and policy enforcement stay unchanged.
- `whisper.cpp` is invoked with `-otxt -of ...`, and the generated transcript file path is returned in `TranscribeAudioResult`.
- Piper writes the synthesized reply to the `outputAudioPath` you provide.
- `VoiceRuntimeService` emits structured events for `voice.started`, `voice.transcribed`, `voice.responded`, `voice.synthesized`, and `voice.failed`.

## Current Scope

- Input and output are local files. Microphone capture, streaming audio, and browser voice transport are not part of this phase.
- The voice wrapper assumes local models are already installed and reachable by path.
- Prefer 16-bit WAV input unless your local `whisper.cpp` build adds broader format support.

## Verification

The core suite covers:

- `packages/core/test/local-voice-service.test.ts` for `whisper.cpp` and Piper command construction
- `packages/core/test/voice-runtime-service.test.ts` for the lifecycle-composed `transcribe -> chat -> synthesize` flow
