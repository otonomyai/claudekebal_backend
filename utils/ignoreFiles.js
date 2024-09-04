// src/utils/ignoreFiles.js

const ignoreFiles = [
  'node_modules',
  'package-lock.json',
  '.git',
  '.DS_Store',
  'assets', // Ignore the entire assets folder
  '*.jpg', '*.jpeg', '*.png', '*.gif', '*.bmp', '*.tiff', '*.svg', '*.webp',
  '*.mp3', '*.wav', '*.ogg', '*.flac', '*.aac',
  '*.mp4', '*.avi', '*.mkv', '*.mov', '*.wmv',
  '*.zip', '*.tar', '*.gz', '*.rar', '*.7z',
  '*.pdf', '*.doc', '*.docx', '*.ppt', '*.pptx', '*.xls', '*.xlsx',
  '*.exe', '*.dll', '*.bin', '*.iso', '*.img', '*.dmg',
];

export default ignoreFiles;
