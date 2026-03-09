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
        self.__clerk_jwks_url = os.getenv("CLERK_JWKS_URL", "")
        self.__clerk_issuer = os.getenv("CLERK_ISSUER", "")
        self.__clerk_audience = os.getenv("CLERK_AUDIENCE", "")
        self.__clerk_secret_key = os.getenv("CLERK_SECRET_KEY", "")
        self.__clerk_api_base = os.getenv("CLERK_API_BASE", "https://api.clerk.com/v1")
    @property
    def device(self):
        return self.__device
    @property
    def model(self):
        return self.__model
    @property
    def processor(self):
        return self.__processor
    @property
    def clerk_jwks_url(self):
        return self.__clerk_jwks_url
    @property
    def clerk_issuer(self):
        return self.__clerk_issuer
    @property
    def clerk_audience(self):
        return self.__clerk_audience
    @property
    def clerk_secret_key(self):
        return self.__clerk_secret_key
    @property
    def clerk_api_base(self):
        return self.__clerk_api_base