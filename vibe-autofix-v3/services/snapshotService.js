const fs = require("fs-extra");
const path = require("path");
const { v4: uuid } = require("uuid");
const archiver = require("archiver");
const logger = require("../utils/logger");

const HISTORY_DIR = ".vibe-history";

/**
 * Create a complete snapshot of the workspace
 * @param {string} root - Workspace root path
 * @returns {Promise<string>} Snapshot ID
 */
async function createSnapshot(root) {
  const snapshotId = `snapshot-${Date.now()}-${uuid().substring(0, 8)}`;
  const historyDir = path.join(root, HISTORY_DIR);

  logger.info(`Creating snapshot: ${snapshotId}`);

  try {
    // Ensure history directory exists
    await fs.ensureDir(historyDir);

    const snapshotPath = path.join(historyDir, `${snapshotId}.zip`);

    // Create write stream
    const output = fs.createWriteStream(snapshotPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    // Handle stream events
    output.on("close", () => {
      logger.info(`✅ Snapshot created: ${snapshotId} (${archive.pointer()} bytes)`);
    });

    archive.on("error", (err) => {
      throw err;
    });

    // Pipe archive to file
    archive.pipe(output);

    // Add all files to archive (excluding history and other temp dirs)
    archive.glob("**/*", {
      cwd: root,
      ignore: [
        `${HISTORY_DIR}/**`,
        ".vibe-agent-backup/**",
        "node_modules/**",
        "venv/**",
        "__pycache__/**",
        ".git/**",
        "dist/**",
        "build/**",
        ".next/**",
        "target/**"
      ]
    });

    // Finalize archive
    await archive.finalize();

    // Wait for stream to close
    await new Promise((resolve) => {
      output.on("close", resolve);
    });

    logger.info(`✅ Snapshot saved: ${snapshotPath}`);
    return snapshotId;

  } catch (error) {
    logger.error(`Snapshot creation error: ${error.message}`);
    throw error;
  }
}

/**
 * List all available snapshots
 * @param {string} root - Workspace root path
 * @returns {Promise<Array>} Array of snapshot info
 */
async function listSnapshots(root) {
  const historyDir = path.join(root, HISTORY_DIR);

  try {
    // Check if history directory exists
    if (!await fs.pathExists(historyDir)) {
      return [];
    }

    const files = await fs.readdir(historyDir);
    const snapshots = files
      .filter(f => f.startsWith("snapshot-") && f.endsWith(".zip"))
      .map(f => {
        const fullPath = path.join(historyDir, f);
        const stats = fs.statSync(fullPath);
        return {
          id: f.replace(".zip", ""),
          filename: f,
          path: fullPath,
          size: stats.size,
          created: stats.birthtime
        };
      })
      .sort((a, b) => b.created - a.created); // Most recent first

    return snapshots;

  } catch (error) {
    logger.error(`List snapshots error: ${error.message}`);
    return [];
  }
}

/**
 * Restore a snapshot (extract ZIP to temp location)
 * @param {string} root - Workspace root path
 * @param {string} snapshotId - Snapshot ID to restore
 * @returns {Promise<string>} Path to extracted snapshot
 */
async function restoreSnapshot(root, snapshotId) {
  const historyDir = path.join(root, HISTORY_DIR);
  const snapshotPath = path.join(historyDir, `${snapshotId}.zip`);

  logger.info(`Restoring snapshot: ${snapshotId}`);

  try {
    // Check if snapshot exists
    if (!await fs.pathExists(snapshotPath)) {
      throw new Error(`Snapshot not found: ${snapshotId}`);
    }

    // Create temp restore directory
    const restoreDir = path.join(historyDir, `restore-${Date.now()}`);
    await fs.ensureDir(restoreDir);

    // Extract ZIP
    const extract = require("extract-zip");
    await extract(snapshotPath, { dir: restoreDir });

    logger.info(`✅ Snapshot extracted to: ${restoreDir}`);
    return restoreDir;

  } catch (error) {
    logger.error(`Snapshot restore error: ${error.message}`);
    throw error;
  }
}

/**
 * Delete old snapshots (keep only N most recent)
 * @param {string} root - Workspace root path
 * @param {number} keepCount - Number of snapshots to keep
 */
async function cleanupOldSnapshots(root, keepCount = 10) {
  logger.info(`Cleaning up old snapshots (keeping ${keepCount})`);

  try {
    const snapshots = await listSnapshots(root);

    if (snapshots.length <= keepCount) {
      logger.info("No cleanup needed");
      return;
    }

    // Delete old snapshots
    const toDelete = snapshots.slice(keepCount);

    for (const snapshot of toDelete) {
      await fs.remove(snapshot.path);
      logger.info(`Deleted old snapshot: ${snapshot.id}`);
    }

    logger.info(`✅ Cleaned up ${toDelete.length} old snapshots`);

  } catch (error) {
    logger.error(`Snapshot cleanup error: ${error.message}`);
  }
}

module.exports = {
  createSnapshot,
  listSnapshots,
  restoreSnapshot,
  cleanupOldSnapshots
};
