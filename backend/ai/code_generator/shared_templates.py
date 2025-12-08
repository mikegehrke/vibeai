# -------------------------------------------------------------
# VIBEAI – SHARED UI CODE TEMPLATES
# -------------------------------------------------------------
"""
Zentrale Template-Bibliothek für Code-Generierung

Templates für:
- Flutter/Dart
- React/JSX
- Vue
- HTML

Wiederverwendbare Code-Bausteine für alle Frameworks.
"""


class SharedTemplates:
    """
    Shared Code Templates für Multi-Framework Support.
    """

    # ---------------------------------------------------------
    # FLUTTER TEMPLATES
    # ---------------------------------------------------------
    FLUTTER_SCREEN = """
import 'package:flutter/material.dart';

class {screenName} extends StatelessWidget {{
  @override
  Widget build(BuildContext context) {{
    return Scaffold(
      appBar: AppBar(
        title: Text('{title}'),
        backgroundColor: Colors.blue,
      ),
      body: {body},
    );
  }}
}}
"""

    FLUTTER_BUTTON = """
ElevatedButton(
  onPressed: () => {{}},
  style: ElevatedButton.styleFrom(
    backgroundColor: Color(0xFF{color}),
    padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
  ),
  child: Text("{label}")
)
"""

    FLUTTER_TEXT = """
Text(
  "{value}",
  style: TextStyle(
    fontSize: {size},
    color: Color(0xFF{color}),
  ),
)
"""

    FLUTTER_INPUT = """
TextField(
  decoration: InputDecoration(
    hintText: "{placeholder}",
    border: OutlineInputBorder(),
  ),
)
"""

    FLUTTER_IMAGE = """
Image.network(
  "{url}",
  width: {width},
  height: {height},
  fit: BoxFit.cover,
)
"""

    FLUTTER_CONTAINER = """
Container(
  padding: EdgeInsets.all(16),
  decoration: BoxDecoration(
    color: Color(0xFF{backgroundColor}),
    borderRadius: BorderRadius.circular({borderRadius}),
  ),
  child: {child},
)
"""

    FLUTTER_COLUMN = """
Column(
  crossAxisAlignment: CrossAxisAlignment.stretch,
  children: [
    {children}
  ],
)
"""

    FLUTTER_ROW = """
Row(
  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
  children: [
    {children}
  ],
)
"""

    # ---------------------------------------------------------
    # REACT TEMPLATES
    # ---------------------------------------------------------
    REACT_SCREEN = """
import React from 'react';

export default function {screenName}() {{
  return (
    <div style={{{{ padding: 20, backgroundColor: '#{backgroundColor}' }}}}>
      <h1>{title}</h1>
      {body}
    </div>
  );
}}
"""

    REACT_TEXT = """
<p style={{{{ fontSize: {size}px, color: '#{color}' }}}}>
  {value}
</p>
"""

    REACT_BUTTON = """
<button
  onClick={{() => {{}}}}
  style={{{{
    backgroundColor: '#{color}',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  }}}}
>
  {label}
</button>
"""

    REACT_INPUT = """
<input
  type="text"
  placeholder="{placeholder}"
  style={{{{
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '100%',
  }}}}
/>
"""

    REACT_IMAGE = """
<img
  src="{url}"
  alt="{alt}"
  style={{{{
    width: {width}px,
    height: {height}px,
    objectFit: 'cover',
  }}}}
/>
"""

    REACT_CONTAINER = """
<div style={{{{
  padding: 16,
  backgroundColor: '#{backgroundColor}',
  borderRadius: {borderRadius}px,
}}}}>
  {children}
</div>
"""

    # ---------------------------------------------------------
    # VUE TEMPLATES
    # ---------------------------------------------------------
    VUE_SCREEN = """
<template>
  <div class="screen" style="padding: 20px; background-color: #{backgroundColor};">
    <h1>{title}</h1>
    {body}
  </div>
</template>

<script>
export default {{
  name: '{screenName}',
  data() {{
    return {{}};
  }},
}};
</script>
"""

    VUE_TEXT = """
<p style="font-size: {size}px; color: #{color};">
  {value}
</p>
"""

    VUE_BUTTON = """
<button
  @click="handleClick"
  style="background-color: #{color}; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer;"
>
  {label}
</button>
"""

    VUE_INPUT = """
<input
  v-model="inputValue"
  type="text"
  placeholder="{placeholder}"
  style="padding: 10px; border: 1px solid #ccc; border-radius: 4px; width: 100%;"
/>
"""

    # ---------------------------------------------------------
    # HTML TEMPLATES
    # ---------------------------------------------------------
    HTML_SCREEN = """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 20px;
      background-color: #{backgroundColor};
    }}
  </style>
</head>
<body>
  <h1>{title}</h1>
  {body}
</body>
</html>
"""

    HTML_TEXT = """
<p style="font-size: {size}px; color: #{color};">
  {value}
</p>
"""

    HTML_BUTTON = """
<button
  onclick="handleClick()"
  style="background-color: #{color}; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer;"
>
  {label}
</button>
"""

    HTML_INPUT = """
<input
  type="text"
  placeholder="{placeholder}"
  style="padding: 10px; border: 1px solid #ccc; border-radius: 4px; width: 100%;"
/>
"""


# Global Instance
templates = SharedTemplates()