import json
import os
import requests

def download_file(url, directory):
    url=fix_url_path(url)
    print("Downloading file from", url)
    local_filename =fix_url_path(os.path.join(directory, url.split('/')[-1]))
    with requests.get(url, stream=True) as r:
        r.raise_for_status()
        with open(local_filename, 'wb') as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)
    return local_filename

def fix_url_path(url):
    return url.replace('\\', '/')

def download_gltf_and_resources(gltf_url, save_directory):
    # 确保保存目录存在
    if not os.path.exists(save_directory):
        os.makedirs(save_directory)

    # 下载GLTF文件
    gltf_path = download_file(gltf_url, save_directory)

    # 读取并解析GLTF文件
    with open(gltf_path) as f:
        gltf = json.load(f)

    # 下载所有二进制文件
    if 'buffers' in gltf:
        for buffer in gltf['buffers']:
            if 'uri' in buffer:
                buffer_url = os.path.join(gltf_url.rsplit('/', 1)[0], fix_url_path(buffer['uri']))
                download_file(buffer_url, save_directory)

    # 下载所有图片文件
    if 'images' in gltf:
        for image in gltf['images']:
            if 'uri' in image:
                image_url = os.path.join(gltf_url.rsplit('/', 1)[0], fix_url_path(image['uri']))
                download_file(image_url, save_directory)

if __name__ == "__main__":
    gltf_url = input("Enter the URL of the GLTF file: ") or "https://cdn.aframe.io/test-models/models/glTF-2.0/virtualcity/VC.gltf"
    save_directory = "./models/virtualcity"
    download_gltf_and_resources(gltf_url, save_directory)