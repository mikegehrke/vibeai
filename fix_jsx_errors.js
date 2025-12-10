#!/usr/bin/env node

/**
 * Quick Fix Script - Uses Bugfix Agent to fix JSX errors
 * Usage: OPENAI_API_KEY=sk-... node fix_jsx_errors.js
 */

const path = require('path');
const fs = require('fs');
const { OpenAI } = require('openai');

// Simple logger
const logger = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`)
};

// OpenAI service
async function askOpenAI(instruction, code) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable not set');
  }

  const openai = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL || 'gpt-4o';

  logger.info(`Calling OpenAI ${model}...`);

  const messages = [
    { role: 'system', content: instruction }
  ];

  if (code) {
    messages.push({ role: 'user', content: code });
  }

  const response = await openai.chat.completions.create({
    model: model,
    messages: messages,
    temperature: 0,
    max_tokens: 16000
  });

  return response.choices[0].message.content;
}

// Extract relevant sections around error lines
function extractRelevantSections(content, errorLines) {
  const lines = content.split('\n');
  const sections = [];
  
  // Extract sections around each error line
  for (const lineNum of errorLines) {
    const start = Math.max(0, lineNum - 50);
    const end = Math.min(lines.length, lineNum + 50);
    sections.push({
      line: lineNum,
      start: start,
      end: end,
      content: lines.slice(start, end).join('\n')
    });
  }
  
  // Also get the structure (opening and closing tags)
  const structureStart = lines.slice(2045, 2060).join('\n');
  const structureEnd = lines.slice(4120, 4129).join('\n');
  
  return {
    structureStart,
    structureEnd,
    sections,
    fullContent: content
  };
}

// Bugfix function
async function searchAndFix(targetFile) {
  logger.info('🐛 Bugfix Agent scanning for errors...');

  // Read target file
  const content = fs.readFileSync(targetFile, 'utf8');
  logger.info(`📄 File size: ${content.length} characters`);

  // Extract relevant sections
  const errorLines = [2047, 2963, 3174, 4093, 4095, 4127, 4129];
  const relevant = extractRelevantSections(content, errorLines);
  
  // Create focused context
  const focusedContext = `
STRUCTURE START (lines 2045-2060):
${relevant.structureStart}

TERNARY OPERATOR START (line 2963-2964):
${relevant.sections.find(s => s.line === 2963)?.content || 'N/A'}

TERNARY OPERATOR MIDDLE (line 3174):
${relevant.sections.find(s => s.line === 3174)?.content || 'N/A'}

TERNARY OPERATOR END (line 4093):
${relevant.sections.find(s => s.line === 4093)?.content || 'N/A'}

CLOSING TAGS (lines 4094-4096):
${relevant.sections.find(s => s.line === 4095)?.content || 'N/A'}

STRUCTURE END (lines 4120-4129):
${relevant.structureEnd}
`;

  const prompt = `You are an expert debugger analyzing JSX/React code structure.

The file has these linter errors:
- Line 2047: JSX element 'div' has no corresponding closing tag
- Line 4093: Unexpected token (Did you mean {'}'} or &rbrace;?)
- Line 4095: ')' expected
- Line 4129: Unexpected token (Did you mean {'}'} or &rbrace;?)
- Line 4129: '</' expected

Analyze the structure and find the issues:

1. Check if all opening divs have corresponding closing divs
2. Check if the ternary operator structure is correct: {condition ? (...) : condition2 ? (...) : condition3 ? (...) : null}
3. Check if all JSX comments use correct syntax: {/* comment */}
4. Check if all brackets and parentheses are properly closed

Return ONLY the corrected sections. Format as:
FIX_START
[corrected code for lines 2045-2060]
FIX_MIDDLE
[corrected code for lines 2963-3174]
FIX_END
[corrected code for lines 4093-4129]
FIX_END

If you can't identify the issue, return: NO_FIX_FOUND`;

  try {
    const response = await askOpenAI(prompt, focusedContext);

    if (response.trim() === 'NO_FIX_FOUND' || response.includes('NO_FIX_FOUND')) {
      logger.info('⚠️  Could not identify fix');
      return null;
    }

    logger.info('✅ Bug fixes generated');
    return response;

  } catch (error) {
    logger.error(`Bugfix error: ${error.message}`);
    return null;
  }
}

// Main function
async function fixErrors() {
  console.log('🔧 Starting Bugfix Agent...');
  
  const targetFile = path.join(__dirname, 'frontend/app/builder/[projectId]/page.jsx');
  console.log(`📁 Target file: ${targetFile}`);
  
  if (!fs.existsSync(targetFile)) {
    console.error(`❌ File not found: ${targetFile}`);
    process.exit(1);
  }

  // Check API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY environment variable not set');
    console.log('Please set it: export OPENAI_API_KEY=sk-...');
    process.exit(1);
  }

  try {
    const fixResponse = await searchAndFix(targetFile);
    
    if (!fixResponse) {
      console.log('⚠️  No fixes generated');
      return;
    }
    
    console.log('\n📝 Fix suggestions:');
    console.log(fixResponse);
    console.log('\n⚠️  Please review and apply fixes manually');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixErrors();
