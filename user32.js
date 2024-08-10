const { open, close, define, DataType } = require('ffi-rs');

open({
  library: 'user32',
  path: 'C:\\Windows\\System32\\user32.dll',
});

module.exports = define({
  SetWindowCompositionAttribute: {
    library: 'user32',
    retType: DataType.Boolean,
    paramsType: [DataType.I64, DataType.External],
  },
});

// We should clean up, but it will be done automatically when the process exits (I think)
// close('user32');
