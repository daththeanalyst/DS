/**
 * Remotion project config for the DS motion editor.
 *
 * Full option reference: https://remotion.dev/docs/config
 *
 * Notes:
 * - Tailwind is NOT enabled — this project is for video composition, not UI.
 * - When using Node.js APIs directly (programmatic render), this config doesn't
 *   apply; pass options to the API instead.
 */
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
