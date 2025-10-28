/**
 * STANDALONE TAB BAR COMPONENT - COMPLETE SELF-CONTAINED APP
 * 
 * This is a fully self-contained version of the Sparo TabBar system.
 * It includes all functionality without external dependencies (except React, Motion, and Tailwind).
 * 
 * FEATURES:
 * ✅ Mobile-first fixed bottom navigation bar with task name pill
 * ✅ Horizontal swipe to switch tabs (with visual sliding animations)
 * ✅ Vertical swipe to open tab switcher overlay
 * ✅ Direction-locked drag interactions
 * ✅ Inline tab name editing (double-click/tap)
 * ✅ Task name editing (click/tap)
 * ✅ Synchronized sliding animations with Motion (Framer Motion)
 * ✅ Smart tab indicators (max 5 dots)
 * ✅ Blank tab with 2x2 canvas type selector grid
 * ✅ Canvas type selection (Doc, Sheet, Comm, Chat)
 * ✅ Tab creation (swipe left from last tab)
 * ✅ Tab switcher with "New Tab" button
 * ✅ Tab closing from switcher (with smart fallback to new blank tab)
 * ✅ Canvas area with synchronized sliding animations
 * ✅ Inactive tab indicators (peek of adjacent tabs)
 * ✅ Complete state management (in-memory, no persistence)
 * 
 * DEPENDENCIES:
 * - React (with hooks)
 * - Motion (motion/react) - for animations
 * - TypeScript
 * - Tailwind CSS
 * 
 * NOTE: This file uses in-memory state only (no browser storage or backend).
 */

import { useState, useEffect, useRef } from 'react';
import { motion, MotionValue, useMotionValue, animate } from 'motion/react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Canvas types that a tab can contain
 */
type CanvasType = 'doc' | 'sheet' | 'comm' | 'chat';

/**
 * Represents a single tab within a task
 */
interface Tab {
  id: string;
  name: string;
  canvasType: CanvasType | null; // null means blank tab (no canvas selected yet)
  createdAt: number; // Unix timestamp for chronological ordering
  isActive: boolean;
  commentCount: number;
}

/**
 * Represents a task containing multiple tabs
 */
interface Task {
  id: string;
  name: string;
  tabs: Tab[];
}

// ============================================================================
// SVG PATH DATA
// ============================================================================

/**
 * SVG paths for all icons used in the app
 * Extracted from Figma imports
 */
