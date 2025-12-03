#!/bin/bash
# -------------------------------------------------------------
# VIBEAI CLI – Installation Script
# -------------------------------------------------------------

echo "🚀 Installing VibeAI CLI..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    echo "   Please install Python 3.8+ from https://python.org"
    exit 1
fi

# Check Python version
PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
echo "✅ Python $PYTHON_VERSION detected"

# Install click dependency
echo "📦 Installing dependencies..."
python3 -m pip install --user click

# Make vibeai.py executable
chmod +x vibeai.py

# Create symlink in /usr/local/bin
if [ -w /usr/local/bin ]; then
    ln -sf "$(pwd)/vibeai.py" /usr/local/bin/vibeai
    echo "✅ Created symlink: /usr/local/bin/vibeai"
else
    echo "⚠️  Cannot write to /usr/local/bin"
    echo "   Run with sudo or add $(pwd) to your PATH:"
    echo "   export PATH=\"\$PATH:$(pwd)\""
fi

# Test installation
echo ""
echo "🧪 Testing installation..."
python3 vibeai.py --version

echo ""
echo "✅ Installation complete!"
echo ""
echo "Usage:"
echo "  vibeai create myapp --type=flutter"
echo "  vibeai init --framework=react"
echo "  vibeai deploy --platform=vercel"
echo "  vibeai theme --framework=flutter --preset=ocean"
echo ""
echo "For more help: vibeai --help"
