"""
VibeAI - Utility Functions
"""

from typing import Any, Dict, List
from sqlalchemy.orm import Session


async def export_data(filter_params: Any) -> List[Dict[str, Any]]:
    """
    Export data based on filter parameters
    
    Args:
        filter_params: Filter configuration (ExportFilter schema)
    
    Returns:
        List of exported data items
    """
    # TODO: Implement proper export logic based on filter
    # For now, return empty list to make imports work
    return []


def sanitize_filename(filename: str) -> str:
    """Remove unsafe characters from filename"""
    import re
    return re.sub(r'[^\w\s-]', '', filename).strip()


def get_file_size_mb(file_path: str) -> float:
    """Get file size in megabytes"""
    import os
    if os.path.exists(file_path):
        return os.path.getsize(file_path) / (1024 * 1024)
    return 0.0
