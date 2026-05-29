# Rules of Engagement for AI Developer

You must strictly follow the rules outlined below. Do not break these rules under any circumstances.

## 1. Design System & Reusable Components Adherence
- All styling (colors, fonts, sizes), text, buttons, alerts, text inputs, back buttons, navigation bars, headers, cards, icons, logos, and scaling metrics must be imported and used **exclusively** from the `/App/Reusable-Component/` directory.
- **NEVER** use inline hardcoded color hex codes (e.g. `#246BFD`, `#0A1629`, etc.) or custom inline text sizes/font weight styles.
- **NEVER** use React Native's standard `<Text>` component directly in screens. Always use `<CText>` imported from the design system.
- Always use `<AppButton>`, `<InputBox>`, `<AppIcon>`, `<Logo>`, `<AppName>`, `<Header>`, `<AppAlert>`, `<Scale>` for any component elements.

## 2. Figma Reference Compliance
- All UI layouts, screens, navigation structures, and visual designs must strictly match the Figma references located in `/Volumes/Untitled/Vibe-Match/APP_REFF`.
- Do not implement any layout, padding, font, icon, or functional variation that is not explicitly present in the Figma screenshots.

## 3. Screen Folder Structure
Every screen under `/App/Screens/` must strictly follow the exact same structure as `/App/Screens/ACTIVITY/`:
- `[SCREEN-NAME]-SCREENS/` (a directory for sub-screens inside this screen context)
- `[SCREEN-NAME]-COMPONENT/` (a directory for custom components local to this screen)
- `index.js` (empty index file acting as the screen entry point)

## 4. Terminal Command Execution Permission
- **CRITICAL**: Before executing **ANY** command in the terminal (including running builds, starting servers, running lint, testing, clearing cache, or running any scripts), you **MUST** ask the user for explicit approval.

## 5. Precise Modifications (Zero Bloat)
- Do only exactly what has been requested. Do not add any extra code, helper functions, comments, logs, mock screen flows, or files beyond the specified scope.
