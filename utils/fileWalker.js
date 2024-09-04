import fs from 'fs';
import path from 'path';
import ignoreFiles from './ignoreFiles.js';
import { isBinaryFileSync } from 'isbinaryfile';

// Helper function to check if a file matches any ignore pattern
function shouldIgnore(filePath) {
  return ignoreFiles.some(pattern => {
    const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\./g, '\\.'));
    return regex.test(filePath);
  });
}

function walkDirectory(dir, fileList = [], baseDir = dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const relativePath = path.relative(baseDir, fullPath);

    // Ignore files based on patterns
    if (shouldIgnore(relativePath)) {
      return;
    }

    if (fs.statSync(fullPath).isDirectory()) {
      walkDirectory(fullPath, fileList, baseDir);
    } else {
      try {
        // Check if the file is binary using the isbinaryfile library
        const isBinary = isBinaryFileSync(fullPath);
        const extension = path.extname(fullPath).toLowerCase();

        // If the file is binary or matches a common binary extension, skip it
        if (isBinary || ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.svg', '.webp', '.mp3', '.wav', '.mp4', '.avi', '.mkv', '.pdf', '.zip'].includes(extension)) {
          console.warn(`Skipping binary file: ${relativePath}`);
          return;
        }

        // Attempt to read the file as UTF-8 text
        const fileContent = fs.readFileSync(fullPath, 'utf-8');
        const contentWithLineNumbers = fileContent.split('\n').map((line, index) => `${index + 1} ${line}`).join('\n');

        // Adjusted to use the repo root as the base for the path
        const repoRelativePath = `/${relativePath}`;

        fileList.push({
          path: repoRelativePath,
          content: contentWithLineNumbers,
        });
      } catch (err) {
        console.warn(`Failed to read file as UTF-8 text: ${relativePath}, skipping...`);
      }
    }
  });

  return fileList;
}

export default walkDirectory;
