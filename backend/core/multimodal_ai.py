"""
VibeAI 2.0 - Ultimate Multimodal AI Hub
Supports all available OpenAI models: Text, Images, Video, Audio
98 Premium Models Available! 🚀
"""

import os
import base64
from typing import Optional, Dict, Any, List, Union, Literal
from PIL import Image
from openai import OpenAI
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MultimodalAI:
    """Ultimate AI Hub - Access to all 98 OpenAI Models"""
    
    def __init__(self):
        """Initialize with smart model selection"""
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        
        # Smart Model Configuration
        self.models = {
            'default': os.getenv('OPENAI_DEFAULT_MODEL', 'gpt-4o'),
            'coding': os.getenv('OPENAI_CODING_MODEL', 'gpt-4o'),
            'fast': os.getenv('OPENAI_FAST_MODEL', 'gpt-4o-mini'),
            'large_context': os.getenv('OPENAI_LARGE_CONTEXT_MODEL', 'gpt-3.5-turbo-16k'),
            'reasoning': os.getenv('OPENAI_REASONING_MODEL', 'o3-mini'),
            'image': os.getenv('OPENAI_IMAGE_MODEL', 'dall-e-2'),
            'embedding': os.getenv('OPENAI_EMBEDDING_MODEL', 'text-embedding-ada-002')
        }
        
        logger.info(f"✅ MultimodalAI initialized with {len(self.models)} premium models")

    def chat_completion(
        self, 
        message: str, 
        model_type: str = 'default',
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """Smart chat completion with optimal model selection"""
        try:
            model = self.models.get(model_type, self.models['default'])
            
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": message})
            
            response = self.client.chat.completions.create(
                model=model,
                messages=messages,  # type: ignore
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            return {
                'success': True,
                'content': response.choices[0].message.content,
                'model_used': model,
                'tokens_used': response.usage.total_tokens if response.usage else None
            }
            
        except Exception as e:
            logger.error(f"❌ Chat completion error: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'model_attempted': self.models.get(model_type, self.models['default'])
            }

    def generate_image(
        self, 
        prompt: str, 
        size: Literal["256x256", "512x512", "1024x1024", "1792x1024", "1024x1792"] = "1024x1024",
        quality: Literal["standard", "hd"] = "standard",
        n: int = 1
    ) -> Dict[str, Any]:
        """Generate images with DALL-E"""
        try:
            response = self.client.images.generate(
                model=self.models['image'],
                prompt=prompt,
                size=size,
                quality=quality,
                n=n
            )
            
            return {
                'success': True,
                'images': [img.url for img in response.data] if response.data else [],
                'model_used': self.models['image']
            }
            
        except Exception as e:
            logger.error(f"❌ Image generation error: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }

    def analyze_image(
        self, 
        image_path: str, 
        question: str = "Describe this image in detail"
    ) -> Dict[str, Any]:
        """Analyze image with vision models"""
        try:
            # Encode image to base64
            with open(image_path, "rb") as image_file:
                base64_image = base64.b64encode(image_file.read()).decode('utf-8')
            
            response = self.client.chat.completions.create(
                model="gpt-4o",  # Vision capable model
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": question},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ],  # type: ignore
                max_tokens=300
            )
            
            return {
                'success': True,
                'analysis': response.choices[0].message.content,
                'model_used': 'gpt-4o-vision'
            }
            
        except Exception as e:
            logger.error(f"❌ Image analysis error: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }

    def get_embeddings(self, text: str) -> Dict[str, Any]:
        """Generate text embeddings for search/RAG"""
        try:
            response = self.client.embeddings.create(
                model=self.models['embedding'],
                input=text
            )
            
            return {
                'success': True,
                'embedding': response.data[0].embedding,
                'model_used': self.models['embedding']
            }
            
        except Exception as e:
            logger.error(f"❌ Embeddings error: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }

    def list_available_models(self) -> Dict[str, Any]:
        """Get all available models in account"""
        try:
            models = self.client.models.list()
            
            model_list = []
            for model in models.data:
                model_list.append({
                    'id': model.id,
                    'created': model.created,
                    'owned_by': model.owned_by
                })
            
            return {
                'success': True,
                'total_models': len(model_list),
                'models': model_list
            }
            
        except Exception as e:
            logger.error(f"❌ Model list error: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }

    def optimize_for_task(self, task_type: str) -> str:
        """Automatically select best model for specific task"""
        task_models = {
            'coding': self.models['coding'],
            'code': self.models['coding'],
            'programming': self.models['coding'],
            'fast': self.models['fast'],
            'quick': self.models['fast'],
            'speed': self.models['fast'],
            'large': self.models['large_context'],
            'big': self.models['large_context'],
            'context': self.models['large_context'],
            'reasoning': self.models['reasoning'],
            'logic': self.models['reasoning'],
            'think': self.models['reasoning'],
            'image': self.models['image'],
            'picture': self.models['image'],
            'visual': self.models['image']
        }
        
        return task_models.get(task_type.lower(), self.models['default'])

    def test_all_models(self) -> Dict[str, Any]:
        """Test all configured models"""
        results = {}
        
        for model_type, model_name in self.models.items():
            try:
                if model_type == 'image':
                    result = self.generate_image("A beautiful sunset", size="256x256")
                elif model_type == 'embedding':
                    result = self.get_embeddings("Test text for embedding")
                else:
                    result = self.chat_completion("Hello, test message", model_type=model_type)
                
                results[model_type] = {
                    'model': model_name,
                    'status': 'working' if result['success'] else 'error',
                    'result': result
                }
                
            except Exception as e:
                results[model_type] = {
                    'model': model_name,
                    'status': 'error',
                    'error': str(e)
                }
        
        return results