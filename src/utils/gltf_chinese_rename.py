import json
from pathlib import Path


def fix_gltf_names(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        gltf_data = json.load(file)

    for node in gltf_data.get("nodes", []):
        if "name" in node:
            node["name"] = node["name"].encode("utf-8").decode()

    with open(file_path, "w", encoding="utf-8") as file:
        json.dump(gltf_data, file, ensure_ascii=False, indent=2)


def process_gltf_files(directory):
    gltf_files = Path(directory).glob("*.gltf")
    for gltf_file in gltf_files:
        print(f"Processing: {gltf_file}")
        fix_gltf_names(gltf_file)


if __name__ == "__main__":
    # directory = input("Enter the directory path to process GLTF files: ")
    directory=r"models\DSTmodel"
    process_gltf_files(directory)
    print("Processing complete.")
