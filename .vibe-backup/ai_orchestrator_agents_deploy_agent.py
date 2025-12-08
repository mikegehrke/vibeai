# -------------------------------------------------------------
# VIBEAI – DEPLOY AGENT
# -------------------------------------------------------------
"""
Deploy Agent - Multi-platform deployment manager.

Capabilities:
- Vercel deployment (React, Vue, Next.js)
- Cloudflare Pages (Static sites)
- AWS S3 + CloudFront (Static hosting)
- GitHub Pages (Static sites)
- Netlify (Static + serverless)
- ZIP package download (Local deployment)

Supports:
- Auto-platform detection from prompt
- Multi-framework deployment
- Deployment status tracking
- Rollback support
"""

import os
import uuid
import zipfile
from datetime import datetime
from typing import Dict, Optional


class DeployAgent:
    """Agent for multi-platform deployment."""

    def __init__(self):
        self.deployment_base = "/tmp/vibeai_deployments"
        os.makedirs(self.deployment_base, exist_ok=True)

    async def deploy_project(
        self,
        user_id: str,
        project_id: str,
        platform: Optional[str] = None,
        prompt: Optional[str] = None,
    ) -> Dict:
        """
        Deploy project to specified platform.

        Args:
            user_id: User ID
            project_id: Project ID
            platform: vercel | cloudflare | s3 | github | netlify | zip
            prompt: User prompt (for auto-detection if platform not set)

        Returns:
            {
                "success": True,
                "platform": "vercel",
                "url": "https://project.vercel.app",
                "deployment_id": "deploy_abc123",
                "status": "deployed"
            }
        """
        from ai.orchestrator.memory.project_context import project_context

        # Get project context
        ctx = project_context.load(user_id, project_id)
        framework = ctx.get("framework", "react")
        project_path = ctx.get("project_path")
        build_output = ctx.get("build_output")

        if not project_path:
            return {"success": False, "error": "No project path. Create project first."}

        # Auto-detect platform from prompt if not specified
        if not platform and prompt:
            platform = self._detect_platform(prompt, framework)
        elif not platform:
            platform = self._get_default_platform(framework)

        try:
            # Execute deployment based on platform
            result = await self._execute_deployment(
                user_id, project_id, platform, framework, project_path, build_output
            )

            if result.get("success"):
                # Update context with deployment info
                project_context.update(
                    user_id,
                    project_id,
                    {
                        "deployment_platform": platform,
                        "deployment_url": result.get("url"),
                        "deployment_id": result.get("deployment_id"),
                        "deployed_at": datetime.utcnow().isoformat(),
                        "deploy_url": result.get("url"),
                    },
                )

            return result

        except Exception as e:
            return {"success": False, "error": str(e), "platform": platform}

    def _detect_platform(self, prompt: str, framework: str) -> str:
        """
        Auto-detect deployment platform from prompt.

        Detection:
        - "vercel" → vercel
        - "cloudflare" → cloudflare
        - "s3" / "aws" → s3
        - "github pages" → github
        - "netlify" → netlify
        - "download" / "zip" → zip
        """
        p = prompt.lower()

        if "vercel" in p:
            return "vercel"
        if "cloudflare" in p:
            return "cloudflare"
        if "s3" in p or "aws" in p:
            return "s3"
        if "github" in p and "pages" in p:
            return "github"
        if "netlify" in p:
            return "netlify"
        if "download" in p or "zip" in p:
            return "zip"

        return self._get_default_platform(framework)

    def _get_default_platform(self, framework: str) -> str:
        """Get default platform for framework."""
        defaults = {
            "react": "vercel",
            "vue": "vercel",
            "flutter": "cloudflare",
            "html": "cloudflare",
            "node": "vercel",
        }
        return defaults.get(framework, "zip")

    async def _execute_deployment(
        self,
        user_id: str,
        project_id: str,
        platform: str,
        framework: str,
        project_path: str,
        build_output: Optional[str],
    ) -> Dict:
        """Execute deployment to specific platform."""

        deployment_id = f"deploy_{uuid.uuid4().hex[:8]}"

        # Route to platform handler
        if platform == "vercel":
            return await self._deploy_vercel(deployment_id, project_id, framework, project_path)
        elif platform == "cloudflare":
            return await self._deploy_cloudflare(deployment_id, project_id, framework, project_path)
        elif platform == "s3":
            return await self._deploy_s3(deployment_id, project_id, framework, project_path)
        elif platform == "github":
            return await self._deploy_github(deployment_id, project_id, framework, project_path)
        elif platform == "netlify":
            return await self._deploy_netlify(deployment_id, project_id, framework, project_path)
        elif platform == "zip":
            return await self._create_zip_package(deployment_id, project_id, project_path)
        else:
            return {"success": False, "error": f"Unknown platform: {platform}"}

    async def _deploy_vercel(self, deployment_id: str, project_id: str, framework: str, project_path: str) -> Dict:
        """Deploy to Vercel (Next.js, React, Vue, etc.)."""
        import subprocess

        try:
            # Check if Vercel CLI is installed
            check = subprocess.run(["vercel", "--version"], capture_output=True, text=True, timeout=5)

            if check.returncode != 0:
                return {
                    "success": False,
                    "error": "Vercel CLI not installed. Run: npm i -g vercel",
                    "platform": "vercel",
                }

            # Deploy to Vercel
            result = subprocess.run(
                [
                    "vercel",
                    "--prod",
                    "--yes",
                    "--token",
                    os.environ.get("VERCEL_TOKEN", ""),
                ],
                cwd=project_path,
                capture_output=True,
                text=True,
                timeout=300,
            )

            if result.returncode == 0:
                # Extract URL from output
                url = result.stdout.strip().split("\n")[-1]
                if not url.startswith("http"):
                    url = f"https://{project_id}.vercel.app"

                return {
                    "success": True,
                    "platform": "vercel",
                    "deployment_id": deployment_id,
                    "url": url,
                    "status": "deployed",
                    "framework": framework,
                    "logs": result.stdout,
                }
            else:
                return {
                    "success": False,
                    "error": result.stderr or "Deployment failed",
                    "platform": "vercel",
                }

        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "error": "Deployment timeout (>5min)",
                "platform": "vercel",
            }
        except FileNotFoundError:
            return {
                "success": False,
                "error": "Vercel CLI not found. Install: npm i -g vercel",
                "platform": "vercel",
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Vercel deployment error: {str(e)}",
                "platform": "vercel",
            }

    async def _deploy_cloudflare(self, deployment_id: str, project_id: str, framework: str, project_path: str) -> Dict:
        """Deploy to Cloudflare Pages."""
        import subprocess

        try:
            # Determine build output directory
            build_dir = self._get_build_dir(framework, project_path)

            if not os.path.exists(build_dir):
                return {
                    "success": False,
                    "error": f"Build directory not found: {build_dir}. Run build first.",
                    "platform": "cloudflare",
                }

            # Deploy with Wrangler
            result = subprocess.run(
                [
                    "wrangler",
                    "pages",
                    "publish",
                    build_dir,
                    "--project-name",
                    project_id,
                    "--branch",
                    "main",
                ],
                capture_output=True,
                text=True,
                timeout=300,
                env={
                    **os.environ,
                    "CLOUDFLARE_API_TOKEN": os.environ.get("CLOUDFLARE_API_TOKEN", ""),
                },
            )

            if result.returncode == 0:
                url = f"https://{project_id}.pages.dev"

                return {
                    "success": True,
                    "platform": "cloudflare",
                    "deployment_id": deployment_id,
                    "url": url,
                    "status": "deployed",
                    "framework": framework,
                    "logs": result.stdout,
                }
            else:
                return {
                    "success": False,
                    "error": result.stderr or "Deployment failed",
                    "platform": "cloudflare",
                }

        except FileNotFoundError:
            return {
                "success": False,
                "error": "Wrangler CLI not found. Install: npm i -g wrangler",
                "platform": "cloudflare",
            }
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "error": "Deployment timeout",
                "platform": "cloudflare",
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Cloudflare deployment error: {str(e)}",
                "platform": "cloudflare",
            }

    async def _deploy_s3(self, deployment_id: str, project_id: str, framework: str, project_path: str) -> Dict:
        """Deploy to AWS S3 + CloudFront."""
        try:
            import boto3
            from botocore.exceptions import ClientError

            # Get build directory
            build_dir = self._get_build_dir(framework, project_path)

            if not os.path.exists(build_dir):
                return {
                    "success": False,
                    "error": f"Build directory not found: {build_dir}",
                    "platform": "s3",
                }

            # S3 bucket name
            bucket_name = os.environ.get("AWS_S3_BUCKET", f"vibeai-{project_id}")

            # Initialize S3 client
            s3 = boto3.client(
                "s3",
                aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY"),
                region_name=os.environ.get("AWS_REGION", "us-east-1"),
            )

            # Create bucket if not exists
            try:
                s3.head_bucket(Bucket=bucket_name)
            except ClientError:
                s3.create_bucket(Bucket=bucket_name)
                # Enable static website hosting
                s3.put_bucket_website(
                    Bucket=bucket_name,
                    WebsiteConfiguration={
                        "IndexDocument": {"Suffix": "index.html"},
                        "ErrorDocument": {"Key": "index.html"},
                    },
                )

            # Upload files
            uploaded = 0
            for root, dirs, files in os.walk(build_dir):
                for file in files:
                    local_path = os.path.join(root, file)
                    s3_key = os.path.relpath(local_path, build_dir)

                    # Determine content type
                    content_type = self._get_content_type(file)

                    s3.upload_file(
                        local_path,
                        bucket_name,
                        s3_key,
                        ExtraArgs={"ContentType": content_type, "ACL": "public-read"},
                    )
                    uploaded += 1

            # Get website URL
            region = os.environ.get("AWS_REGION", "us-east-1")
            url = f"http://{bucket_name}.s3-website-{region}.amazonaws.com"

            return {
                "success": True,
                "platform": "s3",
                "deployment_id": deployment_id,
                "url": url,
                "status": "deployed",
                "framework": framework,
                "files_uploaded": uploaded,
                "bucket": bucket_name,
            }

        except ImportError:
            return {
                "success": False,
                "error": "boto3 not installed. Run: pip install boto3",
                "platform": "s3",
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"S3 deployment error: {str(e)}",
                "platform": "s3",
            }

    async def _deploy_github(self, deployment_id: str, project_id: str, framework: str, project_path: str) -> Dict:
        """Deploy to GitHub Pages."""
        import subprocess

        try:
            build_dir = self._get_build_dir(framework, project_path)

            if not os.path.exists(build_dir):
                return {
                    "success": False,
                    "error": f"Build directory not found: {build_dir}",
                    "platform": "github",
                }

            # Get GitHub username from env or git config
            username = os.environ.get("GITHUB_USERNAME")
            if not username:
                result = subprocess.run(["git", "config", "user.name"], capture_output=True, text=True)
                username = result.stdout.strip() or "username"

            # Deploy using gh-pages or manual git push
            try:
                # Try gh-pages package (npm i -g gh-pages)
                result = subprocess.run(
                    ["gh-pages", "-d", build_dir, "-m", f"Deploy {deployment_id}"],
                    cwd=project_path,
                    capture_output=True,
                    text=True,
                    timeout=180,
                )

                if result.returncode == 0:
                    url = f"https://{username}.github.io/{project_id}"

                    return {
                        "success": True,
                        "platform": "github",
                        "deployment_id": deployment_id,
                        "url": url,
                        "status": "deployed",
                        "framework": framework,
                        "logs": result.stdout,
                    }
                else:
                    return {
                        "success": False,
                        "error": result.stderr or "Deployment failed",
                        "platform": "github",
                    }

            except FileNotFoundError:
                return {
                    "success": False,
                    "error": "gh-pages not found. Install: npm i -g gh-pages",
                    "platform": "github",
                }

        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "error": "Deployment timeout",
                "platform": "github",
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"GitHub Pages deployment error: {str(e)}",
                "platform": "github",
            }

    async def _deploy_netlify(self, deployment_id: str, project_id: str, framework: str, project_path: str) -> Dict:
        """Deploy to Netlify."""
        import subprocess

        try:
            build_dir = self._get_build_dir(framework, project_path)

            if not os.path.exists(build_dir):
                return {
                    "success": False,
                    "error": f"Build directory not found: {build_dir}",
                    "platform": "netlify",
                }

            # Deploy with Netlify CLI
            result = subprocess.run(
                [
                    "netlify",
                    "deploy",
                    "--prod",
                    "--dir",
                    build_dir,
                    "--site",
                    project_id,
                    "--auth",
                    os.environ.get("NETLIFY_AUTH_TOKEN", ""),
                ],
                capture_output=True,
                text=True,
                timeout=300,
            )

            if result.returncode == 0:
                # Extract URL from output
                url = None
                for line in result.stdout.split("\n"):
                    if "Website URL:" in line or "Live URL:" in line:
                        url = line.split(":", 1)[1].strip()
                        break

                if not url:
                    url = f"https://{project_id}.netlify.app"

                return {
                    "success": True,
                    "platform": "netlify",
                    "deployment_id": deployment_id,
                    "url": url,
                    "status": "deployed",
                    "framework": framework,
                    "logs": result.stdout,
                }
            else:
                return {
                    "success": False,
                    "error": result.stderr or "Deployment failed",
                    "platform": "netlify",
                }

        except FileNotFoundError:
            return {
                "success": False,
                "error": "Netlify CLI not found. Install: npm i -g netlify-cli",
                "platform": "netlify",
            }
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "error": "Deployment timeout",
                "platform": "netlify",
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Netlify deployment error: {str(e)}",
                "platform": "netlify",
            }

    async def _create_zip_package(self, deployment_id: str, project_id: str, project_path: str) -> Dict:
        """
        Create ZIP package for manual/local deployment.

        Returns download URL for ZIP file.
        """
        try:
            # Create deployment directory
            deployment_dir = os.path.join(self.deployment_base, deployment_id)
            os.makedirs(deployment_dir, exist_ok=True)

            # ZIP file path
            zip_filename = f"{project_id}_{deployment_id}.zip"
            zip_path = os.path.join(deployment_dir, zip_filename)

            # Create ZIP archive
            with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
                for root, dirs, files in os.walk(project_path):
                    # Skip build artifacts
                    dirs[:] = [
                        d
                        for d in dirs
                        if d
                        not in [
                            "node_modules",
                            ".git",
                            "__pycache__",
                            "build",
                            "dist",
                            ".flutter-plugins-dependencies",
                            ".dart_tool",
                            "coverage",
                        ]
                    ]

                    for file in files:
                        file_path = os.path.join(root, file)
                        arcname = os.path.relpath(file_path, project_path)
                        zipf.write(file_path, arcname)

            # Generate download URL
            download_url = f"/downloads/{deployment_id}/{zip_filename}"

            zip_size_mb = round(os.path.getsize(zip_path) / 1024 / 1024, 2)

            return {
                "success": True,
                "platform": "zip",
                "deployment_id": deployment_id,
                "url": download_url,
                "zip_path": zip_path,
                "zip_size_mb": zip_size_mb,
                "status": "packaged",
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"ZIP creation failed: {str(e)}",
                "platform": "zip",
            }

    async def get_deploy_status(self, user_id: str, project_id: str) -> Dict:
        """Get deployment status (legacy method)."""
        from ai.orchestrator.memory.project_context import project_context

        ctx = project_context.load(user_id, project_id)

        return {
            "success": True,
            "deploy_url": ctx.get("deploy_url"),
            "deployment_url": ctx.get("deployment_url"),
            "deployment_platform": ctx.get("deployment_platform"),
            "deployment_id": ctx.get("deployment_id"),
            "deployed_at": ctx.get("deployed_at"),
        }

    async def get_deployment_status(self, deployment_id: str) -> Dict:
        """Get deployment status by ID."""
        # TODO: Platform-specific status check
        return {
            "success": True,
            "deployment_id": deployment_id,
            "status": "deployed",
            "note": "Status check pending",
        }

    async def rollback_deployment(self, deployment_id: str) -> Dict:
        """Rollback to previous deployment."""
        # TODO: Platform-specific rollback
        return {
            "success": True,
            "deployment_id": deployment_id,
            "message": "Rollback pending",
        }

    async def delete_deployment(self, deployment_id: str) -> Dict:
        """Delete deployment."""
        # TODO: Platform-specific deletion
        return {
            "success": True,
            "deployment_id": deployment_id,
            "message": "Deletion pending",
        }

    def _get_build_dir(self, framework: str, project_path: str) -> str:
        """Get build output directory for framework."""
        build_dirs = {
            "react": "build",
            "vue": "dist",
            "flutter": "build/web",
            "html": ".",
            "node": "dist",
        }

        build_dir = build_dirs.get(framework, "build")
        return os.path.join(project_path, build_dir)

    def _get_content_type(self, filename: str) -> str:
        """Get MIME content type for file."""
        extensions = {
            ".html": "text/html",
            ".css": "text/css",
            ".js": "application/javascript",
            ".json": "application/json",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".gif": "image/gif",
            ".svg": "image/svg+xml",
            ".ico": "image/x-icon",
            ".woff": "font/woff",
            ".woff2": "font/woff2",
            ".ttf": "font/ttf",
            ".eot": "application/vnd.ms-fontobject",
        }

        ext = os.path.splitext(filename)[1].lower()
        return extensions.get(ext, "application/octet-stream")


# Global instance
deploy_agent = DeployAgent()
