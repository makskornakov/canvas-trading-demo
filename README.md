# Test Trading Canvas repository

React TypeScript Trading canvas that can scroll, zoom and more

## How to develop local packages with Hot Reload

> Reference: https://pnpm.io/cli/link

In a terminal, execute the following commands (assuming [`canvas-trading`][canvas-trading] is the package we want to develop):

```ps1
pnpm link ./packages/canvas-trading # `./` in the start is important — this is how `pnpm link` knows that it is a relative path.
cd packages/canvas-trading
pnpm i
pnpm tsc --watch
# Leave this terminal running for Hot Reload.
```

In another terminal, just execute `pnpm start`, or restart if it's already running. Good to go!

Update anything in [`canvas-trading`][canvas-trading] for a test.

#### When you're done

Execute:

```ps1
pnpm unlink canvas-trading
```

You may also want to stop the terminal running `pnpm tsc --watch`.

No need to stop the `pnpm start` terminal (if you have it running).

[canvas-trading]: ./packages/canvas-trading/
