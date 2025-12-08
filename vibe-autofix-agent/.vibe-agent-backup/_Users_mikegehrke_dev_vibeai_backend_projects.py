import json
import os


def load_project_data(file_path):
    """
    Load project data from a JSON file.

    :param file_path: Path to the JSON file.
    :return: Dictionary containing project data.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"The file {file_path} does not exist.")

    with open(file_path, "r") as file:
        try:
            data = json.load(file)
        except json.JSONDecodeError as e:
            raise ValueError(f"Error decoding JSON from file {file_path}: {e}")

    return data


def save_project_data(file_path, data):
    """
    Save project data to a JSON file.

    :param file_path: Path to the JSON file.
    :param data: Dictionary containing project data to save.
    """
    with open(file_path, "w") as file:
        try:
            json.dump(data, file, indent=4)
        except TypeError as e:
            raise ValueError(f"Error encoding data to JSON for file {file_path}: {e}")


def get_project_names(data):
    """
    Extract project names from the project data.

    :param data: Dictionary containing project data.
    :return: List of project names.
    """
    if not isinstance(data, dict):
        raise TypeError("Data should be a dictionary.")

    return [project.get("name", "Unnamed Project") for project in data.get("projects", [])]


def add_project(data, project_name, project_details):
    """
    Add a new project to the project data.

    :param data: Dictionary containing project data.
    :param project_name: Name of the new project.
    :param project_details: Dictionary containing details of the new project.
    :return: Updated project data.
    """
    if not isinstance(data, dict):
        raise TypeError("Data should be a dictionary.")

    if "projects" not in data:
        data["projects"] = []

    new_project = {"name": project_name, "details": project_details}

    data["projects"].append(new_project)
    return data


def remove_project(data, project_name):
    """
    Remove a project from the project data by name.

    :param data: Dictionary containing project data.
    :param project_name: Name of the project to remove.
    :return: Updated project data.
    """
    if not isinstance(data, dict):
        raise TypeError("Data should be a dictionary.")

    if "projects" not in data:
        return data

    data["projects"] = [project for project in data["projects"] if project.get("name") != project_name]
    return data