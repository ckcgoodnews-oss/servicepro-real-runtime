from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

items = [
    ('plumbing', '#247d70', 'Plumbing'),
    ('hvac', '#3c7ec4', 'HVAC'),
    ('carpet_cleaning', '#9b6f4f', 'Carpet & Upholstery Cleaning'),
    ('landscaping', '#56843f', 'Landscaping'),
    ('electrical', '#d49328', 'Electrical'),
    ('residential_cleaning', '#5c91a8', 'Residential Cleaning'),
    ('commercial_cleaning', '#397b89', 'Commercial Janitorial'),
    ('pest_control', '#75613b', 'Pest Control'),
    ('roofing', '#8a4f42', 'Roofing'),
    ('garage_door', '#596879', 'Garage Door'),
    ('appliance_repair', '#536fa3', 'Appliance Repair'),
    ('handyman', '#9a7041', 'Handyman'),
    ('painting', '#9168a7', 'Painting'),
    ('pressure_washing', '#287fa1', 'Pressure Washing'),
    ('pool_spa', '#238aa2', 'Pool & Spa'),
    ('locksmith_security', '#47566a', 'Locksmith & Security'),
    ('tree_care', '#3f7749', 'Tree Care'),
    ('snow_removal', '#6688a6', 'Snow & Ice Management'),
    ('irrigation', '#3d8d73', 'Irrigation'),
    ('septic', '#75684c', 'Septic & Wastewater'),
    ('chimney_fireplace', '#9b513d', 'Chimney & Fireplace'),
    ('solar', '#c48728', 'Solar'),
    ('home_inspection', '#637389', 'Home Inspection'),
    ('restoration', '#7d5b8f', 'Restoration & Remediation'),
    ('moving', '#4f72a3', 'Moving Services'),
    ('junk_removal', '#77704b', 'Junk Removal'),
    ('window_gutter', '#38859a', 'Window & Gutter Cleaning'),
    ('flooring', '#8a6949', 'Flooring'),
    ('property_maintenance', '#56705f', 'Property Maintenance'),
    ('fencing', '#7f674c', 'Fencing')
]

output_dir = Path('apps/web/public/storefront/industries')
output_dir.mkdir(parents=True, exist_ok=True)
size = (1200, 600)

try:
    font = ImageFont.truetype('arial.ttf', 56)
except Exception:
    font = ImageFont.load_default()

for key, color, label in items:
    path = output_dir / f'{key}.jpg'
    image = Image.new('RGB', size, color)
    draw = ImageDraw.Draw(image)
    bbox = draw.textbbox((0, 0), label, font=font)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    draw.text(((size[0] - w) / 2, (size[1] - h) / 2), label, fill='white', font=font)
    image.save(path, quality=85, optimize=True)
    print(f'created {path}')
