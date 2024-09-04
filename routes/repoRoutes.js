import { Router } from 'express';
import simpleGit from 'simple-git';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import walkDirectory from '../utils/fileWalker.js';
import generateDirectoryTree from '../utils/directoryTree.js';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

router.post('/clone-repo', async (req, res) => {
  const { repoUrl, mac_id } = req.body;

  if (!repoUrl || !mac_id) {
    return res.status(400).json({ error: 'Repository URL and MAC ID are required' });
  }

  const repoName = path.basename(repoUrl, '.git');
  const cloneDir = path.join(__dirname, '..', '..', 'clones', repoName);

  try {
    // Clean up previous clone if exists
    if (fs.existsSync(cloneDir)) {
      fs.rmSync(cloneDir, { recursive: true, force: true });
    }

    // Clone the repository
    const git = simpleGit();
    await git.clone(repoUrl, cloneDir, {
      '--depth': 1,
      '--single-branch': null,
    });

    // Walk through the files and collect metadata
    const { fileList, totalSize, fileCount } = walkDirectory(cloneDir);

    // Optionally generate the directory tree (if needed)
    const directoryTree = generateDirectoryTree(cloneDir);

    res.json({
      fileCount,
      totalSizeKB: totalSize,
      files: fileList,
      directoryTree, // Optional, remove if not needed
    });
  } catch (error) {
    console.error('Error cloning repository or processing files:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    // Clean up
    if (fs.existsSync(cloneDir)) {
      fs.rmSync(cloneDir, { recursive: true, force: true });
    }
  }
});

export default router;
