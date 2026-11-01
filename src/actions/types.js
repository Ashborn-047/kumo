// ============================================================
// src/actions/types.js — Safety Tiers and Previews
// ============================================================

const TIER = {
  GREEN:  'green',   // silent, no confirmation needed
  YELLOW: 'yellow',  // ask user before doing
  RED:    'red',     // refuse, explain how to do it manually
};

function getPreview(type, args = {}) {
  const previews = {
    'app.open':          `Open application: ${args.name}`,
    'app.deepLink':      `Open deep link: ${args.uri || args.protocol}`,
    'app.interact':      `Send text to ${args.targetApp}: "${(args.text || '').slice(0, 50)}..."`,
    'office.create':     `Create new ${args.type || 'Office'} document: ${args.title || 'Untitled'}`,
    'compound.sequence': `Run multi-step command (${(args.steps || []).length} steps)`,
    'folder.open':       `Open folder: ${args.folderPath}`,
    'powershell.read':   `Run PowerShell: ${args.command}`,
    'powershell.write':  `Run PowerShell task: ${args.command}`,
    'file.write':        `Write file to: ${args.filePath || args.fileName || 'Desktop Note'}`,
    'process.kill':      `Terminate process: ${args.name}`,
    'file.move':         `Move file from ${args.from} to ${args.to}`,
    'system.tasks':      `Retrieve active running tasks and memory usage`,
    'system.lock':       `Lock Windows workstation screen`,
  };
  return previews[type] || `Run action: ${type}`;
}

function getManualInstructions(type, args = {}) {
  const instructions = {
    'file.delete':      `To delete a file:\n1. Open File Explorer\n2. Navigate to the file\n3. Press Delete, then empty Recycle Bin`,
    'software.install': `To install software:\n1. Download the installer from the official website\n2. Run the installer as Administrator`,
    'registry.write':   `To edit the registry:\n1. Press Win+R, type regedit\n2. Navigate to the key and edit manually`,
    'exe.run':          `To run an executable:\n1. Navigate to it in File Explorer\n2. Double-click to run`,
  };
  return instructions[type] || `Please do this step manually for safety.`;
}

module.exports = {
  TIER,
  getPreview,
  getManualInstructions,
};