const SVG_PATHS = {
  // TabBar icons
  editHistory: "M15.3945 5.90039C16.7399 5.90039 18.0019 6.15026 19.1787 6.65137C20.3538 7.15173 21.3814 7.83749 22.2607 8.70801C23.1399 9.57841 23.8331 10.5942 24.3398 11.7549C24.8475 12.9177 25.1004 14.1663 25.0996 15.499C25.0988 16.8316 24.8458 18.0807 24.3398 19.2441C23.8346 20.4056 23.1415 21.4228 22.2607 22.2939C21.3799 23.1651 20.3521 23.8499 19.1787 24.3486C18.0035 24.8482 16.7423 25.098 15.3945 25.0996C13.0667 25.0995 11.0209 24.3929 9.26172 22.9785C7.50273 21.5643 6.39146 19.7499 5.92969 17.5391L5.93066 17.5381C5.87683 17.3418 5.8954 17.1549 5.99316 16.9834C6.09468 16.8053 6.25672 16.7023 6.4668 16.6748L6.60938 16.668C6.74833 16.6739 6.87621 16.7191 6.99023 16.8047L7.09375 16.8975C7.15636 16.9646 7.20753 17.0428 7.24805 17.1309L7.30078 17.2715L7.30273 17.2773V17.2783C7.73153 19.1433 8.69848 20.6805 10.2051 21.8936C11.711 23.1061 13.4394 23.7128 15.3945 23.7129C17.7101 23.7129 19.6709 22.9159 21.2822 21.3223C22.8934 19.7287 23.6984 17.7899 23.6992 15.5C23.7 13.2101 22.895 11.2713 21.2822 9.67773C19.6693 8.08401 17.7084 7.28711 15.3945 7.28711C14.1661 7.28716 13.0132 7.54399 11.9346 8.05664C10.9225 8.53696 10.0228 9.18898 9.23242 10.0098H11.376C11.5712 10.0098 11.74 10.0765 11.875 10.21C12.0102 10.3436 12.077 10.5109 12.0762 10.7051C12.0753 10.8985 12.0092 11.0654 11.876 11.1982C11.7421 11.3316 11.5724 11.3975 11.376 11.3975H7.96094C7.66159 11.3975 7.40564 11.2959 7.2002 11.0928C6.99468 10.8895 6.8916 10.6359 6.8916 10.3389V6.95996C6.8916 6.76584 6.95943 6.59872 7.09473 6.46582C7.22958 6.33337 7.39751 6.26653 7.5918 6.26562C7.78664 6.2648 7.95493 6.33149 8.08984 6.46582C8.22451 6.59993 8.29199 6.76713 8.29199 6.95996V8.9541C9.1913 8.02323 10.2307 7.28806 11.4141 6.75391C12.6741 6.18519 14.0014 5.90123 15.3945 5.90039ZM15.4648 9.46289C15.66 9.46297 15.8286 9.52938 15.9629 9.66309C16.0967 9.79658 16.1641 9.96318 16.1641 10.1562V15.2109L19.7363 18.7441C19.8665 18.873 19.936 19.0332 19.9453 19.2188C19.9549 19.4126 19.8811 19.5831 19.7354 19.7266C19.592 19.8683 19.4272 19.9462 19.2422 19.9463C19.0557 19.9463 18.889 19.8697 18.7461 19.7275L15.084 16.1055V16.1045C14.9716 15.9939 14.8877 15.8742 14.8369 15.7451C14.7877 15.6198 14.7627 15.49 14.7627 15.3564V10.1562C14.7627 9.9621 14.8305 9.79502 14.9658 9.66211C15.1008 9.52874 15.2697 9.46289 15.4648 9.46289Z",
  undo: "M10.1967 20.8033C11.0688 21.6755 12.1426 22.319 13.3229 22.6771C14.5031 23.0351 15.7535 23.0965 16.9632 22.8559C18.1729 22.6153 19.3045 22.08 20.2579 21.2976C21.2114 20.5151 21.9571 19.5096 22.4291 18.3701C22.9011 17.2306 23.0848 15.9923 22.9639 14.7649C22.843 13.5375 22.4213 12.3588 21.736 11.3333C21.0508 10.3077 20.1232 9.46703 19.0355 8.88561C17.9478 8.3042 16.7334 8.00001 15.5 8C12.1184 8 10.0683 10.2542 8 12.5833M8 12.5833V9.25M8 12.5833H11.3333",
  home: "M17.501 5.40039C18.1582 5.40042 18.7936 5.62663 19.2842 6.03809L28.7119 13.9473C28.9906 14.1813 29.2141 14.4684 29.3672 14.7891C29.5202 15.1097 29.5995 15.457 29.5996 15.8086V27.0996C29.5995 27.765 29.317 28.4018 28.8154 28.8701C28.314 29.3382 27.635 29.5996 26.9287 29.5996H22.6426C21.9363 29.5995 21.2572 29.3382 20.7559 28.8701C20.2544 28.4018 19.9717 27.765 19.9717 27.0996V21.498C19.9717 21.3146 19.8933 21.1368 19.752 21.0049C19.6104 20.8729 19.4167 20.7979 19.2139 20.7979H15.7861C15.5833 20.7979 15.3896 20.8729 15.248 21.0049C15.1067 21.1368 15.0283 21.3146 15.0283 21.498V27.0996C15.0283 27.765 14.7456 28.4018 14.2441 28.8701C13.7428 29.3382 13.0637 29.5995 12.3574 29.5996H8.07129C7.36497 29.5996 6.68597 29.3382 6.18457 28.8701C5.68303 28.4018 5.40045 27.765 5.40039 27.0996V15.8086C5.40039 15.0976 5.72234 14.4215 6.28906 13.9473L15.7178 6.03809C16.2083 5.62661 16.8437 5.40039 17.501 5.40039ZM17.5 7.20117C17.3114 7.20117 17.1299 7.26559 16.9912 7.38184L7.56348 15.291C7.48482 15.3569 7.42159 15.4374 7.37891 15.5264C7.33626 15.6153 7.3147 15.7117 7.31445 15.8086V27.0996C7.31451 27.2828 7.39217 27.46 7.5332 27.5918C7.67472 27.7239 7.8684 27.7998 8.07129 27.7998H12.3574C12.5602 27.7997 12.7531 27.7238 12.8945 27.5918C13.0358 27.4599 13.1142 27.2829 13.1143 27.0996V21.498C13.1143 20.8325 13.3977 20.1959 13.8994 19.7275C14.4008 19.2594 15.0798 18.9971 15.7861 18.9971H19.2139C19.9202 18.9971 20.5992 19.2594 21.1006 19.7275C21.6023 20.1959 21.8857 20.8325 21.8857 21.498V27.0996C21.8858 27.2829 21.9642 27.4599 22.1055 27.5918C22.2469 27.7238 22.4398 27.7997 22.6426 27.7998H26.9287C27.1316 27.7998 27.3253 27.7239 27.4668 27.5918C27.6078 27.46 27.6855 27.2828 27.6855 27.0996V15.8086L27.6816 15.7363C27.6734 15.6642 27.6531 15.5932 27.6211 15.5264C27.5784 15.4374 27.5152 15.3569 27.4365 15.291L18.0088 7.38184C17.8701 7.26559 17.6886 7.20117 17.5 7.20117Z",
  switcher: "M19.0574 3.52813C20.4478 3.5282 21.7813 4.0811 22.7645 5.06426C23.7476 6.04744 24.2996 7.38088 24.2996 8.77129V19.0574C24.2995 20.4478 23.7476 21.7813 22.7645 22.7645C21.7813 23.7476 20.4478 24.2995 19.0574 24.2996H8.77129C7.38088 24.2996 6.04744 23.7476 5.06426 22.7645C4.0811 21.7813 3.5282 20.4478 3.52813 19.0574V8.77129C3.52816 7.38085 4.08106 6.04745 5.06426 5.06426C6.04745 4.08106 7.38085 3.52816 8.77129 3.52813H19.0574ZM8.77129 5.44316C7.88855 5.4432 7.04197 5.79358 6.41777 6.41777C5.79358 7.04197 5.4432 7.88855 5.44316 8.77129V19.0574C5.44324 19.9401 5.79361 20.7868 6.41777 21.4109C7.04196 22.0351 7.88858 22.3855 8.77129 22.3855H19.0574C19.9401 22.3855 20.7868 22.0351 21.4109 21.4109C22.0351 20.7868 22.3855 19.9401 22.3855 19.0574V8.77129C22.3855 7.88858 22.0351 7.04196 21.4109 6.41777C20.7868 5.79361 19.9401 5.44324 19.0574 5.44316H8.77129ZM15.6287 0.100391C17.1876 0.100431 18.5877 0.782167 19.5486 1.86016L19.7098 2.04082L19.4676 2.02617C19.331 2.01808 19.1942 2.01424 19.0574 2.01445H7.91387C6.34924 2.01456 4.84836 2.63563 3.74199 3.74199C2.63563 4.84836 2.01456 6.34924 2.01445 7.91387V19.0574C2.01446 19.1936 2.0183 19.3303 2.02617 19.4676L2.03984 19.7088L1.86016 19.5486C1.30665 19.0567 0.863684 18.4527 0.560352 17.7771C0.257039 17.1015 0.100243 16.3693 0.100391 15.6287V7.91387C0.100501 5.84154 0.923112 3.85384 2.38848 2.38848C3.85384 0.923112 5.84154 0.100502 7.91387 0.100391H15.6287Z",
  sparo: "M23.509 4.90685L24.1215 4.11645C23.7713 3.84496 23.2841 3.83641 22.9245 4.09545L23.509 4.90685ZM29 9.16264L29.1718 10.1478C29.5619 10.0797 29.8751 9.78792 29.9705 9.40359C30.066 9.01926 29.9256 8.61482 29.6126 8.37224L29 9.16264ZM22.7071 10.26L22.5353 9.27487C22.0161 9.3654 21.6563 9.84333 21.7128 10.3673L22.7071 10.26ZM23.6422 18.9248L24.177 19.7698C24.4992 19.5659 24.6773 19.1966 24.6364 18.8175L23.6422 18.9248ZM10.8852 27L9.95767 26.6262C9.7954 27.0289 9.91148 27.4903 10.245 27.7682C10.5785 28.0461 11.0532 28.0772 11.42 27.845L10.8852 27ZM5.66323 1.00001L6.18376 0.146168C5.81162 -0.080702 5.33541 -0.0404199 5.00666 0.245736C4.67792 0.531892 4.57238 0.998007 4.74578 1.39787L5.66323 1.00001ZM1 4.73786L1.24963 3.76952C0.836045 3.66291 0.400403 3.83073 0.165237 4.18726C-0.0699284 4.54379 -0.0527023 5.01032 0.208116 5.34853L1 4.73786ZM18.2664 8.68336L18.8509 9.49476L24.0935 5.71824L23.509 4.90685L22.9245 4.09545L17.6819 7.87196L18.2664 8.68336ZM23.509 4.90685L22.8964 5.69724L28.3874 9.95304L29 9.16264L29.6126 8.37224L24.1215 4.11645L23.509 4.90685ZM29 9.16264L28.8282 8.1775L22.5353 9.27487L22.7071 10.26L22.8788 11.2451L29.1718 10.1478L29 9.16264ZM22.7071 10.26L21.7128 10.3673L22.648 19.0321L23.6422 18.9248L24.6364 18.8175L23.7013 10.1527L22.7071 10.26ZM23.6422 18.9248L23.1073 18.0799L10.3503 26.1551L10.8852 27L11.42 27.845L24.177 19.7698L23.6422 18.9248ZM10.8852 27L11.8127 27.3738L19.1939 9.05713L18.2664 8.68336L17.3388 8.30959L9.95767 26.6262L10.8852 27ZM18.2664 8.68336L18.7869 7.82952L6.18376 0.146168L5.66323 1.00001L5.14269 1.85385L17.7458 9.5372L18.2664 8.68336ZM5.66323 1.00001L4.74578 1.39787L12.8829 20.1619L13.8004 19.764L14.7178 19.3661L6.58067 0.60215L5.66323 1.00001ZM8.07605 6.56197L8.32568 5.59362L1.24963 3.76952L1 4.73786L0.750377 5.70621L7.82643 7.53031L8.07605 6.56197ZM1 4.73786L0.208116 5.34853L12.593 21.4086L13.3848 20.7979L14.1767 20.1872L1.79189 4.1272L1 4.73786ZM23.5092 4.90802L22.5202 4.75973L21.7179 10.1105L22.7068 10.2588L23.6958 10.4071L24.4981 5.05631L23.5092 4.90802ZM23.6408 18.9238L24.5262 18.4591L19.1518 8.21865L18.2664 8.68336L17.3809 9.14807L22.7553 19.3886L23.6408 18.9238Z",
  blankCanvas: "M10.2846 3.9375V0.5625C10.2846 0.2475 10.0332 0 9.71322 0H1.14273C0.514229 0 0 0.50625 0 1.125V16.875C0 17.4938 0.514229 18 1.14273 18H14.8555C15.484 18 15.9982 17.4938 15.9982 16.875V6.1875C15.9982 5.8725 15.7468 5.625 15.4269 5.625H11.9987C11.0502 5.625 10.2846 4.87125 10.2846 3.9375ZM11.4273 0.5625V3.375C11.4273 3.99375 11.9415 4.5 12.57 4.5H15.4269C15.9411 4.5 16.1925 3.8925 15.8268 3.54375L12.3986 0.16875C12.0444 -0.19125 11.4273 0.0674999 11.4273 0.5625Z",
  
  // Canvas type icons - SMALL version (< 500px)
  docIconSmall: "M40.2143 15.6406V2.23437C40.2143 0.983125 39.2313 0 37.9802 0H4.46826C2.01072 0 0 2.01094 0 4.46875V67.0313C0 69.4891 2.01072 71.5 4.46826 71.5H58.0874C60.5449 71.5 62.5556 69.4891 62.5556 67.0313V24.5781C62.5556 23.3269 61.5726 22.3438 60.3215 22.3438H46.9167C43.2081 22.3438 40.2143 19.3497 40.2143 15.6406ZM46.9167 53.625H14.9387C13.6876 53.625 12.7046 52.6419 12.7046 51.3906C12.7046 50.1394 13.6876 49.1562 14.9387 49.1562H46.9167C48.1678 49.1562 49.1509 50.1394 49.1509 51.3906C49.1509 52.6419 48.1678 53.625 46.9167 53.625ZM46.9167 44.6875H14.9387C13.6876 44.6875 12.7046 43.7044 12.7046 42.4531C12.7046 41.2019 13.6876 40.2188 14.9387 40.2188H46.9167C48.1678 40.2188 49.1509 41.2019 49.1509 42.4531C49.1509 43.7044 48.1678 44.6875 46.9167 44.6875ZM46.9167 35.75H14.9387C13.6876 35.75 12.7046 34.7669 12.7046 33.5156C12.7046 32.2644 13.6876 31.2812 14.9387 31.2812H46.9167C48.1678 31.2812 49.1509 32.2644 49.1509 33.5156C49.1509 34.7669 48.1678 35.75 46.9167 35.75ZM44.6826 2.23437V13.4063C44.6826 15.8641 46.6933 17.875 49.1509 17.875H60.3215C62.3322 17.875 63.3152 15.4619 61.8854 14.0766L48.4806 0.670313C47.0955 -0.759688 44.6826 0.268125 44.6826 2.23437Z",
  
  sheetIconSmall: "M40.2143 15.6406V2.23438C40.2143 0.983125 39.2313 0 37.9802 0H4.46826C2.01072 0 0 2.01094 0 4.46875V67.0313C0 69.4891 2.01072 71.5 4.46826 71.5H58.0874C60.5449 71.5 62.5556 69.4891 62.5556 67.0313V24.5781C62.5556 23.3269 61.5726 22.3438 60.3215 22.3438H46.9167C43.2081 22.3438 40.2143 19.3497 40.2143 15.6406ZM24.5754 53.625H15.6389C14.3878 53.625 13.4048 52.6419 13.4048 51.3906C13.4048 50.1394 14.3878 49.1563 15.6389 49.1563H24.5754C25.8265 49.1563 26.8096 50.1394 26.8096 51.3906C26.8096 52.6419 25.8265 53.625 24.5754 53.625ZM24.5754 44.6875H15.6389C14.3878 44.6875 13.4048 43.7044 13.4048 42.4531C13.4048 41.2019 14.3878 40.2188 15.6389 40.2188H24.5754C25.8265 40.2188 26.8096 41.2019 26.8096 42.4531C26.8096 43.7044 25.8265 44.6875 24.5754 44.6875ZM24.5754 35.75H15.6389C14.3878 35.75 13.4048 34.7669 13.4048 33.5156C13.4048 32.2644 14.3878 31.2813 15.6389 31.2813H24.5754C25.8265 31.2813 26.8096 32.2644 26.8096 33.5156C26.8096 34.7669 25.8265 35.75 24.5754 35.75ZM46.9167 53.625H33.512C32.2608 53.625 31.2778 52.6419 31.2778 51.3906C31.2778 50.1394 32.2608 49.1563 33.512 49.1563H46.9167C48.1678 49.1563 49.1509 50.1394 49.1509 51.3906C49.1509 52.6419 48.1678 53.625 46.9167 53.625ZM46.9167 44.6875H33.512C32.2608 44.6875 31.2778 43.7044 31.2778 42.4531C31.2778 41.2019 32.2608 40.2188 33.512 40.2188H46.9167C48.1678 40.2188 49.1509 41.2019 49.1509 42.4531C49.1509 43.7044 48.1678 44.6875 46.9167 44.6875ZM46.9167 35.75H33.512C32.2608 35.75 31.2778 34.7669 31.2778 33.5156C31.2778 32.2644 32.2608 31.2813 33.512 31.2813H46.9167C48.1678 31.2813 49.1509 32.2644 49.1509 33.5156C49.1509 34.7669 48.1678 35.75 46.9167 35.75ZM44.6826 2.23438V13.4063C44.6826 15.8641 46.6933 17.875 49.1509 17.875H60.3215C62.3322 17.875 63.3153 15.4619 61.8854 14.0766L48.4806 0.670313C47.0955 -0.759687 44.6826 0.268125 44.6826 2.23438Z",
  
  commIconSmallClipRule: "M37.98 0C39.2311 0 40.2144 0.983125 40.2144 2.23438V15.6406C40.2144 19.3497 43.208 22.3437 46.9166 22.3438H60.3211C61.5723 22.3438 62.5555 23.3269 62.5555 24.5781V67.0313C62.5555 69.489 60.5451 71.4999 58.0876 71.5H4.46788C2.01051 71.4998 0 69.4889 0 67.0313V4.46875C0 2.01107 2.01051 0.00020899 4.46788 0H37.98ZM47.3085 30.8702C46.791 30.7766 46.3761 30.8945 46.3065 30.9129C46.0532 30.9799 45.8445 31.0816 45.7715 31.1172C45.5685 31.216 45.3354 31.3497 45.1169 31.4802C44.6578 31.7546 44.0271 32.1565 43.3024 32.6289C41.8441 33.5792 39.9052 34.8807 37.9713 36.1855C36.029 37.496 34.0931 38.8093 32.6158 39.7989C32.1054 40.1408 31.6548 40.4386 31.283 40.6831C30.9103 40.4377 30.4592 40.1383 29.9476 39.7954C28.4697 38.805 26.5338 37.4931 24.5912 36.1829C22.6569 34.8782 20.7178 33.577 19.2593 32.6271C18.5345 32.1551 17.9039 31.7535 17.4447 31.4794C17.2262 31.349 16.9932 31.2151 16.7901 31.1163C16.717 31.0808 16.5078 30.9798 16.2542 30.9129C16.1838 30.8943 15.7698 30.7774 15.2531 30.871C14.9551 30.9251 14.4459 31.0817 14.0102 31.5483C13.5429 32.0489 13.4064 32.64 13.4062 33.081V51.8375L13.4176 52.0662C13.5321 53.1928 14.4838 54.0718 15.6406 54.0719C16.8746 54.0719 17.875 53.0715 17.875 51.8375V37.0644C19.1255 37.8909 20.6017 38.8825 22.0924 39.888C24.0201 41.1881 25.9748 42.5127 27.4592 43.5075C28.2012 44.0047 28.839 44.4282 29.3044 44.7294C29.5343 44.8782 29.7395 45.0085 29.9005 45.1056C29.9773 45.1519 30.071 45.2073 30.1641 45.2566C30.2075 45.2796 30.2856 45.3201 30.3805 45.3604C30.4275 45.3804 30.5107 45.4138 30.6153 45.446C30.6853 45.4675 30.9305 45.5423 31.2533 45.5463C31.5901 45.5506 31.8469 45.4753 31.9201 45.4538C32.0294 45.4218 32.1156 45.3878 32.1645 45.3674C32.2635 45.3262 32.3452 45.2851 32.3897 45.2618C32.4854 45.2117 32.5812 45.1555 32.6585 45.1091C32.8209 45.0117 33.0271 44.8816 33.2573 44.7329C33.7232 44.4319 34.3606 44.0087 35.1024 43.5118C36.5874 42.517 38.542 41.1915 40.4701 39.8906C41.9608 38.8848 43.437 37.8923 44.6875 37.0653V51.8375L44.6988 52.0662C44.8134 53.1928 45.7651 54.0719 46.9219 54.0719C48.0787 54.0719 49.0304 53.1928 49.1449 52.0662L49.1562 51.8375V33.081C49.1562 32.6402 49.0199 32.0492 48.5523 31.5483C48.1162 31.0813 47.6066 30.9241 47.3085 30.8702Z",
  commIconSmallPath2: "M44.6823 2.23438C44.6823 0.268125 47.0955 -0.759687 48.4807 0.670313L61.8852 14.0766C63.315 15.4619 62.3319 17.875 60.3211 17.875H49.151C46.6935 17.875 44.6823 15.8641 44.6823 13.4063V2.23438Z",
  
  chatIconSmall: "M40.2143 15.6406V2.23438C40.2143 0.983125 39.2313 0 37.9802 0H4.46826C2.01072 0 0 2.01094 0 4.46875V67.0313C0 69.4891 2.01072 71.5 4.46826 71.5H58.0874C60.5449 71.5 62.5556 69.4891 62.5556 67.0313V24.5781C62.5556 23.3269 61.5726 22.3438 60.3215 22.3438H46.9167C43.2081 22.3438 40.2143 19.3497 40.2143 15.6406ZM33.5105 53.625H14.9387C13.6876 53.625 12.7046 52.6419 12.7046 51.3906C12.7046 50.1394 13.6876 49.1563 14.9387 49.1563H33.5105C34.7616 49.1563 35.7446 50.1394 35.7446 51.3906C35.7446 52.6419 34.7616 53.625 33.5105 53.625ZM46.9167 44.6875H22.9825C21.7313 44.6875 20.7483 43.7044 20.7483 42.4531C20.7483 41.2019 21.7313 40.2188 22.9825 40.2188H46.9167C48.1678 40.2188 49.1509 41.2019 49.1509 42.4531C49.1509 43.7044 48.1678 44.6875 46.9167 44.6875ZM42.448 35.75H14.9387C13.6876 35.75 12.7046 34.7669 12.7046 33.5156C12.7046 32.2644 13.6876 31.2813 14.9387 31.2813H42.448C43.6991 31.2813 44.6821 32.2644 44.6821 33.5156C44.6821 34.7669 43.6991 35.75 42.448 35.75ZM44.6826 2.23438V13.4063C44.6826 15.8641 46.6933 17.875 49.1509 17.875H60.3215C62.3322 17.875 63.3152 15.4619 61.8854 14.0766L48.4806 0.670313C47.0955 -0.759688 44.6826 0.268125 44.6826 2.23438Z",
};

