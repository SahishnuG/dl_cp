from src.helper_funcs import convert_to_image
from config.settings import Settings
settings = Settings()

def read_resume(resume_path):
    device = settings.device
    model = settings.model
    processor = settings.processor
    print(f"Using device: {device}\nmodel: {model.__class__.__name__}\nprocessor: {processor.__class__.__name__}")
    print(f"Processing file: {resume_path}")
    image = convert_to_image(resume_path)
    inputs = processor(image, return_tensors="pt", device=device).to(device)

    generate_ids = model.generate(
        **inputs,
        do_sample=False,
        # tokenizer=processor.tokenizer,
        # stop_strings="<|im_end|>",
        max_new_tokens=4096,
    )

    result = processor.decode(generate_ids[0], skip_special_tokens=True)
    return result

if __name__ == "__main__":
    # Example usage
    file_path = "resume.pdf"  # Change this to your file path
    result = read_resume(file_path)
    print("Extracted text:", result)