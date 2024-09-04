// src/utils/fileWalker.js
import fs from 'fs';
import path from 'path';
import ignoreFiles from './ignoreFiles.js';

function walkDirectory(dir, fileList = [], baseDir = dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const relativePath = path.relative(baseDir, fullPath);

    if (ignoreFiles.includes(file) || ignoreFiles.some(ignore => fullPath.includes(ignore))) {
      return;
    }

    if (fs.statSync(fullPath).isDirectory()) {
      walkDirectory(fullPath, fileList, baseDir);
    } else {
      const fileContent = fs.readFileSync(fullPath, 'utf-8');
      const contentWithLineNumbers = fileContent.split('\n').map((line, index) => `${index + 1} ${line}`).join('\n');

      fileList.push({
        filename: relativePath,
        content: contentWithLineNumbers,
      });
    }
  });

  return fileList;
}

export default walkDirectory;
