# Pi Coding Agent VS Code Extension

Provides a native VS Code integration for the [Pi Coding Agent](https://pi.dev).

## Features

- **Start Session**: Opens a new terminal running `pi`.
- **Add Current File to Session**: Opens `pi` and automatically adds the currently active file as context (`@filename`).

## Configuration

- `pi.executablePath`: Path to the Pi executable. Defaults to `pi`. You can change this if you installed Pi in a specific location or want to run it via `npx pi`.
