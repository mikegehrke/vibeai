import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

logger = logging.getLogger("lumi_agent")


class LumiAgent:
    """
    Lumi – Creative Agent.
    Spezialisiert auf:
    - kreatives Schreiben
    - Storytelling
    - UX/UI Ideen
    - Marketingtexte
    - Produktideen
    - Social Media Hooks
    - kreative Problemlösung
    """

    # Bestes Modell für kreative Arbeit
    model = "gpt-4o"  # dynamisch durch resolve_model()

    async def run(self, model, message: str, context: dict):
        """
        Führt Lumi aus.
        """
        system_prompt = (
            "You are Lumi, a creative and expressive agent inside VibeAI. "
            "You specialize in creative writing, UX ideas, marketing concepts, "
            "branding, storytelling, and visual thinking. "
            "Your responses should be imaginative, vivid, and user-friendly."
        )

        result = await model.run(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message},
            ],
            context=context,
        )

        return {
            "message": result.get("message"),
            "input_tokens": result.get("input_tokens", 0),
            "output_tokens": result.get("output_tokens", 0),
            "provider": result.get("provider", "unknown"),
        }


class Agent:
    """
    Production-Grade Lumi Agent - VibeAI's Creative Expert.

    Lumi specializes in:
    - Creative writing and storytelling
    - UI/UX design concepts and ideas
    - Marketing copy and branding
    - Social media content
    - Product naming and slogans
    - Visual design concepts
    - Creative problem solving
    - Imaginative ideation

    Personality:
    - Creative and imaginative
    - Inspiring and uplifting
    - Vivid and expressive
    - User-centered
    - Trend-aware
    """

    def __init__(self):
        self.name = "lumi"
        self.description = "Creative writing, design, and marketing AI assistant"
        self.model = "gpt-4o"  # Excellent creative capabilities
        self.provider = "openai"
        self.temperature = 0.9  # High for creative variation
        self.max_tokens = 3000  # Medium length for creative content

        # Creative capabilities
        self.capabilities = [
            "creative_writing",
            "storytelling",
            "ui_ux_design",
            "marketing_copy",
            "branding",
            "social_media",
            "product_naming",
            "visual_concepts",
            "ideation",
            "content_creation",
        ]

        # Creative content types
        self.content_types = [
            "stories",
            "blog_posts",
            "social_media",
            "marketing_copy",
            "product_descriptions",
            "slogans",
            "taglines",
            "ui_text",
            "design_concepts",
            "brand_guidelines",
            "video_scripts",
            "email_campaigns",
            "landing_pages",
            "creative_briefs",
        ]

        # Fallback models (creative-optimized)
        self.fallback_models = [
            (
                "claude-3-5-sonnet-20241022",
                "anthropic",
            ),  # Excellent at creative writing
            ("gemini-2.0-flash-exp", "google"),  # Good at varied creative tasks
            ("gpt-4o-mini", "openai"),  # Faster creative alternative
            ("llama3.2", "ollama"),  # Local creative model
        ]

        # System prompt for creativity
        self.system_prompt = """You are Lumi, VibeAI's creative and imaginative AI assistant.

Your creative expertise:
- Write compelling stories and narratives
- Generate innovative UI/UX design concepts
- Craft engaging marketing copy and branding
- Create viral-worthy social media content
- Develop memorable product names and slogans
- Visualize design concepts through words
- Think outside the box for creative solutions
- Inspire and energize with your ideas

Your creative approach:
- Be imaginative and original
- Use vivid, sensory language
- Consider user emotions and experiences
- Think visually and aesthetically
- Stay current with design and content trends
- Balance creativity with clarity
- Adapt tone to the context (playful, professional, emotional, etc.)
- Provide multiple creative options when helpful

For UI/UX design:
- Consider user journey and psychology
- Think about visual hierarchy and flow
- Suggest color palettes and typography ideas
- Describe layouts and interactions vividly
- Focus on delightful user experiences

For marketing and branding:
- Understand target audience deeply
- Create emotional connections
- Use persuasive and memorable language
- Consider brand personality and voice
- Think about storytelling and narrative

For social media:
- Hook readers immediately
- Be concise but impactful
- Use engaging formats (questions, lists, stories)
- Consider platform-specific best practices
- Think about virality and shareability

For creative writing:
- Paint pictures with words
- Create engaging characters and scenarios
- Build narrative tension and flow
- Use varied sentence structures
- Evoke emotions and imagery

Remember: Creativity thrives on exploration. Dare to be different, surprising, and memorable."""

    async def run(self, messages: List[Dict], context: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Execute Lumi agent for creative tasks.

        Args:
            messages: Conversation history [{"role": "user/assistant", "content": "..."}]
            context: Additional context (brand guidelines, target audience, etc.)

        Returns:
            Response dict with creative content, tokens, cost
        """
        if context is None:
            context = {}

        # Add system prompt
        full_messages = [{"role": "system", "content": self.system_prompt}] + messages

        # Add creative context if available
        if context.get("brand_guidelines"):
            brand_msg = f"\n\nBrand Guidelines:\n{context['brand_guidelines']}"
            full_messages[-1]["content"] += brand_msg

        if context.get("target_audience"):
            audience_msg = f"\n\nTarget Audience:\n{context['target_audience']}"
            full_messages[-1]["content"] += audience_msg

        # Try primary model
        try:
            result = await self._run_with_provider(
                model=self.model,
                provider=self.provider,
                messages=full_messages,
                context=context,
            )

            return result

        except Exception as e:
            logger.warning(f"Primary model {self.model} failed: {e}")

            # Try fallback models
            for fallback_model, fallback_provider in self.fallback_models:
                try:
                    logger.info(f"Trying fallback: {fallback_model} ({fallback_provider})")

                    result = await self._run_with_provider(
                        model=fallback_model,
                        provider=fallback_provider,
                        messages=full_messages,
                        context=context,
                    )

                    result["fallback"] = True
                    result["fallback_reason"] = str(e)

                    return result

                except Exception as fallback_error:
                    logger.warning(f"Fallback {fallback_model} failed: {fallback_error}")
                    continue

            # All models failed
            logger.error("All creative models failed")

            return {
                "status": "error",
                "model": self.model,
                "provider": self.provider,
                "response": "I'm experiencing creative difficulties right now. Please try again.",
                "error": str(e),
                "input_tokens": 0,
                "output_tokens": 0,
                "total_tokens": 0,
                "cost_usd": 0.0,
            }

    async def _run_with_provider(
        self, model: str, provider: str, messages: List[Dict], context: Dict
    ) -> Dict[str, Any]:
        """
        Run creative agent with specific model and provider.
        """
        # Import provider clients
        if provider == "openai":
            from core.provider_clients.openai_client import openai_client as client
        elif provider == "anthropic":
            from core.provider_clients.anthropic_client import (
                anthropic_client as client,
            )
        elif provider == "google":
            from core.provider_clients.gemini_client import gemini_client as client
        elif provider == "github":
            from core.provider_clients.copilot_client import copilot_client as client
        elif provider == "ollama":
            from core.provider_clients.ollama_client import ollama_client as client
        else:
            raise ValueError(f"Unknown provider: {provider}")

        # Call provider with creative settings
        response = await client.chat_completion(
            model=model,
            messages=messages,
            temperature=self.temperature,  # High for creativity
            max_tokens=self.max_tokens,
        )

        # Extract response
        if isinstance(response, dict):
            response_text = response.get("content", response.get("message", str(response)))
            input_tokens = response.get("input_tokens", response.get("prompt_tokens", 0))
            output_tokens = response.get("output_tokens", response.get("completion_tokens", 0))
        else:
            response_text = str(response)
            input_tokens = 0
            output_tokens = 0

        total_tokens = input_tokens + output_tokens

        # Calculate cost
        cost_usd = 0.0
        if total_tokens > 0:
            try:
                from billing.pricing_rules import calculate_token_cost

                cost_usd = calculate_token_cost(
                    model=model,
                    input_tokens=input_tokens,
                    output_tokens=output_tokens,
                    provider=provider,
                )
            except Exception as e:
                logger.warning(f"Cost calculation failed: {e}")

        return {
            "status": "success",
            "model": model,
            "provider": provider,
            "response": response_text,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "total_tokens": total_tokens,
            "cost_usd": cost_usd,
            "timestamp": datetime.utcnow().isoformat(),
        }

    async def process(self, message: str, context: Optional[Dict] = None) -> Dict:
        """
        Simplified interface for single creative request.
        """
        messages = [{"role": "user", "content": message}]
        return await self.run(messages, context)

    async def write_story(self, topic: str, style: Optional[str] = None, length: Optional[str] = "medium") -> Dict:
        """
        Write creative story.

        Args:
            topic: Story topic or theme
            style: Writing style (e.g., "dramatic", "humorous", "poetic")
            length: Story length ("short", "medium", "long")

        Returns:
            Creative story
        """
        prompt = f"Write a {length} story about: {topic}"

        if style:
            prompt += f"\n\nStyle: {style}"

        return await self.process(prompt)

    async def design_ui_concept(
        self,
        app_description: str,
        screen_name: Optional[str] = None,
        style: Optional[str] = None,
    ) -> Dict:
        """
        Generate UI/UX design concept.

        Args:
            app_description: Description of the app
            screen_name: Specific screen to design
            style: Design style (e.g., "minimalist", "vibrant", "professional")

        Returns:
            UI design concept with layout, colors, typography ideas
        """
        prompt = f"Design a UI concept for: {app_description}"

        if screen_name:
            prompt += f"\n\nScreen: {screen_name}"

        if style:
            prompt += f"\n\nDesign style: {style}"

        prompt += "\n\nDescribe layout, visual hierarchy, color palette, typography, and key interactions."

        return await self.process(prompt)

    async def create_marketing_copy(
        self, product: str, target_audience: str, format: Optional[str] = "landing_page"
    ) -> Dict:
        """
        Create marketing copy.

        Args:
            product: Product description
            target_audience: Target audience description
            format: Copy format (e.g., "landing_page", "email", "social_media")

        Returns:
            Marketing copy
        """
        prompt = f"""Create {format} copy for:

Product: {product}
Target Audience: {target_audience}

Make it engaging, persuasive, and memorable."""

        return await self.process(prompt)

    async def generate_product_names(
        self, product_description: str, count: int = 5, style: Optional[str] = None
    ) -> Dict:
        """
        Generate product names and slogans.

        Args:
            product_description: Description of product
            count: Number of name suggestions
            style: Naming style (e.g., "professional", "playful", "tech-focused")

        Returns:
            Product name suggestions with slogans
        """
        prompt = f"Generate {count} creative product names for:\n\n{product_description}"

        if style:
            prompt += f"\n\nStyle: {style}"

        prompt += "\n\nFor each name, include a catchy slogan."

        return await self.process(prompt)

    async def create_social_media_post(self, topic: str, platform: str, tone: Optional[str] = "engaging") -> Dict:
        """
        Create social media post.

        Args:
            topic: Post topic or message
            platform: Social platform (e.g., "twitter", "instagram", "linkedin")
            tone: Post tone (e.g., "engaging", "professional", "humorous")

        Returns:
            Social media post with hashtags
        """
        prompt = f"""Create a {tone} {platform} post about:

{topic}

Include relevant hashtags and make it shareable."""

        return await self.process(prompt)

    def get_info(self) -> Dict:
        """
        Get agent information and capabilities.
        """
        return {
            "name": self.name,
            "description": self.description,
            "model": self.model,
            "provider": self.provider,
            "capabilities": self.capabilities,
            "content_types": self.content_types,
            "fallback_models": self.fallback_models,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
            "creative_optimized": True,
        }


async def run_lumi(message: str, context: Optional[Dict] = None) -> Dict:
    """
    Convenience function to run Lumi agent.
    """
    agent = Agent()
    return await agent.process(message, context)


async def write_story_quick(topic: str, style: Optional[str] = None) -> Dict:
    """
    Quick story writing.
    """
    agent = Agent()
    return await agent.write_story(topic, style)


async def design_ui_quick(app_description: str, style: Optional[str] = None) -> Dict:
    """
    Quick UI design concept.
    """
    agent = Agent()
    return await agent.design_ui_concept(app_description, style=style)


async def create_marketing_quick(product: str, target_audience: str) -> Dict:
    """
    Quick marketing copy.
    """
    agent = Agent()
    return await agent.create_marketing_copy(product, target_audience)


def create_lumi_instance() -> Agent:
    """
    Create new Lumi agent instance.
    """
    return Agent()