// ============================================================================
// CANVAS ICON COMPONENT
// ============================================================================

interface CanvasIconProps {
  canvasType: CanvasType | null;
}

function CanvasIcon({ canvasType }: CanvasIconProps) {
  // Blank canvas icon (when no canvas type is selected)
  if (canvasType === null) {
    return (
      <div className="h-[18px] relative shrink-0 w-[16px]" data-name="Tab-Icon">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 18">
          <g id="Tab-Icon">
            <path 
              d={SVG_PATHS.blankCanvas}
              fill="var(--fill-0, #8E8E93)" 
              id="Icons/Blank-Canvas"
            />
          </g>
        </svg>
      </div>
    );
  }

  // Render specific canvas type icon (small variant for tab bar)
  switch (canvasType) {
    case 'doc':
      return (
        <div className="h-[18px] relative shrink-0 w-[16px]" data-name="Doc-Icon">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 63 72">
            <path d={SVG_PATHS.docIconSmall} fill="var(--fill-0, #0A84FF)" />
          </svg>
        </div>
      );
    
    case 'sheet':
      return (
        <div className="h-[18px] relative shrink-0 w-[16px]" data-name="Sheet-Icon">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 63 72">
            <path d={SVG_PATHS.sheetIconSmall} fill="var(--fill-0, #34C759)" />
          </svg>
        </div>
      );
    
    case 'comm':
      return (
        <div className="h-[18px] relative shrink-0 w-[16px]" data-name="Comm-Icon">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 63 72">
            <g>
              <path 
                clipRule="evenodd" 
                d={SVG_PATHS.commIconSmallClipRule}
                fill="var(--fill-0, #FF453A)" 
                fillRule="evenodd" 
              />
              <path 
                d={SVG_PATHS.commIconSmallPath2}
                fill="var(--fill-0, #FF453A)" 
              />
            </g>
          </svg>
        </div>
      );
    
    case 'chat':
      return (
        <div className="h-[18px] relative shrink-0 w-[16px]" data-name="Chat-Icon">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 63 72">
            <path d={SVG_PATHS.chatIconSmall} fill="var(--fill-0, #BF5AF2)" />
          </svg>
        </div>
      );
    
    default:
      return null;
  }
}

