# Acrylic
**Acrylic** is a relatively lightweight kernel mod that enables the Windows 11 Acrylic effect across all Electron-based applications. With Acrylic, you can enjoy the modern, translucent design aesthetic of Windows 11 in apps that otherwise do not natively support this feature.

## Features
- Brings Windows 11's Acrylic effect to Electron apps
- Lightweight and efficient

## Installation
To install Acrylic, follow these steps:

1. Download [kernel](https://kernel.fish) and follow the setup instructions.
2. Navigate to your kernel packages directory
3. `$ git clone https://github.com/EastArctica/acrylic`
4. `$ cd acrylic`
5. `$ pnpm i`
6. Profit?

## Notes
- **Tested Applications**:
  - [x] Discord Stable (317392)
  - [x] Discord Canary (317408)
  - [ ] Obsidian.md (v1.6.7)
    - Major rendering issues
  - [ ] Visual Studio Code (1.92.1)
    - Refuses to load with Kernel
    - Acrylic effect itself is working, just not the app itself
  - [ ] Unity Hub
    - Seems to be an incompatibility with Kernel
  - [x] NZXT CAM
    - Acrylic works, kernel fixes below
    - Requires renaming `app.asar.unpacked` to `app-original.asar.unpacked`
    - Requires resources/app/package.json to container `version` and `name` keys
- **Known Issues**:
  - Apps show as blue in the Alt+Tab menu.
    - This is due to setting the acrylic tint color to `0x01FF0000` and can be changed to any other color.
    - Note: The current tint color was not picked for any specific reason.

## Contributing
Contributions are welcome! Please submit issues or pull requests on the [GitHub repository](https://github.com/EastArctica/acrylic).

## License
Acrylic is licensed under the MIT License. See the [LICENSE](https://github.com/EastArctica/acrylic/blob/main/LICENSE) file for more information.
