# PoE Overlay (Community Fork)

PoE Overlay is a tool for Path of Exile. The **_core aspect_** is to blend in with the game. Built with Electron and Angular.

<!-- TOC -->

- [Community Development](#community-development)
- [Features](#features)
- [Getting Started](#getting-started)
- [Roadmap](#roadmap)
- [Developer Docs](#developer-docs)
- [Authors](#authors)
- [License](#license)
- [Acknowledgments](#acknowledgments)
<!-- /TOC -->

## Community Development

This version of PoE Overlay was forked on 2020-06-10 to snapshot the app before it was
converted to closed source.

We have a Discord server [here](https://discord.gg/7wE9j5q) where we discuss
features, bugs, and development. All are welcome to join.

## Features

[![Feature Overview As Video](img/video.jpg)](https://www.youtube.com/watch?v=_cJmW8QkQnM)

### Evaluation of items

  - Select your preferred currencies and language
  - Uses the official pathofexile.com/trade website
  - A graphical display of the price distribution <details><summary>Click to see image</summary>![item](img/item_0.5.8.jpg)</details>
  - Filter your search on all supported properties on click <details><summary>Click to see image</summary>![item_filter](img/item_filter_0.5.8.jpg)</details>
  - An in game browser to display the created search <details><summary>Click to see image</summary>![browser](img/item_browser_0.5.8.jpg)</details>
  - Lets you price tag the item by clicking the desired bar/value

### Other Features

  - Bind in game commands to a custom hotkey
  - Premade /hideout on `F5` and /dnd on `F6`
  - Bind websites to hotkeys
  - Navigating storage with Ctrl + MWheel
  - Highlighting items with Alt + F
  - An in game menu to change all settings <details><summary>Click to see image</summary>![menu](img/menu_0.5.2.jpg)</details>

See the [Wiki](https://github.com/PoE-Overlay-Community/PoE-Overlay-Community-Fork/wiki) for further details.

## Getting Started

### Supported Platforms

- Windows 10 x64
- Windows 7 x64 (with keyboard support enabled)
- Linux x64

### Prerequisites

- Path of Exile **_must be_** in windowed fullscreen mode
- PoE Overlay **_should run_** with privileged rights
- You **_may need_** to install [vc_redist](https://support.microsoft.com/en-us/help/2977003/the-latest-supported-visual-c-downloads)

### Installation

Head over to [Releases](https://github.com/PoE-Overlay-Community/PoE-Overlay-Community-Fork/releases) and download one of the following files:

Use `poe-overlay-Setup-<version>.exe` to install locally. This supports auto update / auto launch.

Use `poe-overlay-<version>.exe` for the portable version. This does not support auto update / auto launch.

### Usage

1. Run PoE Overlay
1. Start Path of Exile
1. Wait until you can see `PoE Overlay` in the bottom left corner
1. Hit `F7` and set `Language` and `League` to meet your game settings

### Shortcuts

You can change these shortcuts in the user settings menu.

|Shortcut  |Description
|---       |---
| `Ctrl+D` | Displays the item in a frame and evaluates the price. You can open the offical trade site on click of the currency value
| `F7`     | Opens the user settings menu

<details><summary>Click to see full list</summary>

|Shortcut        |Description
|---             |---	    
| `Ctrl+D`       | Displays the item in a frame and evaluates the price. You can open the offical trade site on click of the currency value
| `Alt+T`        | As above - displays the item translated
| `Alt+W`        | Opens item in wiki
| `Ctrl+Alt+W`   | As above - but in external browser
| `Alt+G`        | Opens item in poedb
| `Ctrl+Alt+G`   | As above - but in external browser
| `Alt+Q`        | Shows map info (layout, bosses)
| `Alt+F`        | Highlights item in stash
| `Ctrl+MWheel`  | Navigates through stash tabs
| `F5`           | Go to Hideout
| `F6`           | Toggle DND
| `F7`           | Opens the user settings menu
| `F8`           | Exits overlay
| `Alt + Num1`   | Open `https://www.poelab.com/`
| `Alt + Num2`   | Open `https://wraeclast.com/`
| `Esc`          | Close latest dialog
| `Space`        | Close all dialogs

</details>

## Roadmap

| Module  | Status      | Notes                                   |
| ------  | ----------- | --------------------------------------- |
| Linux   | In Progress | - Allow running this app on Linux       |
| Harvest | In Progress | - Data for Harvest League 2020/06/19    |
| Vulkan  | In Progress | - Support for Vulkan video modes        |
| Trade   | In Progress | - Send messages<br>- Trade UI<br>- etc. |

## Developer Docs

See [here](DEVELOPERS.md).

## Authors

- **Nicklas Ronge** - _Initial work_ - [Kyusung4698](https://github.com/Kyusung4698)

See also the list of [contributors](https://github.com/PoE-Overlay-Community/PoE-Overlay-Community-Fork/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

- [Grinding Gear Games](https://www.pathofexile.com/) the game
- [PoE TradeMacro](https://github.com/PoE-TradeMacro/POE-TradeMacro) initial inspiration
- [poe.ninja](https://poe.ninja/) currency values
- [libggpk](https://github.com/MuxaJIbI4/libggpk) parsing content.ggpk