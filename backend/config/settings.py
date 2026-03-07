import torch
from transformers import AutoProcessor, AutoModelForImageTextToText
from dotenv import load_dotenv,find_dotenv
import os
ENV_PATH = find_dotenv(".env") #find path cause its in config and env is in root
load_dotenv(ENV_PATH)

class Settings:
    def __init__(self):
        self.__device = "cuda" if torch.cuda.is_available() else "cpu"
        self.__model = AutoModelForImageTextToText.from_pretrained("stepfun-ai/GOT-OCR-2.0-hf", device_map="auto", trust_remote_code=True, torch_dtype=torch.float16 if self.__device == "cuda" else torch.float32)
        self.__processor = AutoProcessor.from_pretrained("stepfun-ai/GOT-OCR-2.0-hf", use_fast=True, trust_remote_code=True)
    
    @property
    def device(self):
        return self.__device
    @property
    def model(self):
        return self.__model
    @property
    def processor(self):
        return self.__processor