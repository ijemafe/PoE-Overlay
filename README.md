# PoE Overlay (Community Fork)

PoE Overlay is a tool for Path of Exile. The **_core aspect_** is to blend in with the game. Built with Electron and Angular.

<!-- TOC -->

- [Community Development](#community-development)
- [Features](#features)
- [Roadmap](#roadmap)
- [Enduser](#enduser)
- [Developer](#developer)
- [Authors](#authors)
- [License](#license)
- [Acknowledgments](#acknowledgments)
<!-- /TOC -->

## Community Development

This version of PoE Overlay was forked on 2020-06-10 to snapshot the app before it was
converted to closed source.

We have a Discord server [here](https://discord.gg/jqupUW) where we discuss
features, bugs, and development. All are welcome to join.

## Features

[![Feature Overview As Video](img/video.jpg)](https://www.youtube.com/watch?v=_cJmW8QkQnM)

- Evaluation of items:

  - select your preferred currencies and language
  - uses the official pathofexile.com/trade website
  - a graphical display of the price distribution<br><details>![item](img/item_0.5.8.jpg)</details>
  - filter your search on all supported properties on click<br> <details>![item_filter](img/item_filter_0.5.8.jpg)</details>
  - an in game browser to display the created search<br> <details>![browser](img/item_browser_0.5.8.jpg)</details>
  - lets you price tag the item by clicking the desired bar/value

- Customisable keybindings:
  - bind in game commands to a custom hotkey
  - premade /hideout on `F5` and /dnd on `F6`
- Bookmark

  - bind websites on hotkeys

- Misc:

  - Navigating storage by CTRL + WHEEL
  - Highlighting items by ALT + F

- Menu:
  - an in game menu to change all settings<br> <details>![menu](img/menu_0.5.2.jpg)</details>

See the [Wiki](https://github.com/PoE-Overlay-Community/PoE-Overlay-Community-Fork/wiki) for further details.

## Roadmap

| Module | Status | Notes                                   |
| ------ | -----: | --------------------------------------- |
| Linux  |    50% | - Allow running this app on Linux       |
| Trade  |     0% | - Send messages<br>- Trade UI<br>- etc. |

## Instructions

### Supported Platforms

- Windows 10 x64
- Windows 7 x64 (with keyboard support enabled)
- Linux x64

### Prerequisites

- Path of Exile **_must be_** in windowed fullscreen mode
- PoE Overlay **_should run_** with privileged rights
- You **_may need_** to install [vc_redist](https://support.microsoft.com/en-us/help/2977003/the-latest-supported-visual-c-downloads)

### Installation

1. Head over to [Releases](https://github.com/PoE-Overlay-Community/PoE-Overlay-Community-Fork/releases) and download one of the following files
   1. `poe-overlay-Setup-0.6.28.exe` to install locally. This supports auto update/ auto launch.
   1. `poe-overlay-0.6.28.exe` portable version. This does not support auto update/ auto launch.

### Usage

1. Run either of your downloaded file
1. Start Path of Exile
1. Wait until you can see `PoE Overlay 0.6.28` in the bottom left corner
1. Hit `f7` and set `Language` and `League` to meet your game settings

### Shortcuts

You can change these shortcuts in the user settings menu.

| Shortcut | Description                                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------------------------ |
| `ctrl+d` | Displays the item in a frame and evaluates the price. You can open the offical trade site on click of the currency value |
| `f7`     | Opens the user settings menu                                                                                             |

Full list below. Click on `Details`.

<details>
  
|Shortcut        |Description
|---             |---	    
| `ctrl+d`       | Displays the item in a frame and evaluates the price. You can open the offical trade site on click of the currency value
| `alt+t`        | As above - displays the item translated
| `alt+w`        | Opens item in wiki
| `ctrl+alt+w`   | As above - but in external browser
| `alt+g`        | Opens item in poedb
| `ctrl+alt+g`   | As above - but in external browser
| `alt+q`        | Shows map info (layout, bosses)
| `alt+f`        | Highlights item in stash
| `ctrl+wheel`   | Navigates through stash tabs
| `f5`           | Go to Hideout
| `f6`           | Toggle DND
| `f7`           | Opens the user settings menu
| `f8`           | Exits overlay
| `alt + num1`   | Open `https://www.poelab.com/`
| `alt + num2`   | Open `https://wraeclast.com/`
| `esc`          | Close latest dialog
| `space`        | Close all dialogs

</details>

## Developer Documentation

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
