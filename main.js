const electron = require("electron");
const user32 = require("./user32");
const { DataType, createPointer, unwrapPointer } = require("ffi-rs");

// https://github.com/winsiderss/systeminformer/blob/4e34a21aa3229efe684fe3e73270b6b1e553602d/phlib/include/guisup.h#L1800C1-L1836C27
const WINDOWCOMPOSITIONATTRIB = {
  WCA_UNDEFINED: 0,
  WCA_NCRENDERING_ENABLED: 1,
  WCA_NCRENDERING_POLICY: 2,
  WCA_TRANSITIONS_FORCEDISABLED: 3,
  WCA_ALLOW_NCPAINT: 4,
  WCA_CAPTION_BUTTON_BOUNDS: 5,
  WCA_NONCLIENT_RTL_LAYOUT: 6,
  WCA_FORCE_ICONIC_REPRESENTATION: 7,
  WCA_EXTENDED_FRAME_BOUNDS: 8,
  WCA_HAS_ICONIC_BITMAP: 9,
  WCA_THEME_ATTRIBUTES: 10,
  WCA_NCRENDERING_EXILED: 11,
  WCA_NCADORNMENTINFO: 12,
  WCA_EXCLUDED_FROM_LIVEPREVIEW: 13,
  WCA_VIDEO_OVERLAY_ACTIVE: 14,
  WCA_FORCE_ACTIVEWINDOW_APPEARANCE: 15,
  WCA_DISALLOW_PEEK: 16,
  WCA_CLOAK: 17,
  WCA_CLOAKED: 18,
  WCA_ACCENT_POLICY: 19,
  WCA_FREEZE_REPRESENTATION: 20,
  WCA_EVER_UNCLOAKED: 21,
  WCA_VISUAL_OWNER: 22,
  WCA_HOLOGRAPHIC: 23,
  WCA_EXCLUDED_FROM_DDA: 24,
  WCA_PASSIVEUPDATEMODE: 25,
  WCA_USEDARKMODECOLORS: 26,
  WCA_CORNER_STYLE: 27,
  WCA_PART_COLOR: 28,
  WCA_DISABLE_MOVESIZE_FEEDBACK: 29,
  WCA_SYSTEMBACKDROP_TYPE: 30,
  WCA_SET_TAGGED_WINDOW_RECT: 31,
  WCA_CLEAR_TAGGED_WINDOW_RECT: 32,
  WCA_LAST: 33
};

// https://github.com/winsiderss/systeminformer/blob/4e34a21aa3229efe684fe3e73270b6b1e553602d/phlib/include/guisup.h#L1882
const ACCENT_STATE = {
  ACCENT_DISABLED: 0,
  ACCENT_ENABLE_GRADIENT: 1,
  ACCENT_ENABLE_TRANSPARENTGRADIENT: 2,
  ACCENT_ENABLE_BLURBEHIND: 3,
  ACCENT_ENABLE_ACRYLICBLURBEHIND: 4,
  ACCENT_ENABLE_HOSTBACKDROP: 5,
  ACCENT_INVALID_STATE: 6
};

// https://github.com/winsiderss/systeminformer/blob/4e34a21aa3229efe684fe3e73270b6b1e553602d/phlib/include/guisup.h#L1893
const ACCENT_FLAG = {
  ACCENT_NONE: 0x0,
  ACCENT_WINDOWS11_LUMINOSITY: 0x2,
  ACCENT_BORDER_LEFT: 0x20,
  ACCENT_BORDER_TOP: 0x40,
  ACCENT_BORDER_RIGHT: 0x80,
  ACCENT_BORDER_BOTTOM: 0x100,
  ACCENT_BORDER_ALL: 0x0 // Placeholder, Updated on next line.
};
ACCENT_FLAG.ACCENT_BORDER_ALL = ACCENT_FLAG.ACCENT_BORDER_LEFT | ACCENT_FLAG.ACCENT_BORDER_TOP | ACCENT_FLAG.ACCENT_BORDER_RIGHT | ACCENT_FLAG.ACCENT_BORDER_BOTTOM;

function setAcrylic(hwnd) {
  const accentPolicy = createPointer({
    paramsType: [{
      AccentState: DataType.I32,
      AccentFlags: DataType.I32,
      GradientColor: DataType.I32,
      AnimationId: DataType.I32,
    }],
    paramsValue: [{
      AccentState: ACCENT_STATE.ACCENT_ENABLE_ACRYLICBLURBEHIND, // Added in RS4 1803
      AccentFlags: ACCENT_FLAG.ACCENT_WINDOWS11_LUMINOSITY | ACCENT_FLAG.ACCENT_BORDER_ALL,
      // Color is in AABBGGRR format, Acrylic can be buggy with alpha = 0 so we use 1
      GradientColor: 0x01FF0000,
      AnimationId: 0,
    }]
  });
  
  const attribData = createPointer({
    paramsType: [{
      Attrib: DataType.I32,
      pvData: DataType.External,
      cbData: DataType.I32
    }],
    paramsValue: [{
      Attrib: WINDOWCOMPOSITIONATTRIB.WCA_ACCENT_POLICY,
      pvData: unwrapPointer(accentPolicy)[0],
      // TODO: Hardcoding this is bad but I'm not sure how to get the size of the struct
      cbData: 16
    }]
  });

  user32.SetWindowCompositionAttribute([hwnd, unwrapPointer(attribData)[0]]);
}

electron.app.on('browser-window-created', async (_event, window) => {
  const hwnd = Number(window.getNativeWindowHandle().readBigInt64LE());
  setAcrylic(hwnd)
});

// Allow for the acrylic effect within electron
class BrowserWindow extends electron.BrowserWindow {
  constructor(options) {
    // TODO: Setting transparent to true isn't ideal, it breaks things like maximizing and shadows
    //       but some apps (ex. Discord) don't render properly without it.
    options.transparent = true;
    // Suposedly this is needed otherwise the "effect will bleed over native window decorations"
    // It's also recommended to create a "custom window decoration" but I'm not sure what that is
    options.frame = false;
    // This is needed to make the window transparent
    options.backgroundColor = '#00000000';
    super(options);
  }
};

// Hook electron imports
const electronExports = new Proxy(electron, {
  get(target, prop) {
    switch (prop) {
      case "BrowserWindow":
        return BrowserWindow;
      // Trick Babel's polyfill thing into not touching Electron's exported object with its logic
      case "default":
        return electronExports;
      case "__esModule":
        return true;
      default:
        return target[prop];
    }
  },
});

const electronPath = require.resolve("electron");
delete require.cache[electronPath].exports;
require.cache[electronPath].exports = electronExports;
