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
    #image = "output_images/test.png"
    inputs = processor(
    image,
    return_tensors="pt",
    format=True
    ).to(model.device)

    generate_ids = model.generate(
    **inputs,
    tokenizer=processor.tokenizer,
    stop_strings="<|im_end|>",
    do_sample=False,
    max_new_tokens=2048,
    )

    #print(generate_ids)
    
    result = processor.decode(
        generate_ids[0, inputs["input_ids"].shape[1]:],
        skip_special_tokens=True
    )
    return result

if __name__ == "__main__":
    # Example usage
    file_path = "resume.pdf"  # Change this to your file path
    result = read_resume(file_path)
    print("Extracted text:", result)