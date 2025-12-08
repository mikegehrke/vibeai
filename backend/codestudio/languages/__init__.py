# -------------------------------------------------------------
# LANGUAGE EXECUTORS
# -------------------------------------------------------------

# Import necessary modules
import os
import sys

# Define a function to execute a command
def execute_command(command):
    try:
        # Execute the command and get the output
        output = os.popen(command).read()
        return output
    except Exception as e:
        return str(e)

# Define a function to check if a file exists
def file_exists(file_path):
    return os.path.isfile(file_path)

# Define a function to read a file
def read_file(file_path):
    if file_exists(file_path):
        with open(file_path, 'r') as file:
            return file.read()
    else:
        return "File does not exist."

# Define a function to write to a file
def write_file(file_path, content):
    try:
        with open(file_path, 'w') as file:
            file.write(content)
        return "Write successful."
    except Exception as e:
        return str(e)

# Example usage
if __name__ == "__main__":
    command_output = execute_command('echo Hello, World!')
    print(command_output)

    file_path = '/path/to/file.txt'
    write_status = write_file(file_path, 'Hello, World!')
    print(write_status)

    file_content = read_file(file_path)
    print(file_content)