// ============================================================================
// BLANK TAB COMPONENT
// ============================================================================

interface BlankTabProps {
  onCanvasTypeSelect: (type: CanvasType) => void;
}

function BlankTab({ onCanvasTypeSelect }: BlankTabProps) {
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 390
  );

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine which variant to use based on viewport width
  const isSmall = viewportWidth < 500;
  
  // Responsive values
  const headlineSize = isSmall ? 'text-[20px]' : 'text-[24px]';
  const labelSize = isSmall ? 'text-[14px]' : 'text-[16px]';
  const gridHeight = isSmall ? 'h-[280px]' : 'h-[320px]';
  const iconViewBox = isSmall ? "0 0 63 72" : "0 0 79 90";
  const maxWidth = isSmall ? '' : 'max-w-[480px]';

  return (
    <div className="bg-white content-stretch flex flex-col items-center relative size-full" data-name="Blank-Tab">
      <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full" data-name="Canvas">
        <div className="flex flex-col items-center justify-center size-full">
          <div className="box-border content-stretch flex flex-col gap-[24px] items-center justify-center p-[20px] relative size-full">
            {/* Headline */}
            <div className={`box-border content-stretch flex items-center justify-center ${maxWidth} px-0 py-[12px] relative shrink-0 w-full`} data-name="Headline">
              <p className={`basis-0 font-['Outfit:Regular',_sans-serif] font-normal grow leading-[normal] min-h-px min-w-px relative shrink-0 text-[#222222] ${headlineSize} text-center`}>
                What would you like to create?
              </p>
            </div>

            {/* Canvas Type Selector Grid */}
            <div className={`gap-[16px] grid grid-cols-[repeat(2,_minmax(0px,_1fr))] grid-rows-[repeat(2,_minmax(0px,_1fr))] ${gridHeight} ${maxWidth} relative shrink-0 w-full`} data-name="Canvas-Type-Selector">
              
              {/* New Doc */}
              <button
                onClick={() => onCanvasTypeSelect('doc')}
                className="[grid-area:1_/_1] bg-white relative rounded-[20px] shrink-0 hover:bg-gray-50 transition-colors"
                data-name="New-Doc"
              >
                <div className="flex flex-col items-center justify-center overflow-clip rounded-[inherit] size-full">
                  <div className="box-border content-stretch flex flex-col gap-[10px] items-center justify-center pb-[18px] pt-[24px] px-[12px] relative size-full">
                    <div className="aspect-[70/80] basis-0 grow min-h-px min-w-px relative shrink-0" data-name="Doc-Icon">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox={iconViewBox}>
                        <path d={SVG_PATHS.docIconSmall} fill="var(--fill-0, #0A84FF)" id="Doc-Icon" />
                      </svg>
                    </div>
                    <p className={`[white-space-collapse:collapse] font-['Outfit:Medium',_sans-serif] font-medium leading-[normal] min-w-full overflow-ellipsis overflow-hidden relative shrink-0 text-[#666666] ${labelSize} text-center text-nowrap w-[min-content]`}>
                      New Doc
                    </p>
                  </div>
                </div>
                <div aria-hidden="true" className="absolute border border-[#dde2e8] border-solid inset-0 pointer-events-none rounded-[20px]" />
              </button>

              {/* New Sheet */}
              <button
                onClick={() => onCanvasTypeSelect('sheet')}
                className="[grid-area:1_/_2] bg-white relative rounded-[20px] shrink-0 hover:bg-gray-50 transition-colors"
                data-name="New-Sheet"
              >
                <div className="flex flex-col items-center justify-center overflow-clip rounded-[inherit] size-full">
                  <div className="box-border content-stretch flex flex-col gap-[10px] items-center justify-center pb-[18px] pt-[24px] px-[12px] relative size-full">
                    <div className="aspect-[70/80] basis-0 grow min-h-px min-w-px relative shrink-0" data-name="Sheet-Icon">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox={iconViewBox}>
                        <path d={SVG_PATHS.sheetIconSmall} fill="var(--fill-0, #34C759)" id="Sheet-Icon" />
                      </svg>
                    </div>
                    <p className={`[white-space-collapse:collapse] font-['Outfit:Medium',_sans-serif] font-medium leading-[normal] min-w-full overflow-ellipsis overflow-hidden relative shrink-0 text-[#666666] ${labelSize} text-center text-nowrap w-[min-content]`}>
                      New Sheet
                    </p>
                  </div>
                </div>
                <div aria-hidden="true" className="absolute border border-[#dde2e8] border-solid inset-0 pointer-events-none rounded-[20px]" />
              </button>

              {/* New Comm */}
              <button
                onClick={() => onCanvasTypeSelect('comm')}
                className="[grid-area:2_/_1] bg-white relative rounded-[20px] shrink-0 hover:bg-gray-50 transition-colors"
                data-name="New-Comm"
              >
                <div className="flex flex-col items-center justify-center overflow-clip rounded-[inherit] size-full">
                  <div className="box-border content-stretch flex flex-col gap-[10px] items-center justify-center pb-[18px] pt-[24px] px-[12px] relative size-full">
                    <div className="aspect-[69.9997/80] basis-0 grow min-h-px min-w-px relative shrink-0" data-name="Comm-Icon">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox={iconViewBox}>
                        <g id="Comm-Icon">
                          <path 
                            clipRule="evenodd" 
                            d={SVG_PATHS.commIconSmallClipRule}
                            fill="var(--fill-0, #FF453A)" 
                            fillRule="evenodd" 
                          />
                          <path 
                            d={SVG_PATHS.commIconSmallPath2}
                            fill="var(--fill-0, #FF453A)" 
                          />
                        </g>
                      </svg>
                    </div>
                    <p className={`[white-space-collapse:collapse] font-['Outfit:Medium',_sans-serif] font-medium leading-[normal] min-w-full overflow-ellipsis overflow-hidden relative shrink-0 text-[#666666] ${labelSize} text-center text-nowrap w-[min-content]`}>
                      New Comm
                    </p>
                  </div>
                </div>
                <div aria-hidden="true" className="absolute border border-[#dde2e8] border-solid inset-0 pointer-events-none rounded-[20px]" />
              </button>

              {/* New Chat */}
              <button
                onClick={() => onCanvasTypeSelect('chat')}
                className="[grid-area:2_/_2] bg-white relative rounded-[20px] shrink-0 hover:bg-gray-50 transition-colors"
                data-name="New-Chat"
              >
                <div className="flex flex-col items-center justify-center overflow-clip rounded-[inherit] size-full">
                  <div className="box-border content-stretch flex flex-col gap-[10px] items-center justify-center pb-[18px] pt-[24px] px-[12px] relative size-full">
                    <div className="aspect-[70/80] basis-0 grow min-h-px min-w-px relative shrink-0" data-name="Chat-Icon">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox={iconViewBox}>
                        <path d={SVG_PATHS.chatIconSmall} fill="var(--fill-0, #BF5AF2)" id="Chat-Icon" />
                      </svg>
                    </div>
                    <p className={`[white-space-collapse:collapse] font-['Outfit:Medium',_sans-serif] font-medium leading-[normal] min-w-full overflow-ellipsis overflow-hidden relative shrink-0 text-[#666666] ${labelSize} text-center text-nowrap w-[min-content]`}>
                      New Chat
                    </p>
                  </div>
                </div>
                <div aria-hidden="true" className="absolute border border-[#dde2e8] border-solid inset-0 pointer-events-none rounded-[20px]" />
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CANVAS AREA COMPONENT
// ============================================================================

interface CanvasAreaProps {
  tabs: Tab[];
  activeTabId: string;
  dragProgress: MotionValue<number>;
  dragDirection: 'left' | 'right' | null;
  onCanvasTypeSelect: (type: CanvasType) => void;
}

function CanvasArea({
  tabs,
  activeTabId,
  dragProgress,
  dragDirection,
  onCanvasTypeSelect,
}: CanvasAreaProps) {
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 390
  );

  // Displayed tab index (lags during drag for smooth visual transition)
  const activeIndex = tabs.findIndex(t => t.id === activeTabId);
  const [displayedTabIndex, setDisplayedTabIndex] = useState(activeIndex);
  
  // Track last drag direction for showing adjacent tab during transition
  const lastDragDirectionRef = useRef<'left' | 'right' | null>(null);
  const previewNewTabIdRef = useRef(`preview-new-${Date.now()}`);

  // Track if there's meaningful drag progress (prevents flash at drag start)
  const [hasDragProgress, setHasDragProgress] = useState(false);

  // Update displayed index only when not dragging
  useEffect(() => {
    if (!dragDirection) {
      setDisplayedTabIndex(activeIndex);
      lastDragDirectionRef.current = null;
      previewNewTabIdRef.current = `preview-new-${Date.now()}`;
    }
  }, [activeIndex, dragDirection]);

  // Stable motion values for canvas positions
  const currentTabXRef = useRef(useMotionValue(0));
  const adjacentTabXRef = useRef(useMotionValue(0));
  const currentTabX = currentTabXRef.current;
  const adjacentTabX = adjacentTabXRef.current;

  // Ref for drag direction (avoids stale closures)
  const dragDirectionRef = useRef(dragDirection);
  dragDirectionRef.current = dragDirection;

  const screenWidth = viewportWidth;

  // Update positions based on drag progress (identical to TabBar logic)
  useEffect(() => {
    const updatePositions = (progress: number) => {
      const direction = dragDirectionRef.current;
      console.log('[CanvasArea] updatePositions:', { progress, direction, hasDragProgress });
      if (direction === 'left') {
        currentTabX.set(-progress * screenWidth);
        adjacentTabX.set(screenWidth - (progress * screenWidth));
      } else if (direction === 'right') {
        currentTabX.set(progress * screenWidth);
        adjacentTabX.set(-screenWidth + (progress * screenWidth));
      } else {
        currentTabX.set(0);
        adjacentTabX.set(0);
      }
      
      // Update drag progress state to control visibility (prevents flash)
      const shouldShow = progress > 0.01;
      console.log('[CanvasArea] Setting hasDragProgress:', shouldShow, 'was:', hasDragProgress);
      setHasDragProgress(shouldShow);
    };

    const initialProgress = dragProgress.get();
    console.log('[CanvasArea] Initial setup - progress:', initialProgress, 'direction:', dragDirectionRef.current);
    updatePositions(initialProgress);
    const unsubscribe = dragProgress.on('change', updatePositions);
    return () => unsubscribe();
  }, [dragProgress, screenWidth, currentTabX, adjacentTabX]);

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get current and adjacent tabs
  const currentTab = tabs[displayedTabIndex];
  const targetTab = tabs[activeIndex];

  const effectiveDragDirection = dragDirection || lastDragDirectionRef.current;
  // Only show adjacent tab when there's actual drag progress (prevents flash at drag start)
  const showAdjacentTab = (effectiveDragDirection !== null && hasDragProgress) || displayedTabIndex !== activeIndex;
  
  console.log('[CanvasArea] Render:', { 
    dragDirection, 
    effectiveDragDirection, 
    hasDragProgress, 
    showAdjacentTab,
    displayedTabIndex,
    activeIndex,
    dragProgressValue: dragProgress.get()
  });

  const adjacentTab = effectiveDragDirection === 'right' && displayedTabIndex > 0 
    ? tabs[displayedTabIndex - 1]
    : effectiveDragDirection === 'left'
    ? (displayedTabIndex < tabs.length - 1 
        ? tabs[displayedTabIndex + 1] 
        : { 
            id: previewNewTabIdRef.current, 
            name: 'Blank Tab', 
            canvasType: null, 
            createdAt: Date.now(), 
            isActive: false, 
            commentCount: 0 
          } as Tab)
    : targetTab;

  // Update last drag direction when transitioning
  useEffect(() => {
    if (dragDirection) {
      lastDragDirectionRef.current = dragDirection;
    }
  }, [dragDirection]);

  // Render canvas content based on tab
  const renderCanvasContent = (tab: Tab | null) => {
    if (!tab) return null;

    // Blank tab
    if (tab.canvasType === null) {
      return <BlankTab onCanvasTypeSelect={onCanvasTypeSelect} />;
    }

    // Canvas type placeholders
    const placeholders: Record<CanvasType, string> = {
      doc: 'Doc Canvas (Coming Soon)',
      sheet: 'Sheet Canvas (Coming Soon)',
      comm: 'Comm Canvas (Coming Soon)',
      chat: 'Chat Canvas (Coming Soon)',
    };

    return (
      <div className="flex items-center justify-center h-full">
        <p className="font-['Outfit',_sans-serif] text-neutral-500">
          {placeholders[tab.canvasType]}
        </p>
      </div>
    );
  };

  return (
    <div className="relative h-full overflow-hidden">
      {/* Current tab content */}
      <motion.div
        className="absolute inset-0"
        style={{ x: currentTabX, willChange: 'transform' }}
      >
        {renderCanvasContent(currentTab)}
      </motion.div>

      {/* Adjacent tab content (previous or next) */}
      {showAdjacentTab && adjacentTab && (
        <motion.div
          className="absolute inset-0"
          style={{ x: adjacentTabX, willChange: 'transform' }}
        >
          {renderCanvasContent(adjacentTab)}
        </motion.div>
      )}
    </div>
  );
}

