#!/usr/bin/env python3
"""
🏪 AI Store Generator
Automatische App Store + Play Store Listings, SEO, Screenshots, Icons, Manifeste
"""

from dataclasses import dataclass
from enum import Enum
from typing import List, Dict, Optional
import json


class StorePlatform(Enum):
    """Store platforms"""
    IOS_APP_STORE = "ios_app_store"
    GOOGLE_PLAY = "google_play"
    BOTH = "both"


class StoreAssetType(Enum):
    """Asset types"""
    ICON = "icon"
    SPLASH_SCREEN = "splash_screen"
    SCREENSHOTS = "screenshots"
    FEATURE_GRAPHIC = "feature_graphic"
    PROMO_VIDEO = "promo_video"


class AppCategory(Enum):
    """App categories"""
    BUSINESS = "business"
    PRODUCTIVITY = "productivity"
    SOCIAL = "social"
    EDUCATION = "education"
    ENTERTAINMENT = "entertainment"
    FINANCE = "finance"
    HEALTH = "health"
    LIFESTYLE = "lifestyle"
    SHOPPING = "shopping"
    TRAVEL = "travel"
    UTILITIES = "utilities"
    GAMES = "games"


@dataclass
class StoreConfig:
    """Store generation configuration"""
    app_name: str
    app_description: str
    category: AppCategory
    platforms: StorePlatform
    keywords: List[str]
    target_audience: str
    primary_color: str = "#007AFF"
    version: str = "1.0.0"
    generate_screenshots: bool = True
    generate_icons: bool = True
    generate_privacy_policy: bool = True
    generate_terms: bool = True
    languages: List[str] = None
    
    def __post_init__(self):
        if self.languages is None:
            self.languages = ["en"]


@dataclass
class GeneratedStoreListing:
    """Generated store listing"""
    app_store_metadata: Dict
    play_store_metadata: Dict
    privacy_policy: str
    terms_of_service: str
    icon_exports: Dict
    splash_exports: Dict
    screenshot_mockups: List[str]
    manifest_files: Dict
    build_commands: str
    changelog: str


