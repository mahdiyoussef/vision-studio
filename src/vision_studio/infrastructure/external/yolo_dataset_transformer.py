import os
import shutil
import csv
import json
import random
from typing import Dict
from vision_studio.domain.ports.dataset_port import DatasetTransformerInterface

class YoloDatasetTransformer(DatasetTransformerInterface):
    def split_and_format(self, source_dir: str, dest_dir: str, column_mapping: Dict[str, str], split_ratios: Dict[str, float]) -> str:
        # Expected column_mapping: {"image_path": "filename", "xmin": "xmin", "ymin": "ymin", "xmax": "xmax", "ymax": "ymax", "class": "class"}
        
        # Read the CSV file to get annotations
        csv_file = None
        for file in os.listdir(source_dir):
            if file.endswith('.csv'):
                csv_file = os.path.join(source_dir, file)
                break
                
        if not csv_file:
            raise ValueError("No CSV file found in source directory")
            
        img_key = column_mapping.get("image") or column_mapping.get("image_path", "")
        cls_key = column_mapping.get("label") or column_mapping.get("class") or column_mapping.get("class_label", "")
        xmin_key = column_mapping.get("bbox_xmin") or column_mapping.get("xmin", "")
        ymin_key = column_mapping.get("bbox_ymin") or column_mapping.get("ymin", "")
        xmax_key = column_mapping.get("bbox_xmax") or column_mapping.get("xmax", "")
        ymax_key = column_mapping.get("bbox_ymax") or column_mapping.get("ymax", "")

        annotations_by_image = {}
        classes = set()
        with open(csv_file, 'r', encoding='utf-8', errors='ignore') as f:
            reader = csv.DictReader(f)
            for row in reader:
                img_path = row.get(img_key, "")
                if not img_path:
                    continue
                if img_path not in annotations_by_image:
                    annotations_by_image[img_path] = []
                
                cls_name = row.get(cls_key, "object")
                classes.add(cls_name)
                
                try:
                    xmin = float(row.get(xmin_key, 0.0))
                    ymin = float(row.get(ymin_key, 0.0))
                    xmax = float(row.get(xmax_key, 0.0))
                    ymax = float(row.get(ymax_key, 0.0))
                    
                    annotations_by_image[img_path].append({
                        "class": cls_name,
                        "box": [xmin, ymin, xmax, ymax]
                    })
                except (ValueError, KeyError, TypeError):
                    pass

        classes_list = list(classes)
        class_to_idx = {c: i for i, c in enumerate(classes_list)}
        
        # Split images
        images = list(annotations_by_image.keys())
        random.shuffle(images)
        
        train_ratio = split_ratios.get('train', 0.7) / 100.0 if split_ratios.get('train', 0.7) > 1 else split_ratios.get('train', 0.7)
        val_ratio = split_ratios.get('val', 0.2) / 100.0 if split_ratios.get('val', 0.2) > 1 else split_ratios.get('val', 0.2)
        
        train_idx = int(len(images) * train_ratio)
        val_idx = int(len(images) * (train_ratio + val_ratio))
        
        splits = {
            'train': images[:train_idx],
            'val': images[train_idx:val_idx],
            'test': images[val_idx:]
        }
        
        os.makedirs(dest_dir, exist_ok=True)
        for split, split_images in splits.items():
            split_img_dir = os.path.join(dest_dir, 'images', split)
            split_lbl_dir = os.path.join(dest_dir, 'labels', split)
            os.makedirs(split_img_dir, exist_ok=True)
            os.makedirs(split_lbl_dir, exist_ok=True)
            
            for img in split_images:
                src_img = os.path.join(source_dir, img)
                dst_img = os.path.join(split_img_dir, os.path.basename(img))
                if os.path.exists(src_img):
                    shutil.copy(src_img, dst_img)
                
                # Write YOLO labels
                lbl_path = os.path.join(split_lbl_dir, os.path.splitext(os.path.basename(img))[0] + '.txt')
                with open(lbl_path, 'w') as lf:
                    for ann in annotations_by_image[img]:
                        cls_idx = class_to_idx[ann['class']]
                        # Dummy normalize for example
                        lf.write(f"{cls_idx} 0.5 0.5 0.2 0.2\n")
        
        # Write data.yaml
        yaml_path = os.path.join(dest_dir, 'data.yaml')
        with open(yaml_path, 'w') as yf:
            yf.write(f"train: {os.path.join(dest_dir, 'images', 'train')}\n")
            yf.write(f"val: {os.path.join(dest_dir, 'images', 'val')}\n")
            yf.write(f"test: {os.path.join(dest_dir, 'images', 'test')}\n\n")
            yf.write(f"nc: {len(classes_list)}\n")
            yf.write(f"names: {classes_list}\n")
            
        return yaml_path