// ============================================================================
// TAB SWITCHER COMPONENT
// ============================================================================

interface TabSwitcherProps {
  isOpen: boolean;
  tabs: Tab[];
  activeTabId: string | null;
  taskName: string;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewTab: () => void;
  onClose: () => void;
}

function TabSwitcher({
  isOpen,
  tabs,
  activeTabId,
  taskName,
  onTabSelect,
  onTabClose,
  onNewTab,
  onClose,
}: TabSwitcherProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white" data-name="Tab-Switcher">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="font-['Outfit:Medium',_sans-serif] font-medium text-[18px] text-[#222222]">
          {taskName}
        </h2>
        <button 
          onClick={onClose}
          className="text-[#7482FF] font-['Outfit:Medium',_sans-serif] font-medium text-[16px]"
        >
          Done
        </button>
      </div>

      {/* Tab Grid */}
      <div className="p-4 overflow-y-auto h-[calc(100vh-80px)]">
        <div className="grid grid-cols-2 gap-4">
          {tabs.map((tab) => (
            <div 
              key={tab.id} 
              className="relative bg-white rounded-[12px] border border-[#dde2e8] overflow-hidden"
            >
              {/* Tab Preview */}
              <button
                onClick={() => onTabSelect(tab.id)}
                className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CanvasIcon canvasType={tab.canvasType} />
                  <p className="font-['Outfit:Medium',_sans-serif] font-medium text-[14px] text-[#222222] truncate">
                    {tab.name}
                  </p>
                </div>
                {tab.id === activeTabId && (
                  <div className="text-[12px] text-[#7482FF] font-['Outfit:Medium',_sans-serif]">
                    Active
                  </div>
                )}
              </button>

              {/* Close Button */}
              <button
                onClick={() => onTabClose(tab.id)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#F2F2F7] flex items-center justify-center hover:bg-[#E5E5EA] transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1L11 11M1 11L11 1" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          ))}

          {/* New Tab Button */}
          <button
            onClick={onNewTab}
            className="bg-white rounded-[12px] border-2 border-dashed border-[#dde2e8] p-4 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors min-h-[100px]"
          >
            <div className="w-8 h-8 rounded-full bg-[#7482FF] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1V15M1 8H15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="font-['Outfit:Medium',_sans-serif] font-medium text-[14px] text-[#666666]">
              New Tab
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TAB BAR COMPONENT
// ============================================================================

interface TabBarProps {
  taskName: string;
  tabs: Tab[];
  activeTabId: string;
  tabCount: number;
  dragProgress: MotionValue<number>;
  dragDirection: 'left' | 'right' | null;
  dragDirectionRef: React.RefObject<'left' | 'right' | null>;
  isTransitioning: boolean;
  onSwipeStart: (clientX: number) => boolean;
  onSwipeMove: (clientX: number) => void;
  onSwipeEnd: () => void;
  onTabNameChange: (tabId: string, newName: string) => void;
  onTaskNameChange: (newName: string) => void;
  onSwitcherToggle: () => void;
  onSwipeUp: () => void;
  isFirstTab: boolean;
  isLastTab: boolean;
  isSingleTab: boolean;
}

function TabBar({ 
  taskName, 
  tabs,
  activeTabId,
  tabCount, 
  dragProgress,
  dragDirection,
  dragDirectionRef,
  isTransitioning,
  onSwipeStart,
  onSwipeMove,
  onSwipeEnd,
  onTabNameChange,
  onTaskNameChange,
  onSwitcherToggle,
  onSwipeUp,
  isFirstTab,
  isLastTab,
  isSingleTab,
}: TabBarProps) {
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 390
  );

  // Editing state for tab name
  const [isEditing, setIsEditing] = useState(false);
  const [editingText, setEditingText] = useState('');
  const [originalName, setOriginalName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Editing state for task name
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editingTaskText, setEditingTaskText] = useState('');
  const taskInputRef = useRef<HTMLInputElement>(null);
  const taskContainerRef = useRef<HTMLDivElement>(null);

  // Displayed tab index (lags during drag for smooth visual transition)
  const activeIndex = tabs.findIndex(t => t.id === activeTabId);
  const [displayedTabIndex, setDisplayedTabIndex] = useState(activeIndex);

  // Track if there's meaningful drag progress (prevents flash at drag start)
  const [hasDragProgress, setHasDragProgress] = useState(false);

  // Update displayed index only when not dragging
  useEffect(() => {
    if (!dragDirection) {
      setDisplayedTabIndex(activeIndex);
    }
  }, [activeIndex, dragDirection]);

  // Reset editing state when active tab changes or when dragging starts
  useEffect(() => {
    setIsEditing(false);
    setEditingText('');
  }, [activeTabId]);

  // Exit editing mode when drag starts
  useEffect(() => {
    if (dragDirection && isEditing) {
      setIsEditing(false);
      setEditingText('');
    }
  }, [dragDirection, isEditing]);

  // Stable motion values for address bar positions
  const currentTabXRef = useRef(useMotionValue(0));
  const adjacentTabXRef = useRef(useMotionValue(0));
  const currentTabX = currentTabXRef.current;
  const adjacentTabX = adjacentTabXRef.current;

  // Use the passed ref for immediate direction access (avoids timing issues)

  const screenWidth = viewportWidth;

  // Calculate address bar positions
  useEffect(() => {
    const updatePositions = (progress: number) => {
      const direction = dragDirectionRef.current;
      if (direction === 'left') {
        currentTabX.set(-progress * screenWidth);
        adjacentTabX.set(screenWidth - (progress * screenWidth));
      } else if (direction === 'right') {
        currentTabX.set(progress * screenWidth);
        adjacentTabX.set(-screenWidth + (progress * screenWidth));
      } else {
        currentTabX.set(0);
        adjacentTabX.set(0);
      }
      
      // Update drag progress state to control visibility (prevents flash)
      setHasDragProgress(progress > 0.01);
    };

    updatePositions(dragProgress.get());
    const unsubscribe = dragProgress.on('change', updatePositions);
    return () => unsubscribe();
  }, [dragProgress, screenWidth, currentTabX, adjacentTabX, dragDirectionRef]);

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Tab name editing handlers
  const handleTabNameClick = () => {
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (!activeTab || isTransitioning) return;
    
    setOriginalName(activeTab.name);
    setEditingText(activeTab.name);
    setIsEditing(true);
    
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  };

  const handleTabNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingText(e.target.value);
  };

  const handleTabNameBlur = () => {
    if (editingText.trim() === '') {
      setEditingText(originalName);
    } else {
      onTabNameChange(activeTabId, editingText.trim());
    }
    setIsEditing(false);
  };

  const handleTabNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTabNameBlur();
    } else if (e.key === 'Escape') {
      setEditingText(originalName);
      setIsEditing(false);
    }
  };

  // Task name editing handlers
  const handleTaskClick = () => {
    if (isTransitioning) return;
    
    setEditingTaskText(taskName);
    setIsEditingTask(true);
    
    setTimeout(() => {
      taskInputRef.current?.focus();
      taskInputRef.current?.select();
    }, 0);
  };

  const handleTaskChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTaskText(e.target.value);
  };

  const handleTaskBlur = () => {
    if (editingTaskText.trim() === '') {
      setEditingTaskText(taskName);
    } else {
      onTaskNameChange(editingTaskText.trim());
    }
    setIsEditingTask(false);
  };

  const handleTaskKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTaskBlur();
    } else if (e.key === 'Escape') {
      setEditingTaskText(taskName);
      setIsEditingTask(false);
    }
  };

  // Dynamic width calculation for inputs
  const [inputWidth, setInputWidth] = useState<number | null>(null);
  const [taskInputWidth, setTaskInputWidth] = useState<number | null>(null);

  useEffect(() => {
    if (isEditing && containerRef.current) {
      const measureText = containerRef.current.querySelector('.measure-text') as HTMLElement;
      if (measureText) {
        const width = measureText.offsetWidth;
        setInputWidth(Math.max(width + 10, 40));
      }
    }
  }, [editingText, isEditing]);

  useEffect(() => {
    if (isEditingTask && taskContainerRef.current) {
      const measureText = taskContainerRef.current.querySelector('.task-measure-text') as HTMLElement;
      if (measureText) {
        const width = measureText.offsetWidth;
        setTaskInputWidth(Math.max(width + 10, 40));
      }
    }
  }, [editingTaskText, isEditingTask]);

  // Drag handlers
  const dragStartXRef = useRef(0);
  const dragStartYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const directionLockedRef = useRef<'horizontal' | 'vertical' | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isEditing || isEditingTask) return;
    
    dragStartXRef.current = e.clientX;
    dragStartYRef.current = e.clientY;
    isDraggingRef.current = false;
    directionLockedRef.current = null;
    
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isEditing || isEditingTask) return;
    
    const deltaX = e.clientX - dragStartXRef.current;
    const deltaY = e.clientY - dragStartYRef.current;

    // Lock direction on first meaningful movement
    if (!directionLockedRef.current && (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)) {
      directionLockedRef.current = Math.abs(deltaY) > Math.abs(deltaX) ? 'vertical' : 'horizontal';
    }

    // Handle vertical swipe (switcher)
    if (directionLockedRef.current === 'vertical' && deltaY < -20) {
      onSwipeUp();
      isDraggingRef.current = false;
      directionLockedRef.current = null;
      return;
    }

    // Handle horizontal swipe (tab switching)
    if (directionLockedRef.current === 'horizontal') {
      if (!isDraggingRef.current) {
        const success = onSwipeStart(e.clientX);
        if (success) {
          isDraggingRef.current = true;
        }
      }
      
      if (isDraggingRef.current) {
        onSwipeMove(e.clientX);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      onSwipeEnd();
    }
    
    isDraggingRef.current = false;
    directionLockedRef.current = null;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  // Get current and adjacent tabs for rendering
  const currentTab = tabs[displayedTabIndex];
  const leftTab = displayedTabIndex > 0 ? tabs[displayedTabIndex - 1] : null;
  const rightTab = displayedTabIndex < tabs.length - 1 ? tabs[displayedTabIndex + 1] : null;

  // Tab bar dimensions
  const tabBarHeight = 185; // 151px content + 34px safe area

  // Tab indicators logic
  const maxDots = 5;
  const totalTabs = tabs.length;
  const displayDots = Math.min(totalTabs, maxDots);
  
  let startIndex = 0;
  if (totalTabs > maxDots) {
    if (activeIndex <= 1) {
      startIndex = 0;
    } else if (activeIndex >= totalTabs - 2) {
      startIndex = totalTabs - maxDots;
    } else {
      startIndex = activeIndex - 2;
    }
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 ${isTransitioning ? 'pointer-events-none' : ''}`}
      style={{ height: `${tabBarHeight}px` }}
    >
      <div className="backdrop-blur-[5px] backdrop-filter bg-[rgba(255,255,255,0.8)] relative size-full">
        
        {/* Task Name Pill */}
        <div className="absolute bg-[#f2f2f7] box-border content-stretch flex items-center justify-center left-1/2 min-w-[100px] overflow-clip px-[12px] py-[4px] rounded-[100px] top-[-12px] translate-x-[-50%]" data-name="Task-Name">
          <div 
            ref={taskContainerRef}
            className="box-border content-stretch flex gap-[10px] items-center justify-center pb-px pt-0 px-0 relative shrink-0"
          >
            {isEditingTask ? (
              <>
                <input
                  ref={taskInputRef}
                  type="text"
                  value={editingTaskText}
                  onChange={handleTaskChange}
                  onBlur={handleTaskBlur}
                  onKeyDown={handleTaskKeyDown}
                  className="capitalize font-['Outfit:Medium',_sans-serif] font-medium leading-[normal] max-w-[200px] relative shrink-0 text-[#8e8e93] text-[12px] text-center bg-transparent border-none outline-none p-0 m-0 min-w-0"
                  style={{ width: taskInputWidth ? `${taskInputWidth}px` : 'auto' }}
                />
                <span 
                  className="task-measure-text capitalize font-['Outfit:Medium',_sans-serif] font-medium leading-[normal] text-[12px] absolute opacity-0 pointer-events-none whitespace-pre"
                  aria-hidden="true"
                >
                  {editingTaskText || taskName}
                </span>
              </>
            ) : (
              <p 
                onClick={handleTaskClick}
                className="capitalize font-['Outfit:Medium',_sans-serif] font-medium leading-[normal] max-w-[200px] overflow-ellipsis overflow-hidden relative shrink-0 text-[#8e8e93] text-[12px] text-center text-nowrap whitespace-pre cursor-pointer"
              >
                {taskName}
              </p>
            )}
          </div>
        </div>

        {/* Main Tab Bar Content */}
        <div className="box-border content-stretch flex flex-col items-center justify-start pb-[34px] pt-[20px] px-0 relative size-full" data-name="M-Tab-Bar">
          
          {/* Tab Switcher - Address Bars Container */}
          <div 
            className="h-[87px] overflow-hidden relative w-full"
            style={{ touchAction: 'none' }}
            data-name="Tab-Switcher"
          >
            {/* Current Tab Address Bar */}
            <motion.div
              className="absolute inset-x-0 top-0 h-full"
              style={{ x: currentTabX, willChange: 'transform' }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              <div className="relative h-full w-full" style={{ touchAction: 'none' }}>
                <div className="absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] w-full max-w-[calc(100%-40px)]">
                  <div className="bg-white relative rounded-[100px] mx-auto" style={{ maxWidth: '360px' }}>
                    <div className="flex flex-col items-center justify-center overflow-clip rounded-[inherit] size-full">
                      <div className="box-border content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[11px] relative shrink-0">
                        
                        {/* Tab Icon */}
                        <div className="h-[18px] relative shrink-0 w-[16px]">
                          <CanvasIcon canvasType={currentTab?.canvasType || null} />
                        </div>

                        {/* Tab Name */}
                        <div 
                          ref={containerRef}
                          className="basis-0 box-border content-stretch flex gap-[10px] grow items-center justify-center min-h-px min-w-px pb-px pt-0 px-0 relative shrink-0"
                        >
                          {isEditing ? (
                            <>
                              <input
                                ref={inputRef}
                                type="text"
                                value={editingText}
                                onChange={handleTabNameChange}
                                onBlur={handleTabNameBlur}
                                onKeyDown={handleTabNameKeyDown}
                                className="capitalize font-['Outfit:Medium',_sans-serif] font-medium leading-[normal] max-w-[200px] relative shrink-0 text-[#8e8e93] text-[14px] text-center bg-transparent border-none outline-none p-0 m-0 min-w-0"
                                style={{ width: inputWidth ? `${inputWidth}px` : 'auto' }}
                              />
                              <span 
                                className="measure-text capitalize font-['Outfit:Medium',_sans-serif] font-medium leading-[normal] text-[14px] absolute opacity-0 pointer-events-none whitespace-pre"
                                aria-hidden="true"
                              >
                                {editingText || currentTab?.name}
                              </span>
                            </>
                          ) : (
                            <p 
                              onClick={handleTabNameClick}
                              className="capitalize font-['Outfit:Medium',_sans-serif] font-medium leading-[normal] max-w-[200px] overflow-ellipsis overflow-hidden relative shrink-0 text-[#8e8e93] text-[14px] text-center text-nowrap whitespace-pre cursor-pointer"
                            >
                              {currentTab?.name}
                            </p>
                          )}
                        </div>

                      </div>
                    </div>
                    <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[100px]" />
                  </div>

                  {/* Inactive Tab Indicators */}
                  {leftTab && (
                    <div 
                      className="absolute h-[51px] top-1/2 translate-y-[-50%] w-[30px] left-[5px]"
                      style={{ opacity: 0.3, pointerEvents: 'none' }}
                    >
                      <div className="bg-white h-full rounded-[100px]">
                        <div className="overflow-clip relative rounded-[inherit] size-full">
                          <div className="absolute box-border content-stretch flex gap-[8px] items-center justify-center left-1/2 px-0 py-[5px] top-1/2 translate-x-[-50%] translate-y-[-50%]">
                            <div className="h-[18px] relative shrink-0 w-[16px]">
                              <CanvasIcon canvasType={leftTab.canvasType || null} />
                            </div>
                          </div>
                        </div>
                        <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[100px]" />
                      </div>
                    </div>
                  )}

                  {rightTab && (
                    <div 
                      className="absolute h-[51px] top-1/2 translate-y-[-50%] w-[30px] right-[5px]"
                      style={{ opacity: 0.3, pointerEvents: 'none' }}
                    >
                      <div className="bg-white h-full rounded-[100px]">
                        <div className="overflow-clip relative rounded-[inherit] size-full">
                          <div className="absolute box-border content-stretch flex gap-[8px] items-center justify-center left-1/2 px-0 py-[5px] top-1/2 translate-x-[-50%] translate-y-[-50%]">
                            <div className="h-[18px] relative shrink-0 w-[16px]">
                              <CanvasIcon canvasType={rightTab.canvasType || null} />
                            </div>
                          </div>
                        </div>
                        <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[100px]" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Adjacent Tab Address Bar (for sliding animation) */}
            {dragDirection && hasDragProgress && (
              <motion.div
                className="absolute inset-x-0 top-0 h-full"
                style={{ x: adjacentTabX, willChange: 'transform' }}
              >
                <div className="relative h-full w-full" style={{ touchAction: 'none' }}>
                  <div className="absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] w-full max-w-[calc(100%-40px)]">
                    <div className="bg-white relative rounded-[100px] mx-auto" style={{ maxWidth: '360px' }}>
                      <div className="flex flex-col items-center justify-center overflow-clip rounded-[inherit] size-full">
                        <div className="box-border content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[11px] relative shrink-0">
                          <div className="h-[18px] relative shrink-0 w-[16px]">
                            <CanvasIcon canvasType={
                              dragDirection === 'right' && leftTab ? leftTab.canvasType :
                              dragDirection === 'left' && rightTab ? rightTab.canvasType :
                              null
                            } />
                          </div>
                          <div className="basis-0 box-border content-stretch flex gap-[10px] grow items-center justify-center min-h-px min-w-px pb-px pt-0 px-0 relative shrink-0">
                            <p className="capitalize font-['Outfit:Medium',_sans-serif] font-medium leading-[normal] max-w-[200px] overflow-ellipsis overflow-hidden relative shrink-0 text-[#8e8e93] text-[14px] text-center text-nowrap whitespace-pre">
                              {dragDirection === 'right' && leftTab ? leftTab.name :
                               dragDirection === 'left' && rightTab ? rightTab.name :
                               dragDirection === 'left' && !rightTab ? 'Blank Tab' :
                               ''}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[100px]" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="box-border content-stretch flex items-center justify-center pt-[10px] px-0 pb-0 relative shrink-0 w-full" data-name="Bottom-Controls">
            
            {/* Action Buttons */}
            <div className="box-border content-stretch flex gap-[20px] items-center justify-center px-[24px] pb-0 pt-[4px] relative shrink-0" data-name="Actions">
              
              {/* Edit History */}
              <div className="relative shrink-0 size-[31px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 31 31">
                  <rect fill="var(--fill-0, #F2F2F7)" height="31" rx="15.5" width="31" />
                  <path d={SVG_PATHS.editHistory} fill="var(--fill-0, #8E8E93)" stroke="var(--stroke-0, #8E8E93)" strokeWidth="0.2" />
                </svg>
              </div>

              {/* Undo */}
              <div className="relative shrink-0 size-[31px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 31 31">
                  <rect fill="var(--fill-0, #F2F2F7)" height="31" rx="15.5" width="31" />
                  <path d={SVG_PATHS.undo} stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
                </svg>
              </div>

              {/* Home */}
              <div className="relative shrink-0 size-[35px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 35 35">
                  <path d={SVG_PATHS.home} fill="var(--fill-0, #7482FF)" stroke="var(--stroke-0, #7482FF)" strokeWidth="0.2" />
                </svg>
              </div>

              {/* Sparo Button */}
              <div className="relative shrink-0 size-[58px]">
                <div className="absolute left-[5px] size-[48px] top-[5px]">
                  <div className="absolute inset-[-16.67%_-20.83%_-25%_-20.83%]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 68 68">
                      <g filter="url(#filter0_d_13_718)">
                        <circle cx="34" cy="32" fill="var(--fill-0, white)" fillOpacity="0.8" r="24" shapeRendering="crispEdges" />
                        <circle cx="34" cy="32" r="23.5" shapeRendering="crispEdges" stroke="var(--stroke-0, #AA6EEE)" strokeOpacity="0.2" />
                      </g>
                      <defs>
                        <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="68" id="filter0_d_13_718" width="68" x="0" y="0">
                          <feFlood floodOpacity="0" result="BackgroundImageFix" />
                          <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                          <feMorphology in="SourceAlpha" operator="dilate" radius="2" result="effect1_dropShadow_13_718" />
                          <feOffset dy="2" />
                          <feGaussianBlur stdDeviation="4" />
                          <feComposite in2="hardAlpha" operator="out" />
                          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
                          <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_13_718" />
                          <feBlend in="SourceGraphic" in2="effect1_dropShadow_13_718" mode="normal" result="shape" />
                        </filter>
                      </defs>
                    </svg>
                  </div>
                </div>
                <div className="absolute h-[26px] left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] w-[28px]">
                  <svg className="absolute left-[-3.57%] size-[107.14%] top-[-3.85%]" fill="none" preserveAspectRatio="none" viewBox="0 0 30 28">
                    <path d={SVG_PATHS.sparo} fill="var(--fill-0, #AA6EEE)" stroke="var(--stroke-0, #AA6EEE)" strokeWidth="0.2" />
                  </svg>
                </div>
              </div>

              {/* Switcher */}
              <button 
                onClick={onSwitcherToggle}
                className="relative shrink-0 size-[35px] cursor-pointer active:opacity-70 transition-opacity"
              >
                <div className="absolute left-1/2 size-[24px] top-1/2 translate-x-[-50%] translate-y-[-50%]">
                  <div className="absolute inset-[-0.83%]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 25">
                      <path d={SVG_PATHS.switcher} fill="var(--fill-0, #7482FF)" stroke="var(--stroke-0, #7482FF)" strokeWidth="0.2" />
                    </svg>
                  </div>
                </div>
                <div className="absolute content-stretch flex flex-col items-center justify-center left-[calc(50%+2px)] overflow-clip top-[calc(50%+1px)] translate-x-[-50%] translate-y-[-50%]">
                  <p className="capitalize font-['Outfit:Bold',_sans-serif] font-bold h-[10px] leading-none max-w-[13px] relative shrink-0 text-[#7482ff] text-[10px] text-center w-[12px]">{tabCount}</p>
                </div>
              </button>

            </div>
          </div>

          {/* Tab Indicators */}
          <div className="box-border content-stretch flex gap-[8px] items-center justify-center pt-[8px] px-0 pb-0 relative shrink-0" data-name="Tab-Indicators">
            {Array.from({ length: displayDots }).map((_, i) => {
              const tabIndex = startIndex + i;
              const isActive = tabIndex === activeIndex;
              
              return (
                <div
                  key={tabIndex}
                  className={`rounded-[100px] shrink-0 size-[6px] transition-colors ${
                    isActive ? 'bg-[#7482ff]' : 'bg-[#d1d1d6]'
                  }`}
                  data-name="Tab-Indicator"
                />
              );
            })}
          </div>

        </div>

        {/* Safe Area */}
        <div className="absolute bg-white bottom-0 h-[34px] left-0 pointer-events-none w-full" data-name="Safe-Area" />
      </div>
    </div>
  );
}

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

export default function StandaloneTabBarApp() {
  // Task state (in-memory only)
  const [task, setTask] = useState<Task>({
    id: `task-${Date.now()}`,
    name: 'Untitled Task 1',
    tabs: [
      {
        id: `tab-${Date.now()}`,
        name: 'Blank Tab',
        canvasType: null,
        createdAt: Date.now(),
        isActive: true,
        commentCount: 0,
      },
    ],
  });

  // Tab Switcher state
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  // Drag state for synchronized tab animations
  const dragProgress = useMotionValue(0);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);
  const dragDirectionRef = useRef<'left' | 'right' | null>(null); // Sync ref to avoid timing issues
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const lastClientX = useRef(0);
  const transitionTimeoutRef = useRef<number | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  // Get the currently active tab
  const activeTab = task.tabs.find((tab) => tab.isActive);

  // Handle canvas type selection from BlankTab
  const handleCanvasTypeSelect = (type: CanvasType) => {
    if (!activeTab) return;

    // Generate new tab name: "Untitled [CanvasType]"
    const canvasTypeName = type.charAt(0).toUpperCase() + type.slice(1);
    const newTabName = `Untitled ${canvasTypeName}`;

    // Update the active tab's canvas type and name
    setTask((prevTask) => ({
      ...prevTask,
      tabs: prevTask.tabs.map((tab) =>
        tab.id === activeTab.id 
          ? { ...tab, canvasType: type, name: newTabName } 
          : tab
      ),
    }));
  };

  // Handle tab name change from TabBar
  const handleTabNameChange = (tabId: string, newName: string) => {
    setTask((prevTask) => ({
      ...prevTask,
      tabs: prevTask.tabs.map((tab) =>
        tab.id === tabId 
          ? { ...tab, name: newName } 
          : tab
      ),
    }));
  };

  // Drag handlers for synchronized animations
  const handleSwipeStart = (clientX: number) => {
    if (isTransitioning || isDragging.current) {
      return false;
    }
    
    isDragging.current = true;
    dragStartX.current = clientX;
    lastClientX.current = clientX;
    dragDirectionRef.current = null; // Set ref synchronously
    setDragDirection(null);
    dragProgress.set(0);
    return true;
  };

  const handleSwipeMove = (clientX: number) => {
    if (!isDragging.current || isTransitioning || !activeTab) {
      return;
    }

    lastClientX.current = clientX;

    const deltaX = clientX - dragStartX.current;
    const screenWidth = window.innerWidth;
    const currentIndex = task.tabs.findIndex((tab) => tab.id === activeTab.id);
    
    // Determine direction on first meaningful movement
    if (!dragDirection && Math.abs(deltaX) > 5) {
      if (deltaX < 0) {
        dragDirectionRef.current = 'left'; // Set ref synchronously FIRST
        setDragDirection('left');
      } else if (deltaX > 0 && currentIndex > 0) {
        dragDirectionRef.current = 'right'; // Set ref synchronously FIRST
        setDragDirection('right');
      }
    }

    // Calculate progress based on deltaX
    if (deltaX < 0) {
      const progress = Math.min(Math.abs(deltaX) / screenWidth, 1);
      dragProgress.set(progress);
    } else if (deltaX > 0 && currentIndex > 0) {
      const progress = Math.min(deltaX / screenWidth, 1);
      dragProgress.set(progress);
    } else if (deltaX === 0) {
      dragProgress.set(0);
    }
  };

  const handleSwipeEnd = () => {
    if (!isDragging.current || isTransitioning) {
      return;
    }

    isDragging.current = false;

    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }

    if (!activeTab) {
      dragProgress.set(0);
      setDragDirection(null);
      return;
    }

    const threshold = 0.3;
    const progress = dragProgress.get();
    const currentIndex = task.tabs.findIndex((tab) => tab.id === activeTab.id);

    const deltaX = lastClientX.current - dragStartX.current;
    let actualDirection: 'left' | 'right' | null = null;
    
    if (deltaX < 0) {
      actualDirection = 'left';
    } else if (deltaX > 0 && currentIndex > 0) {
      actualDirection = 'right';
    }

    // Threshold met - switch tabs
    if (progress > threshold && actualDirection) {
      setIsTransitioning(true);
      
      const nextIndex = actualDirection === 'left' 
        ? (currentIndex === task.tabs.length - 1 ? currentIndex : currentIndex + 1)
        : currentIndex - 1;
      
      const shouldCreateTab = actualDirection === 'left' && currentIndex === task.tabs.length - 1;
      
      if (shouldCreateTab) {
        createNewTab();
      } else {
        switchToTab(nextIndex);
      }
      
      transitionTimeoutRef.current = window.setTimeout(() => {
        console.warn('Transition timeout - forcing complete reset');
        dragProgress.set(0);
        setDragDirection(null);
        setIsTransitioning(false);
        isDragging.current = false;
        transitionTimeoutRef.current = null;
      }, 1500);
      
      requestAnimationFrame(() => {
        animate(dragProgress, 1, {
          duration: 0.2,
          ease: [0.4, 0, 0.2, 1],
          onComplete: () => {
            if (transitionTimeoutRef.current) {
              clearTimeout(transitionTimeoutRef.current);
              transitionTimeoutRef.current = null;
            }
            
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  dragProgress.set(0);
                  setDragDirection(null);
                  setIsTransitioning(false);
                });
              });
            });
          },
        });
      });
    } else {
      // Snap back
      setIsTransitioning(true);
      
      transitionTimeoutRef.current = window.setTimeout(() => {
        console.warn('Snap-back timeout - forcing reset');
        dragProgress.set(0);
        setDragDirection(null);
        setIsTransitioning(false);
        transitionTimeoutRef.current = null;
      }, 600);
      
      animate(dragProgress, 0, {
        duration: 0.2,
        ease: 'easeOut',
        onComplete: () => {
          if (transitionTimeoutRef.current) {
            clearTimeout(transitionTimeoutRef.current);
            transitionTimeoutRef.current = null;
          }
          requestAnimationFrame(() => {
            setDragDirection(null);
            setIsTransitioning(false);
          });
        }
      });
    }
  };

  // Switch to a specific tab by index
  const switchToTab = (index: number) => {
    setTask((prevTask) => ({
      ...prevTask,
      tabs: prevTask.tabs.map((tab, i) => ({
        ...tab,
        isActive: i === index,
      })),
    }));
  };

  // Create a new blank tab
  const createNewTab = () => {
    const newTab: Tab = {
      id: `tab-${Date.now()}`,
      name: 'Blank Tab',
      canvasType: null,
      createdAt: Date.now(),
      isActive: true,
      commentCount: 0,
    };

    setTask((prevTask) => ({
      ...prevTask,
      tabs: [
        ...prevTask.tabs.map((tab) => ({ ...tab, isActive: false })),
        newTab,
      ],
    }));
  };

  // Handle tab switcher toggle
  const handleSwitcherToggle = () => {
    setIsSwitcherOpen(!isSwitcherOpen);
  };

  // Handle tab selection from switcher
  const handleTabSelect = (tabId: string) => {
    setTask((prevTask) => ({
      ...prevTask,
      tabs: prevTask.tabs.map((tab) => ({
        ...tab,
        isActive: tab.id === tabId,
      })),
    }));
    
    setIsSwitcherOpen(false);
  };

  // Handle upward swipe to open switcher
  const handleSwipeUp = () => {
    setIsSwitcherOpen(true);
  };

  // Handle task name change
  const handleTaskNameChange = (newName: string) => {
    setTask((prevTask) => ({
      ...prevTask,
      name: newName,
    }));
  };

  // Handle tab closing from switcher
  const handleTabClose = (tabId: string) => {
    const tabIndex = task.tabs.findIndex((tab) => tab.id === tabId);
    const isClosingActiveTab = task.tabs[tabIndex]?.isActive;
    const isLastTab = task.tabs.length === 1;

    // If closing the last tab, create a new blank tab instead
    if (isLastTab) {
      const newTab: Tab = {
        id: `tab-${Date.now()}`,
        name: 'Blank Tab',
        canvasType: null,
        createdAt: Date.now(),
        isActive: true,
        commentCount: 0,
      };

      setTask((prevTask) => ({
        ...prevTask,
        tabs: [newTab],
      }));
      return;
    }

    // Remove the tab
    setTask((prevTask) => {
      const updatedTabs = prevTask.tabs.filter((tab) => tab.id !== tabId);

      // If we closed the active tab, activate an adjacent tab
      if (isClosingActiveTab) {
        const newActiveIndex = tabIndex < updatedTabs.length ? tabIndex : tabIndex - 1;
        updatedTabs[newActiveIndex].isActive = true;
      }

      return {
        ...prevTask,
        tabs: updatedTabs,
      };
    });
  };

  const activeTabId = activeTab?.id || '';
  const activeIndex = task.tabs.findIndex((tab) => tab.id === activeTabId);

  return (
    <div className="relative min-h-screen bg-white">
      {/* Tab Content Area - fills viewport above tab bar */}
      <div
        className={`h-[calc(100vh-185px)] ${isTransitioning ? 'pointer-events-none' : ''}`}
      >
        <CanvasArea
          tabs={task.tabs}
          activeTabId={activeTabId}
          dragProgress={dragProgress}
          dragDirection={dragDirection}
          onCanvasTypeSelect={handleCanvasTypeSelect}
        />
      </div>

      {/* Tab Bar - fixed to bottom */}
      <TabBar
        taskName={task.name}
        tabs={task.tabs}
        activeTabId={activeTabId}
        tabCount={task.tabs.length}
        dragProgress={dragProgress}
        dragDirection={dragDirection}
        isTransitioning={isTransitioning}
        onSwipeStart={handleSwipeStart}
        onSwipeMove={handleSwipeMove}
        onSwipeEnd={handleSwipeEnd}
        onTabNameChange={handleTabNameChange}
        onTaskNameChange={handleTaskNameChange}
        onSwitcherToggle={handleSwitcherToggle}
        onSwipeUp={handleSwipeUp}
        isFirstTab={activeIndex === 0}
        isLastTab={activeIndex === task.tabs.length - 1}
        isSingleTab={task.tabs.length === 1}
      />

      {/* Tab Switcher - full-screen overlay */}
      <TabSwitcher
        isOpen={isSwitcherOpen}
        tabs={task.tabs}
        activeTabId={activeTabId}
        taskName={task.name}
        onTabSelect={handleTabSelect}
        onTabClose={handleTabClose}
        onNewTab={createNewTab}
        onClose={handleSwitcherToggle}
      />
    </div>
  );
}
