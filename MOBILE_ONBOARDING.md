# Mobile App Onboarding: Motion & Interaction Guide

Welcome to the Teragon Mobile Development team! This document outlines the key micro-interactions, animations, and design patterns used in the mockup (mobile version) of the app. These are critical for maintaining the "premium" feel of the native Android application.

## 1. Core Motion Principles

We follow a "Natural & Responsive" motion philosophy. Animations should feel intentional, physically grounded, and provide immediate feedback to user actions.

### Standard Easing Functions
| Name | Web/CSS Value | Android/Compose Equivalent | Use Case |
| :--- | :--- | :--- | :--- |
| **Standard** | `[0.4, 0, 0.2, 1]` | `FastOutSlowInEasing` | Default for most UI moves |
| **Decelerate** | `[0, 0, 0.2, 1]` | `LinearOutSlowInEasing` | Incoming elements |
| **Accelerate** | `[0.4, 0, 1, 1]` | `FastOutLinearInEasing` | Outgoing elements |
| **Drawer/Apple**| `[0.32, 0.72, 0, 1]`| Custom Cubic Bezier | Bottom sheets and drawers |
| **Spring** | `bounce: 0.15` | `spring(dampingRatio: 0.85f)` | Tab switches, playful UI |

---

## 2. Global Navigation Interactions

### Sticky Header Scroll
The header hides when scrolling down and reveals immediately when scrolling up.
- **Trigger**: Scroll delta > 10px.
- **Animation**: Slide on Y-axis.
- **Duration**: 300ms.
- **Easing**: Standard.

### Sub-view Navigation (Back Button)
When navigating into a settings sub-screen, the Logo fades out and the Back button fades in with a slight lateral slide.
- **Exit (Logo)**: Opacity `1 -> 0`, X `0 -> 8px`.
- **Enter (Back)**: Opacity `0 -> 1`, X `-8px -> 0`.
- **Duration**: 250ms.

### Tab Bar Indicator
The selection indicator on the bottom nav and segment controls uses a layout-id based transition (shared element transition).
- **Behavior**: The background "pill" slides and morphs into the new position.
- **Animation Type**: Spring (low bounce).
- **Duration**: 500ms.

---

## 3. Feed & List Micro-interactions

### Measurement Card Expansion
Cards expand to reveal the histogram and details.
- **Animation**: Animate height from `0` to `auto`.
- **Content Reveal**: Fade in content slightly after height starts moving.
- **Duration**: 300ms.

### Alert Acknowledgment Flow
This is a critical multi-step interaction:
1. **Initial Tap**: The "ACKNOWLEDGE" button label stays, but a "Are you sure?" confirmation slides in above it using a grid-row expansion.
2. **Confirmation Tap**:
    - Button turns **Green** (`#22c55e`).
    - Label changes to "✓ DONE".
    - Success flash lasts ~350ms.
3. **Card Exit**: The entire card slides out to the **Right** (X: 40px) and fades out.
4. **Layout Shift**: Remaining cards in the list slide up smoothly to fill the gap (`layout` prop in Framer).

### Interactive Histogram (Scrubber)
The histogram on the card allows for "scrubbing" to see specific measurement values.
- **Follower**: A vertical line and a tooltip follow the touch/drag position.
- **Feedback**: Values update in real-time with zero lag.
- **Entrance/Exit**: Tooltip appears/disappears on touch start/end.

---

## 4. UI Components & Drawers

### Filter Drawer (Bottom Sheet)
- **Entrance**: Slides up from bottom (`Y: 100% -> 0`).
- **Easing**: Custom `[0.32, 0.72, 0, 1]` for that "weighty" feel.
- **Backdrop**: Fades in a `black/40` overlay with a `backdrop-blur`.

### Selection States
- **Checkboxes/Buttons**: Use a subtle `scale(0.95)` on tap (`whileTap`) to simulate physical button depress.
- **Severity Filters**: Selected items use an **Inset Shadow** to feel "pressed in".

---

## 5. Summary Animation Table

| Feature | Animation Name | Trigger | Behavior |
| :--- | :--- | :--- | :--- |
| **New Alert** | `SlideDown` | Data Update | Slides from top of feed, fades out after 2s |
| **Badge Entry** | `ScaleIn` | Mounting | Scales from `0.0` to `1.0` with overshoot |
| **Pulse** | `Pulse` | Continuous | Opacity loop on the "Active" dot |
| **Unit Toggle** | `ColorCrossfade`| Tap | Underline decoration and text color transition |

---

## 6. Design System & Color Mapping

We use a dynamic design system where colors are mapped to severity IDs.

### Severity Color Tokens
| Severity ID | Default Color | CSS Variable |
| :--- | :--- | :--- |
| **CRITICAL** | `#dc2626` (Red) | `--severity-critical` |
| **HIGH** | `#f97316` (Orange)| `--severity-high` |
| **MEDIUM** | `#eab308` (Yellow)| `--severity-medium` |
| **LOW** | `#3b82f6` (Blue) | `--severity-low` |
| **NORMAL** | `#9fe870` (Lime) | N/A |

### Dynamic Theming
In the web version, these colors are injected into `:root` and can be updated via settings. For the native app, ensure these are handled via a `SeverityPalette` data class or similar theme provider.

---

## 7. Implementation Tips for Kotlin/Compose

1. **Shared Element Transitions**: Use `Modifier.sharedBounds` or `AnimatedContent` for the Tab indicator logic.
2. **Haptics**: Always trigger a `HapticFeedbackType.TextHandleMove` (subtle tick) when the Scrubber moves over an anomaly.
3. **Springs**: For the Tab indicator, use `spring(dampingRatio = Spring.DampingRatioLowBouncy)`.
4. **Layout Animation**: Use `Modifier.animateItemPlacement()` on the LazyColumn items to achieve the smooth "sliding up" effect when a card is removed.
