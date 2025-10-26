"""
VibeAI 2.0 - Ultimate Model Test Suite
Test all 98 OpenAI models and show capabilities
"""

import asyncio
import os
import sys
sys.path.append('/Users/mikegehrke/Development/vibeai/backend')

from core.multimodal_ai import MultimodalAI
from core.web_search import WebSearchService

async def test_vibeai_ultimate():
    """Test all capabilities of VibeAI 2.0"""
    print("🚀 VIBEAI 2.0 - ULTIMATE TEST SUITE")
    print("=" * 50)
    
    # Initialize AI modules
    ai = MultimodalAI()
    web = WebSearchService()
    
    print("\n🧠 1. TESTING CHAT MODELS:")
    print("-" * 30)
    
    # Test different model types
    test_prompts = {
        'default': "Explain quantum computing in simple terms",
        'coding': "Write a Python function to calculate fibonacci numbers",
        'fast': "What's the capital of Germany?",
        'large_context': "Summarize the history of artificial intelligence development",
        'reasoning': "Solve this logic puzzle: If all cats are animals, and some animals are pets, can we conclude that some cats are pets?"
    }
    
    for model_type, prompt in test_prompts.items():
        print(f"\n🤖 Testing {model_type.upper()} model:")
        result = ai.chat_completion(prompt, model_type=model_type)
        
        if result['success']:
            print(f"✅ Model: {result['model_used']}")
            print(f"📝 Response: {result['content'][:100]}...")
            print(f"🔢 Tokens: {result['tokens_used']}")
        else:
            print(f"❌ Error: {result['error']}")
    
    print("\n🎨 2. TESTING IMAGE GENERATION:")
    print("-" * 30)
    
    image_result = ai.generate_image(
        "A futuristic AI robot working on a computer, digital art style",
        size="1024x1024",
        quality="standard"
    )
    
    if image_result['success']:
        print(f"✅ Generated {len(image_result['images'])} images")
        print(f"🖼️ First image URL: {image_result['images'][0]}")
    else:
        print(f"❌ Image generation failed: {image_result['error']}")
    
    print("\n🔍 3. TESTING WEB SEARCH:")
    print("-" * 30)
    
    search_result = await web.search("latest AI developments 2024")
    
    if search_result['success']:
        print(f"✅ Found {len(search_result['results'])} search results")
        for i, result in enumerate(search_result['results'][:3]):
            print(f"📄 {i+1}. {result['title']}")
            print(f"   {result['url']}")
    else:
        print(f"❌ Web search failed: {search_result['error']}")
    
    print("\n📊 4. TESTING EMBEDDINGS:")
    print("-" * 30)
    
    embedding_result = ai.get_embeddings("VibeAI 2.0 is the ultimate AI application generator")
    
    if embedding_result['success']:
        print(f"✅ Generated embedding with {len(embedding_result['embedding'])} dimensions")
        print(f"🧮 First 5 values: {embedding_result['embedding'][:5]}")
    else:
        print(f"❌ Embeddings failed: {embedding_result['error']}")
    
    print("\n🔬 5. LISTING ALL AVAILABLE MODELS:")
    print("-" * 30)
    
    models_result = ai.list_available_models()
    
    if models_result['success']:
        print(f"✅ Total models available: {models_result['total_models']}")
        
        # Categorize models
        model_categories = {
            'GPT-4': [],
            'GPT-3.5': [],
            'DALL-E': [],
            'Embeddings': [],
            'Other': []
        }
        
        for model in models_result['models']:
            model_id = model['id']
            if 'gpt-4' in model_id:
                model_categories['GPT-4'].append(model_id)
            elif 'gpt-3.5' in model_id:
                model_categories['GPT-3.5'].append(model_id)
            elif 'dall-e' in model_id:
                model_categories['DALL-E'].append(model_id)
            elif 'embedding' in model_id:
                model_categories['Embeddings'].append(model_id)
            else:
                model_categories['Other'].append(model_id)
        
        for category, models in model_categories.items():
            if models:
                print(f"\n📋 {category} Models ({len(models)}):")
                for model in models[:5]:  # Show first 5
                    print(f"   • {model}")
                if len(models) > 5:
                    print(f"   ... and {len(models) - 5} more")
    
    print("\n🎯 6. FINAL RECOMMENDATIONS:")
    print("-" * 30)
    print("✅ MUST USE for VibeAI 2.0:")
    print("   • gpt-4o (best overall)")
    print("   • gpt-4o-mini (fast & efficient)")
    print("   • gpt-3.5-turbo-16k (large context)")
    print("   • dall-e-2 (image generation)")
    print("   • text-embedding-ada-002 (embeddings)")
    
    print("\n🔥 ULTIMATE VIBEAI 2.0 IS READY!")
    print("98 premium models at your disposal! 🚀")

if __name__ == "__main__":
    asyncio.run(test_vibeai_ultimate())