class StoreGenerator:
    """AI-powered store listing generator"""
    
    def __init__(self):
        self.seo_keywords_cache = {}
    
    def generate(self, config: StoreConfig) -> GeneratedStoreListing:
        """
        Generate complete store listing
        
        Args:
            config: Store configuration
            
        Returns:
            Complete store listing with all assets
        """
        # Generate metadata
        app_store_metadata = self._generate_app_store_metadata(config)
        play_store_metadata = self._generate_play_store_metadata(config)
        
        # Generate legal documents
        privacy_policy = self._generate_privacy_policy(config)
        terms_of_service = self._generate_terms_of_service(config)
        
        # Generate assets
        icon_exports = self._generate_icon_exports(config)
        splash_exports = self._generate_splash_exports(config)
        screenshot_mockups = self._generate_screenshot_mockups(config)
        
        # Generate manifests
        manifest_files = self._generate_manifests(config)
        
        # Generate build commands
        build_commands = self._generate_build_commands(config)
        
        # Generate changelog
        changelog = self._generate_changelog(config)
        
        return GeneratedStoreListing(
            app_store_metadata=app_store_metadata,
            play_store_metadata=play_store_metadata,
            privacy_policy=privacy_policy,
            terms_of_service=terms_of_service,
            icon_exports=icon_exports,
            splash_exports=splash_exports,
            screenshot_mockups=screenshot_mockups,
            manifest_files=manifest_files,
            build_commands=build_commands,
            changelog=changelog
        )
    
    def _generate_app_store_metadata(self, config: StoreConfig) -> Dict:
        """Generate iOS App Store metadata"""
        
        # SEO-optimized title (max 30 chars)
        title = self._optimize_title(config.app_name, 30)
        
        # Subtitle (max 30 chars)
        subtitle = self._generate_subtitle(config, 30)
        
        # Promotional text (max 170 chars)
        promo_text = self._generate_promo_text(config, 170)
        
        # Description (max 4000 chars)
        description = self._generate_description(config, 4000)
        
        # Keywords (max 100 chars, comma-separated)
        keywords = self._generate_seo_keywords(config, 100)
        
        # Support URL
        support_url = f"https://{config.app_name.lower().replace(' ', '')}.com/support"
        
        # Marketing URL
        marketing_url = f"https://{config.app_name.lower().replace(' ', '')}.com"
        
        # Privacy URL
        privacy_url = f"https://{config.app_name.lower().replace(' ', '')}.com/privacy"
        
        # What's new (max 4000 chars)
        whats_new = self._generate_whats_new(config, 4000)
        
        metadata = {
            "name": title,
            "subtitle": subtitle,
            "promotional_text": promo_text,
            "description": description,
            "keywords": keywords,
            "support_url": support_url,
            "marketing_url": marketing_url,
            "privacy_policy_url": privacy_url,
            "category": {
                "primary": self._map_category_ios(config.category),
                "secondary": None
            },
            "version": {
                "number": config.version,
                "whats_new": whats_new
            },
            "age_rating": "4+",
            "copyright": f"© {2025} {config.app_name}",
            "review_notes": "Thank you for reviewing our app!",
            "screenshots": {
                "iphone_6_5": [],  # iPhone 14 Pro Max
                "iphone_5_5": [],  # iPhone 8 Plus
                "ipad_pro_12_9": []  # iPad Pro
            },
            "app_preview_videos": []
        }
        
        return metadata
    
    def _generate_play_store_metadata(self, config: StoreConfig) -> Dict:
        """Generate Google Play Store metadata"""
        
        # Title (max 30 chars)
        title = self._optimize_title(config.app_name, 30)
        
        # Short description (max 80 chars)
        short_desc = self._generate_short_description(config, 80)
        
        # Full description (max 4000 chars)
        full_desc = self._generate_description(config, 4000)
        
        metadata = {
            "title": title,
            "short_description": short_desc,
            "full_description": full_desc,
            "app_category": self._map_category_android(config.category),
            "content_rating": "Everyone",
            "contact_details": {
                "website": f"https://{config.app_name.lower().replace(' ', '')}.com",
                "email": f"support@{config.app_name.lower().replace(' ', '')}.com",
                "phone": "+1-555-0123",
                "address": "123 Main St, San Francisco, CA 94102"
            },
            "privacy_policy": f"https://{config.app_name.lower().replace(' ', '')}.com/privacy",
            "graphics": {
                "icon": "512x512",
                "feature_graphic": "1024x500",
                "phone_screenshots": [],  # min 2, max 8
                "tablet_screenshots": [],
                "tv_screenshots": []
            },
            "version": config.version,
            "release_notes": self._generate_release_notes(config, 500),
            "tags": config.keywords[:5]  # Max 5 tags
        }
        
        return metadata
    
    def _optimize_title(self, app_name: str, max_length: int) -> str:
        """Optimize title for SEO within character limit"""
        if len(app_name) <= max_length:
            return app_name
        return app_name[:max_length-3] + "..."
    
    def _generate_subtitle(self, config: StoreConfig, max_length: int) -> str:
        """Generate SEO-optimized subtitle"""
        subtitles = {
            AppCategory.BUSINESS: "Boost Your Productivity",
            AppCategory.PRODUCTIVITY: "Get Things Done Faster",
            AppCategory.SOCIAL: "Connect & Share",
            AppCategory.EDUCATION: "Learn Smarter",
            AppCategory.ENTERTAINMENT: "Your Entertainment Hub",
            AppCategory.FINANCE: "Manage Your Money",
            AppCategory.HEALTH: "Live Healthier",
            AppCategory.LIFESTYLE: "Elevate Your Lifestyle",
            AppCategory.SHOPPING: "Shop Smarter",
            AppCategory.TRAVEL: "Explore the World",
            AppCategory.UTILITIES: "Simplify Your Life",
            AppCategory.GAMES: "Play & Have Fun"
        }
        
        subtitle = subtitles.get(config.category, "Your New Favorite App")
        return subtitle[:max_length]
    
    def _generate_promo_text(self, config: StoreConfig, max_length: int) -> str:
        """Generate promotional text"""
        promo = f"🚀 New: {config.app_description[:max_length-20]}! Download now and join thousands of users."
        return promo[:max_length]
    
    def _generate_short_description(self, config: StoreConfig, max_length: int) -> str:
        """Generate short description for Play Store"""
        return config.app_description[:max_length]
    
    def _generate_description(self, config: StoreConfig, max_length: int) -> str:
        """Generate full app description with SEO"""
        
        # Build description
        description = f"""
{config.app_description}

🌟 WHY CHOOSE {config.app_name.upper()}?

✅ Easy to use - Intuitive interface designed for everyone
✅ Fast & Reliable - Built with cutting-edge technology
✅ Secure - Your data is protected with industry-standard encryption
✅ Free to start - No credit card required
✅ 24/7 Support - We're here to help whenever you need us

🎯 KEY FEATURES:

"""
        
        # Add category-specific features
        features = self._generate_features_list(config)
        for i, feature in enumerate(features[:8], 1):
            description += f"{i}. {feature}\n"
        
        description += f"""

💡 PERFECT FOR:

{config.target_audience}

📱 HOW IT WORKS:

1. Download the app
2. Create your free account
3. Start using {config.app_name} immediately
4. Unlock premium features as you grow

🏆 WHAT USERS SAY:

"Best {config.category.value} app I've ever used!" ⭐⭐⭐⭐⭐
"Changed my life! Highly recommend." ⭐⭐⭐⭐⭐
"Simple, powerful, and effective." ⭐⭐⭐⭐⭐

🔐 PRIVACY & SECURITY:

Your privacy is our priority. We use bank-level encryption to protect your data and never share your information with third parties.

📞 SUPPORT:

Need help? Contact us anytime:
• Email: support@{config.app_name.lower().replace(' ', '')}.com
• Website: https://{config.app_name.lower().replace(' ', '')}.com/support

Download {config.app_name} today and join thousands of satisfied users!

Keywords: {', '.join(config.keywords[:10])}
"""
        
        return description.strip()[:max_length]
    
    def _generate_features_list(self, config: StoreConfig) -> List[str]:
        """Generate features list based on category"""
        
        features = {
            AppCategory.BUSINESS: [
                "Project management and task tracking",
                "Team collaboration tools",
                "Real-time notifications",
                "Cloud synchronization",
                "Advanced analytics and reporting",
                "Invoice and expense management",
                "Calendar integration",
                "Document sharing"
            ],
            AppCategory.PRODUCTIVITY: [
                "Smart task management",
                "Calendar & reminders",
                "Notes & documents",
                "Time tracking",
                "Goal setting & habits",
                "Pomodoro timer",
                "Cloud backup",
                "Cross-device sync"
            ],
            AppCategory.SOCIAL: [
                "Connect with friends",
                "Share photos & videos",
                "Live messaging",
                "Video calls",
                "Group chats",
                "Stories & posts",
                "Privacy controls",
                "Dark mode"
            ],
            AppCategory.EDUCATION: [
                "Interactive lessons",
                "Video tutorials",
                "Practice exercises",
                "Progress tracking",
                "Certificates",
                "Offline learning",
                "Quizzes & tests",
                "Expert instructors"
            ],
            AppCategory.ENTERTAINMENT: [
                "Unlimited streaming",
                "HD quality",
                "Download for offline",
                "Personalized recommendations",
                "No ads",
                "Multiple profiles",
                "Parental controls",
                "Cross-platform"
            ],
            AppCategory.FINANCE: [
                "Budget tracking",
                "Expense categorization",
                "Bill reminders",
                "Investment tracking",
                "Financial goals",
                "Bank-level security",
                "Automatic sync",
                "Reports & insights"
            ],
            AppCategory.HEALTH: [
                "Activity tracking",
                "Calorie counter",
                "Workout plans",
                "Sleep tracking",
                "Water reminder",
                "Health insights",
                "Integration with wearables",
                "Progress charts"
            ],
            AppCategory.LIFESTYLE: [
                "Daily inspiration",
                "Tips & tricks",
                "Community support",
                "Personalized content",
                "Achievements",
                "Reminders",
                "Beautiful design",
                "Regular updates"
            ],
            AppCategory.SHOPPING: [
                "Browse thousands of products",
                "Secure checkout",
                "Order tracking",
                "Wishlist",
                "Daily deals",
                "Price alerts",
                "Easy returns",
                "Customer reviews"
            ],
            AppCategory.TRAVEL: [
                "Book flights & hotels",
                "Trip planning",
                "Offline maps",
                "Translation tools",
                "Currency converter",
                "Travel guides",
                "Photo storage",
                "Itinerary management"
            ],
            AppCategory.UTILITIES: [
                "Fast & lightweight",
                "Battery optimization",
                "No ads",
                "Customizable",
                "Widget support",
                "Quick actions",
                "Export & import",
                "Regular updates"
            ],
            AppCategory.GAMES: [
                "Stunning graphics",
                "Smooth gameplay",
                "100+ levels",
                "Multiplayer mode",
                "Daily challenges",
                "Leaderboards",
                "Achievements",
                "No pay-to-win"
            ]
        }
        
        return features.get(config.category, [
            "Easy to use",
            "Fast performance",
            "Beautiful design",
            "Regular updates"
        ])
    
    def _generate_seo_keywords(self, config: StoreConfig, max_length: int) -> str:
        """Generate SEO-optimized keywords"""
        # Combine user keywords with auto-generated
        all_keywords = config.keywords.copy()
        
        # Add category-specific keywords
        category_keywords = {
            AppCategory.BUSINESS: ["productivity", "team", "work", "collaboration"],
            AppCategory.PRODUCTIVITY: ["tasks", "todo", "organize", "efficiency"],
            AppCategory.SOCIAL: ["chat", "friends", "share", "connect"],
            AppCategory.EDUCATION: ["learn", "study", "courses", "education"],
            AppCategory.ENTERTAINMENT: ["fun", "video", "streaming", "watch"],
            AppCategory.FINANCE: ["money", "budget", "finance", "banking"],
            AppCategory.HEALTH: ["fitness", "health", "workout", "wellness"],
            AppCategory.LIFESTYLE: ["lifestyle", "daily", "habits", "wellness"],
            AppCategory.SHOPPING: ["shop", "buy", "deals", "shopping"],
            AppCategory.TRAVEL: ["travel", "trips", "hotels", "flights"],
            AppCategory.UTILITIES: ["tools", "utility", "helper", "assistant"],
            AppCategory.GAMES: ["game", "play", "fun", "arcade"]
        }
        
        all_keywords.extend(category_keywords.get(config.category, []))
        
        # Remove duplicates and join
        unique_keywords = list(dict.fromkeys(all_keywords))
        keywords_str = ", ".join(unique_keywords)
        
        return keywords_str[:max_length]
    
    def _generate_whats_new(self, config: StoreConfig, max_length: int) -> str:
        """Generate 'What's New' section"""
        whats_new = f"""
🎉 Version {config.version}

New Features:
• Improved performance and stability
• Bug fixes and optimizations
• Enhanced user interface
• Better compatibility with latest iOS

Thank you for using {config.app_name}! We're constantly improving to give you the best experience.

Have feedback? Contact us at support@{config.app_name.lower().replace(' ', '')}.com
"""
        return whats_new.strip()[:max_length]
    
    def _generate_release_notes(self, config: StoreConfig, max_length: int) -> str:
        """Generate release notes for Play Store"""
        notes = f"""
✨ What's New in v{config.version}

• Performance improvements
• Bug fixes
• UI enhancements
• Stability updates

Thanks for using {config.app_name}!
"""
        return notes.strip()[:max_length]
    
    def _map_category_ios(self, category: AppCategory) -> str:
        """Map category to iOS App Store category"""
        mapping = {
            AppCategory.BUSINESS: "Business",
            AppCategory.PRODUCTIVITY: "Productivity",
            AppCategory.SOCIAL: "Social Networking",
            AppCategory.EDUCATION: "Education",
            AppCategory.ENTERTAINMENT: "Entertainment",
            AppCategory.FINANCE: "Finance",
            AppCategory.HEALTH: "Health & Fitness",
            AppCategory.LIFESTYLE: "Lifestyle",
            AppCategory.SHOPPING: "Shopping",
            AppCategory.TRAVEL: "Travel",
            AppCategory.UTILITIES: "Utilities",
            AppCategory.GAMES: "Games"
        }
        return mapping.get(category, "Utilities")
    
    def _map_category_android(self, category: AppCategory) -> str:
        """Map category to Google Play category"""
        mapping = {
            AppCategory.BUSINESS: "BUSINESS",
            AppCategory.PRODUCTIVITY: "PRODUCTIVITY",
            AppCategory.SOCIAL: "SOCIAL",
            AppCategory.EDUCATION: "EDUCATION",
            AppCategory.ENTERTAINMENT: "ENTERTAINMENT",
            AppCategory.FINANCE: "FINANCE",
            AppCategory.HEALTH: "HEALTH_AND_FITNESS",
            AppCategory.LIFESTYLE: "LIFESTYLE",
            AppCategory.SHOPPING: "SHOPPING",
            AppCategory.TRAVEL: "TRAVEL_AND_LOCAL",
            AppCategory.UTILITIES: "TOOLS",
            AppCategory.GAMES: "GAME_CASUAL"
        }
        return mapping.get(category, "TOOLS")
    
    def _generate_privacy_policy(self, config: StoreConfig) -> str:
        """Generate privacy policy"""
        
        policy = f"""
# Privacy Policy for {config.app_name}

**Last updated: December 3, 2025**

## Introduction

Welcome to {config.app_name}. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data and tell you about your privacy rights.

## Information We Collect

We collect the following types of information:

### Personal Information
- Name and email address
- Account credentials
- Profile information
- User preferences

### Usage Data
- App usage statistics
- Device information
- IP address
- Log data

### Cookies and Tracking
We use cookies and similar tracking technologies to track activity on our app and store certain information.

## How We Use Your Information

We use the collected data for various purposes:

- To provide and maintain our service
- To notify you about changes to our service
- To provide customer support
- To gather analysis or valuable information to improve our service
- To monitor the usage of our service
- To detect, prevent and address technical issues

## Data Security

The security of your data is important to us. We implement industry-standard security measures to protect your personal information.

## Third-Party Services

We may employ third-party companies and individuals to facilitate our service:

- Analytics providers
- Payment processors (if applicable)
- Cloud storage providers

These third parties have access to your personal data only to perform tasks on our behalf and are obligated not to disclose or use it for any other purpose.

## Data Retention

We will retain your personal data only for as long as is necessary for the purposes set out in this privacy policy.

## Your Rights

You have the right to:

- Access your personal data
- Correct inaccurate data
- Request deletion of your data
- Object to processing of your data
- Request restriction of processing
- Data portability
- Withdraw consent

## Children's Privacy

Our service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13.

## Changes to This Privacy Policy

We may update our privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page.

## Contact Us

If you have any questions about this privacy policy, please contact us:

- By email: privacy@{config.app_name.lower().replace(' ', '')}.com
- By visiting this page on our website: https://{config.app_name.lower().replace(' ', '')}.com/privacy
"""
        
        return policy.strip()
    
    def _generate_terms_of_service(self, config: StoreConfig) -> str:
        """Generate terms of service"""
        
        terms = f"""
# Terms of Service for {config.app_name}

**Last updated: December 3, 2025**

## Agreement to Terms

By accessing or using {config.app_name}, you agree to be bound by these Terms of Service and all applicable laws and regulations.

## Use License

Permission is granted to temporarily use {config.app_name} for personal, non-commercial transitory viewing only.

This is the grant of a license, not a transfer of title, and under this license you may not:

- Modify or copy the materials
- Use the materials for any commercial purpose
- Attempt to reverse engineer any software contained in {config.app_name}
- Remove any copyright or other proprietary notations from the materials
- Transfer the materials to another person or "mirror" the materials on any other server

## User Accounts

When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms.

You are responsible for safeguarding the password and for all activities that occur under your account.

## Prohibited Uses

You may not use {config.app_name}:

- In any way that violates any applicable national or international law
- To transmit any advertising or promotional material
- To impersonate or attempt to impersonate the Company or another user
- In any way that infringes upon the rights of others
- To engage in any conduct that restricts or inhibits anyone's use of the app

## Intellectual Property

The service and its original content, features, and functionality are owned by {config.app_name} and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.

## Termination

We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.

## Limitation of Liability

In no event shall {config.app_name}, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages.

## Disclaimer

Your use of the service is at your sole risk. The service is provided on an "AS IS" and "AS AVAILABLE" basis.

## Changes to Terms

We reserve the right to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page.

## Governing Law

These Terms shall be governed by the laws of the United States, without regard to its conflict of law provisions.

## Contact Us

If you have any questions about these Terms, please contact us:

- By email: legal@{config.app_name.lower().replace(' ', '')}.com
- By visiting: https://{config.app_name.lower().replace(' ', '')}.com/terms
"""
        
        return terms.strip()
    
    def _generate_icon_exports(self, config: StoreConfig) -> Dict:
        """Generate icon export specifications"""
        
        exports = {
            "ios": {
                "app_store": {
                    "1024x1024": f"{config.app_name}_icon_1024.png"
                },
                "app": {
                    "20x20": [f"{config.app_name}_icon_20@1x.png", f"{config.app_name}_icon_20@2x.png", f"{config.app_name}_icon_20@3x.png"],
                    "29x29": [f"{config.app_name}_icon_29@1x.png", f"{config.app_name}_icon_29@2x.png", f"{config.app_name}_icon_29@3x.png"],
                    "40x40": [f"{config.app_name}_icon_40@1x.png", f"{config.app_name}_icon_40@2x.png", f"{config.app_name}_icon_40@3x.png"],
                    "60x60": [f"{config.app_name}_icon_60@2x.png", f"{config.app_name}_icon_60@3x.png"],
                    "76x76": [f"{config.app_name}_icon_76@1x.png", f"{config.app_name}_icon_76@2x.png"],
                    "83.5x83.5": [f"{config.app_name}_icon_83.5@2x.png"]
                }
            },
            "android": {
                "play_store": {
                    "512x512": f"{config.app_name}_icon_512.png"
                },
                "app": {
                    "mdpi": {"48x48": f"{config.app_name}_icon_mdpi.png"},
                    "hdpi": {"72x72": f"{config.app_name}_icon_hdpi.png"},
                    "xhdpi": {"96x96": f"{config.app_name}_icon_xhdpi.png"},
                    "xxhdpi": {"144x144": f"{config.app_name}_icon_xxhdpi.png"},
                    "xxxhdpi": {"192x192": f"{config.app_name}_icon_xxxhdpi.png"}
                },
                "adaptive": {
                    "foreground": f"{config.app_name}_adaptive_foreground.png",
                    "background": f"{config.app_name}_adaptive_background.png"
                }
            },
            "design_spec": {
                "primary_color": config.primary_color,
                "background_color": "#FFFFFF",
                "style": "modern_rounded",
                "format": "PNG with transparency"
            }
        }
        
        return exports
    
    def _generate_splash_exports(self, config: StoreConfig) -> Dict:
        """Generate splash screen export specifications"""
        
        exports = {
            "ios": {
                "launch_screen": {
                    "1x": {"width": 375, "height": 812, "file": f"{config.app_name}_splash_1x.png"},
                    "2x": {"width": 750, "height": 1624, "file": f"{config.app_name}_splash_2x.png"},
                    "3x": {"width": 1125, "height": 2436, "file": f"{config.app_name}_splash_3x.png"}
                }
            },
            "android": {
                "splash_screen": {
                    "mdpi": {"width": 320, "height": 480, "file": f"{config.app_name}_splash_mdpi.png"},
                    "hdpi": {"width": 480, "height": 800, "file": f"{config.app_name}_splash_hdpi.png"},
                    "xhdpi": {"width": 720, "height": 1280, "file": f"{config.app_name}_splash_xhdpi.png"},
                    "xxhdpi": {"width": 1080, "height": 1920, "file": f"{config.app_name}_splash_xxhdpi.png"},
                    "xxxhdpi": {"width": 1440, "height": 2560, "file": f"{config.app_name}_splash_xxxhdpi.png"}
                }
            },
            "design_spec": {
                "logo_position": "center",
                "background_color": config.primary_color,
                "logo_color": "#FFFFFF",
                "animation": "fade_in"
            }
        }
        
        return exports
    
    def _generate_screenshot_mockups(self, config: StoreConfig) -> List[str]:
        """Generate screenshot mockup descriptions"""
        
        mockups = [
            {
                "platform": "ios",
                "device": "iPhone 14 Pro Max",
                "size": "1290x2796",
                "description": f"Main screen showing {config.app_name} dashboard with key features",
                "file": f"{config.app_name}_screenshot_ios_1.png"
            },
            {
                "platform": "ios",
                "device": "iPhone 14 Pro Max",
                "size": "1290x2796",
                "description": f"Feature showcase - primary functionality of {config.app_name}",
                "file": f"{config.app_name}_screenshot_ios_2.png"
            },
            {
                "platform": "ios",
                "device": "iPhone 14 Pro Max",
                "size": "1290x2796",
                "description": "Settings and customization options",
                "file": f"{config.app_name}_screenshot_ios_3.png"
            },
            {
                "platform": "ios",
                "device": "iPad Pro 12.9",
                "size": "2048x2732",
                "description": f"iPad version showing {config.app_name} on larger screen",
                "file": f"{config.app_name}_screenshot_ipad_1.png"
            },
            {
                "platform": "android",
                "device": "Pixel 7 Pro",
                "size": "1440x3120",
                "description": f"Android version - {config.app_name} main interface",
                "file": f"{config.app_name}_screenshot_android_1.png"
            },
            {
                "platform": "android",
                "device": "Pixel 7 Pro",
                "size": "1440x3120",
                "description": "Key features demonstration",
                "file": f"{config.app_name}_screenshot_android_2.png"
            }
        ]
        
        return [json.dumps(m, indent=2) for m in mockups]
    
    def _generate_manifests(self, config: StoreConfig) -> Dict:
        """Generate platform manifests"""
        
        manifests = {}
        
        # iOS Info.plist
        if config.platforms in [StorePlatform.IOS_APP_STORE, StorePlatform.BOTH]:
            manifests["ios_info_plist"] = self._generate_ios_info_plist(config)
        
        # Android AndroidManifest.xml
        if config.platforms in [StorePlatform.GOOGLE_PLAY, StorePlatform.BOTH]:
            manifests["android_manifest"] = self._generate_android_manifest(config)
            manifests["android_build_gradle"] = self._generate_android_build_gradle(config)
        
        return manifests
    
    def _generate_ios_info_plist(self, config: StoreConfig) -> str:
        """Generate iOS Info.plist"""
        
        plist = f'''<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>$(DEVELOPMENT_LANGUAGE)</string>
    <key>CFBundleDisplayName</key>
    <string>{config.app_name}</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>com.{config.app_name.lower().replace(' ', '')}.app</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>$(PRODUCT_NAME)</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>{config.version}</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSRequiresIPhoneOS</key>
    <true/>
    <key>UILaunchStoryboardName</key>
    <string>LaunchScreen</string>
    <key>UIRequiredDeviceCapabilities</key>
    <array>
        <string>armv7</string>
    </array>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
    <key>UIViewControllerBasedStatusBarAppearance</key>
    <false/>
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <true/>
    </dict>
</dict>
</plist>'''
        
        return plist
    
    def _generate_android_manifest(self, config: StoreConfig) -> str:
        """Generate Android AndroidManifest.xml"""
        
        manifest = f'''<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.{config.app_name.lower().replace(' ', '')}.app">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="{config.app_name}"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/SplashTheme">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>'''
        
        return manifest
    
    def _generate_android_build_gradle(self, config: StoreConfig) -> str:
        """Generate Android build.gradle"""
        
        version_parts = config.version.split('.')
        version_code = int(version_parts[0]) * 10000 + int(version_parts[1]) * 100 + int(version_parts[2])
        
        gradle = f'''android {{
    compileSdkVersion 33
    defaultConfig {{
        applicationId "com.{config.app_name.lower().replace(' ', '')}.app"
        minSdkVersion 21
        targetSdkVersion 33
        versionCode {version_code}
        versionName "{config.version}"
    }}
    buildTypes {{
        release {{
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release
        }}
    }}
}}'''
        
        return gradle
    
    def _generate_build_commands(self, config: StoreConfig) -> str:
        """Generate build commands for both platforms"""
        
        commands = f"""
# 🏗️ Build Commands for {config.app_name}

## iOS Build

### Prerequisites
1. Install Xcode from Mac App Store
2. Install CocoaPods: `sudo gem install cocoapods`

### Build Steps
```bash
# Navigate to iOS folder
cd ios

# Install dependencies
pod install

# Open workspace
open {config.app_name.replace(' ', '')}.xcworkspace

# Build for Archive (in Xcode)
# Product > Archive
# Window > Organizer > Distribute App > App Store Connect
```

### Command Line Build
```bash
# Build release version
xcodebuild -workspace ios/{config.app_name.replace(' ', '')}.xcworkspace \\
           -scheme {config.app_name.replace(' ', '')} \\
           -configuration Release \\
           -archivePath build/{config.app_name.replace(' ', '')}.xcarchive \\
           archive

# Export IPA
xcodebuild -exportArchive \\
           -archivePath build/{config.app_name.replace(' ', '')}.xcarchive \\
           -exportPath build \\
           -exportOptionsPlist ExportOptions.plist
```

## Android Build

### Prerequisites
1. Install Android Studio
2. Install Java JDK 11+
3. Configure signing keys

### Build Steps
```bash
# Navigate to Android folder
cd android

# Clean build
./gradlew clean

# Build release APK
./gradlew assembleRelease

# Build release AAB (for Play Store)
./gradlew bundleRelease

# Output files:
# APK: android/app/build/outputs/apk/release/app-release.apk
# AAB: android/app/build/outputs/bundle/release/app-release.aab
```

### Signing Configuration
```bash
# Generate keystore
keytool -genkey -v -keystore {config.app_name.lower().replace(' ', '')}.keystore \\
        -alias {config.app_name.lower().replace(' ', '')} \\
        -keyalg RSA -keysize 2048 -validity 10000

# Add to android/gradle.properties:
# MYAPP_RELEASE_STORE_FILE={config.app_name.lower().replace(' ', '')}.keystore
# MYAPP_RELEASE_KEY_ALIAS={config.app_name.lower().replace(' ', '')}
# MYAPP_RELEASE_STORE_PASSWORD=****
# MYAPP_RELEASE_KEY_PASSWORD=****
```

## Upload to Stores

### iOS App Store
1. Archive app in Xcode
2. Window > Organizer
3. Select archive > Distribute App
4. Choose "App Store Connect"
5. Follow prompts to upload

### Google Play Store
1. Go to Google Play Console
2. Select your app
3. Production > Create new release
4. Upload AAB file
5. Fill in release details
6. Review and roll out

## Automation with Fastlane

### Install Fastlane
```bash
gem install fastlane
```

### iOS Fastlane
```bash
cd ios
fastlane init
fastlane release
```

### Android Fastlane
```bash
cd android
fastlane init
fastlane release
```
"""
        
        return commands.strip()
    
    def _generate_changelog(self, config: StoreConfig) -> str:
        """Generate changelog"""
        
        changelog = f"""
# Changelog - {config.app_name}

## Version {config.version} (2025-12-03)

### 🎉 Initial Release

**New Features:**
- Complete {config.category.value} functionality
- Intuitive user interface
- Cross-platform support (iOS & Android)
- Cloud synchronization
- Offline mode
- Dark mode support

**Performance:**
- Optimized for speed and efficiency
- Reduced battery consumption
- Minimal storage footprint

**Security:**
- End-to-end encryption
- Secure authentication
- Privacy-first design

**Known Issues:**
- None at this time

**Coming Soon:**
- Additional language support
- Advanced features
- Integration with third-party services

---

For support, visit: https://{config.app_name.lower().replace(' ', '')}.com/support
"""
        
        return changelog.strip()


# Example usage
if __name__ == "__main__":
    config = StoreConfig(
        app_name="TaskMaster Pro",
        app_description="The ultimate productivity app to manage your tasks, projects, and goals efficiently.",
        category=AppCategory.PRODUCTIVITY,
        platforms=StorePlatform.BOTH,
        keywords=["tasks", "todo", "productivity", "planner", "organize"],
        target_audience="Professionals, students, and anyone looking to boost their productivity",
        primary_color="#007AFF",
        version="1.0.0"
    )
    
    generator = StoreGenerator()
    result = generator.generate(config)
    
    print("✅ App Store Metadata:", json.dumps(result.app_store_metadata, indent=2)[:500])
    print("\n✅ Play Store Metadata:", json.dumps(result.play_store_metadata, indent=2)[:500])
    print("\n✅ Privacy Policy:", result.privacy_policy[:300])
    print("\n✅ Icon Exports:", json.dumps(result.icon_exports, indent=2)[:500])
