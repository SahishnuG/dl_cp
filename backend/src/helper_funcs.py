import os
from PIL import Image, ImageDraw, ImageFont
from pdf2image import convert_from_path
from docx import Document

def convert_to_image(file_path, output_folder="output_images"):
    os.makedirs(output_folder, exist_ok=True)

    file_name = os.path.basename(file_path)
    name, ext = os.path.splitext(file_name)
    ext = ext.lower()

    output_path = os.path.join(output_folder, f"{name}.png")
    if os.path.exists(output_path):
        print(f"Image already exists at {output_path}")
        return output_path

    # 1️⃣ If already an image
    if ext in [".png", ".jpg", ".jpeg", ".bmp", ".webp"]:
        img = Image.open(file_path)
        img.save(output_path)
        print(f"Image saved at {output_path}")
        return output_path

    # 2️⃣ PDF → Image
    elif ext == ".pdf":
        pages = convert_from_path(file_path,
                                  poppler_path=r"D:\Program Files\poppler-25.12.0\Library\bin")
        pages[0].save(output_path, "PNG")
        print(f"PDF converted to image at {output_path}")
        return output_path

    # 3️⃣ TXT → Image
    elif ext == ".txt":
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()

        img = Image.new("RGB", (1000, 1200), "white")
        draw = ImageDraw.Draw(img)

        try:
            font = ImageFont.truetype("arial.ttf", 20)
        except:
            font = ImageFont.load_default()

        draw.multiline_text((50, 50), text, fill="black", font=font)
        img.save(output_path)
        print(f"Text file converted to image at {output_path}")
        return output_path

    # 4️⃣ DOCX → Image
    elif ext == ".docx":
        doc = Document(file_path)
        text = "\n".join([para.text for para in doc.paragraphs])

        img = Image.new("RGB", (1000, 1200), "white")
        draw = ImageDraw.Draw(img)

        try:
            font = ImageFont.truetype("arial.ttf", 20)
        except:
            font = ImageFont.load_default()

        draw.multiline_text((50, 50), text, fill="black", font=font)
        img.save(output_path)
        print(f"DOCX converted to image at {output_path}")
        return output_path

    else:
        raise ValueError(f"Unsupported file type: {ext}")

if __name__ == "__main__":
    file_path = input("Enter file path: ")
    convert_to_image(file_path)