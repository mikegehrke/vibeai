"""
Preview Module für UI Rendering und Live Preview.
"""

import os
from flask import Flask, render_template, jsonify

app = Flask(__name__)

@app.route('/preview')
def preview():
    """
    Render the preview page.
    """
    try:
        return render_template('preview.html')
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def start_preview_server(host='0.0.0.0', port=5000):
    """
    Start the preview server.
    """
    try:
        app.run(host=host, port=port)
    except Exception as e:
        print(f"Error starting server: {e}")

if __name__ == "__main__":
    start_preview_server()