import {
  faImage,
  faFileLines,
  faClipboard,
  faMicrophone,
  faHand,
  faFileContract,
  faTag,
  faLink,
  faFile,
  faGlobe,
  faBook,
  faTriangleExclamation,
  faPalette,
  faBullseye,
  faSquare,
  faRuler,
  faFont,
  faMobileScreen,
  faRotate,
  faEarListen,
  faVolumeXmark,
  faEye,
  faMagnifyingGlass,
  faBrain,
  faBolt,
  faWheelchair,
  faHandFist,
  faSignal,
  faWrench,
  faComment,
  faPersonCane,
  faSun,
  faPen,
  faLaptopCode,
  faFlask,
  faMicroscope,
  faChartColumn,
  faVideo,
  faVolumeHigh,
  faKeyboard,
  faCircle,
  faCheck,
  faFilm,
  faPlay,
  faComments,
  faChartLine,
  faCompass,
  faMap,
  faPersonWalking,
  faHeartPulse,
  faForward,
  faClock,
  faScaleBalanced,
  faQuestion,
  faCookie,
  faLightbulb,
  faBullhorn,
  faLock,
  faMouse,
  faWandMagicSparkles,
} from '@fortawesome/free-solid-svg-icons';

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

/**
 * Maps emoji characters to Font Awesome icon definitions
 */
export const emojiToIcon: Record<string, IconDefinition> = {
  // Tags
  '🖼️': faImage,
  '📝': faFileLines,
  '📋': faClipboard,
  '🎙️': faMicrophone,
  '👋': faHand,
  '📑': faFileContract,
  '🏷️': faTag,
  '🔗': faLink,
  '📄': faFile,
  '🌐': faGlobe,
  '📖': faBook,
  '⚠️': faTriangleExclamation,
  '🎨': faPalette,
  '🌈': faPalette, // Using palette as rainbow alternative
  '🎯': faBullseye,
  '🔷': faSquare,
  '📏': faRuler,
  '🔤': faFont,
  '📱': faMobileScreen,
  '🔄': faRotate,

  // Affected Users
  '👂': faEarListen,
  '🔇': faVolumeXmark,
  '👁️': faEye,
  '🦯': faPersonCane,
  '🔍': faMagnifyingGlass,
  '🧠': faBrain,
  '⚡': faBolt,
  '♿': faWheelchair,
  '🦾': faHandFist,
  '📶': faSignal,
  '🔧': faWrench,
  '🗣️': faComment,
  '👴': faPersonWalking,
  '🩹': faHeartPulse,
  '☀️': faSun,

  // Assignees
  '✍️': faPen,
  '💻': faLaptopCode,
  '🧪': faFlask,
  '🔬': faMicroscope,
  '📊': faChartColumn,
  '🎥': faVideo,

  // Technologies
  '🔊': faVolumeHigh,
  '⌨️': faKeyboard,
  '⚫': faCircle,
  '👆': faHand,
  '✅': faCheck,
  '🎬': faFilm,
  '▶️': faPlay,
  '💬': faComments,
  '📈': faChartLine,
  '🧭': faCompass,
  '🗺️': faMap,

  // Additional icons found in database
  '⏭️': faForward,
  '⏱️': faClock,
  '⚖️': faScaleBalanced,
  '❓': faQuestion,
  '🍞': faCookie,
  '💡': faLightbulb,
  '📢': faBullhorn,
  '🔐': faLock,
  '🖱️': faMouse,
};

/**
 * Gets the Font Awesome icon for a given emoji, or null if not found
 */
export function getIconForEmoji(
  emoji: string | undefined | null
): IconDefinition | null {
  if (!emoji) return null;
  return emojiToIcon[emoji] || null;
}

/**
 * Export the magic wand icon for use in components
 */
export { faWandMagicSparkles };
