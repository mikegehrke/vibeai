const ai = require("./openai");
const logger = require("../utils/logger");

/**
 * GUI Builder Service
 * Generates complete UI screens for various frameworks
 */

/**
 * Generate UI screen
 */
async function generateUI(description, framework) {
  logger.info(`🎨 Generating ${framework} UI...`);

  const prompts = {
    "React": getReactPrompt(description),
    "Flutter": getFlutterPrompt(description),
    "SwiftUI": getSwiftUIPrompt(description),
    "Jetpack Compose": getComposePrompt(description),
    "Vue.js": getVuePrompt(description)
  };

  const prompt = prompts[framework] || prompts["React"];

  try {
    const code = await ai.ask(prompt, "");
    logger.info("✅ UI generated");
    return cleanCode(code);
  } catch (error) {
    logger.error(`GUI Builder error: ${error.message}`);
    throw error;
  }
}

/**
 * React prompt
 */
function getReactPrompt(description) {
  return `Generate a COMPLETE React component for: ${description}

Include:
- Modern React (hooks, functional components)
- TypeScript types
- Styled-components or Tailwind CSS
- State management (useState, useContext)
- Form validation (if applicable)
- Error handling
- Loading states
- Accessibility (ARIA labels)
- Responsive design
- Event handlers
- API integration (if needed)

Return ONLY the complete React component code, no explanations.`;
}

/**
 * Flutter prompt
 */
function getFlutterPrompt(description) {
  return `Generate a COMPLETE Flutter widget for: ${description}

Include:
- StatefulWidget or StatelessWidget
- Material Design widgets
- State management (setState, Provider, Riverpod)
- Form validation
- Error handling
- Loading indicators
- Navigation
- Responsive layout
- Theme support
- Proper null safety

Return ONLY the complete Dart code, no explanations.`;
}

/**
 * SwiftUI prompt
 */
function getSwiftUIPrompt(description) {
  return `Generate a COMPLETE SwiftUI view for: ${description}

Include:
- SwiftUI views and modifiers
- @State, @Binding, @ObservedObject
- Navigation
- Form validation
- Error handling
- Loading states
- Accessibility
- iOS design patterns
- Proper data flow

Return ONLY the complete Swift code, no explanations.`;
}

/**
 * Jetpack Compose prompt
 */
function getComposePrompt(description) {
  return `Generate a COMPLETE Jetpack Compose screen for: ${description}

Include:
- Composable functions
- Material Design 3
- State management (remember, mutableStateOf)
- ViewModel integration
- Form validation
- Error handling
- Loading states
- Navigation
- Accessibility
- Proper recomposition

Return ONLY the complete Kotlin code, no explanations.`;
}

/**
 * Vue.js prompt
 */
function getVuePrompt(description) {
  return `Generate a COMPLETE Vue.js component for: ${description}

Include:
- Vue 3 Composition API
- <script setup> syntax
- TypeScript
- Reactive state (ref, reactive, computed)
- Form validation
- Error handling
- Loading states
- Emit events
- Props
- Tailwind CSS or scoped styles

Return ONLY the complete Vue SFC code, no explanations.`;
}

/**
 * Clean code response
 */
function cleanCode(response) {
  let cleaned = response.trim();

  // Remove markdown code blocks
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-z]*\s*/, "").replace(/```\s*$/, "");
  }

  return cleaned;
}

module.exports = {
  generateUI
};
