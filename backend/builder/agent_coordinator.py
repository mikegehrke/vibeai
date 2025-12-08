"""
VibeAI Multi-Agent Coordinator
Orchestriert alle Vibe-Agents (v2, v3, v6) für den Builder
"""

from typing import Dict, List, Optional
import subprocess
import json
import os
import asyncio


class AgentCoordinator:
    """Koordiniert alle Auto-Fix und Build-Agents"""
    
    def __init__(self):
        self.agents = {
            'autofix_v2': '/Users/mikegehrke/dev/vibeai/vibe-autofix',
            'autofix_v3': '/Users/mikegehrke/dev/vibeai/vibe-autofix-v3',
            'swarm_v6': '/Users/mikegehrke/dev/vibeai/vibe-swarm-agent-v6'
        }
        self.active_agents = {}
    
    async def analyze_code(self, code: str, language: str) -> Dict:
        """Analysiert Code mit allen verfügbaren Agents"""
        results = {
            'issues': [],
            'suggestions': [],
            'fixes': []
        }
        
        # Speichere Code temporär
        temp_file = f'/tmp/vibeai_analyze_{language}'
        with open(temp_file, 'w') as f:
            f.write(code)
        
        # Rufe v3 Agent für Analyse auf
        try:
            v3_result = await self._run_autofix_v3(temp_file)
            results['issues'].extend(v3_result.get('errors', []))
            results['suggestions'].extend(v3_result.get('suggestions', []))
        except Exception as e:
            results['issues'].append({
                'type': 'agent_error',
                'message': f'V3 Agent Fehler: {str(e)}'
            })
        
        # Cleanup
        if os.path.exists(temp_file):
            os.remove(temp_file)
        
        return results
    
    async def _run_autofix_v3(self, file_path: str) -> Dict:
        """Führt Auto-Fix V3 Agent aus"""
        agent_dir = self.agents['autofix_v3']
        
        if not os.path.exists(agent_dir):
            return {'errors': [], 'suggestions': []}
        
        try:
            # Führe Node.js Agent aus
            result = subprocess.run(
                ['node', 'cli-agent.js', '--file', file_path],
                cwd=agent_dir,
                capture_output=True,
                timeout=30
            )
            
            if result.stdout:
                output = result.stdout.decode('utf-8')
                # Parse JSON-Output
                try:
                    return json.loads(output)
                except:
                    return {
                        'errors': [],
                        'suggestions': [output]
                    }
            
            return {'errors': [], 'suggestions': []}
            
        except subprocess.TimeoutExpired:
            return {
                'errors': [{
                    'type': 'timeout',
                    'message': 'Agent Timeout nach 30s'
                }]
            }
        except Exception as e:
            return {
                'errors': [{
                    'type': 'execution_error',
                    'message': str(e)
                }]
            }
    
    async def fix_code(self, code: str, language: str, issues: List[Dict]) -> str:
        """Fixiert Code mit Agent-Vorschlägen"""
        
        # Speichere Code temporär
        temp_file = f'/tmp/vibeai_fix_{language}'
        with open(temp_file, 'w') as f:
            f.write(code)
        
        fixed_code = code
        
        try:
            # Versuche Auto-Fix
            result = await self._run_autofix_v3(temp_file)
            
            # Lese gefixten Code
            if os.path.exists(temp_file):
                with open(temp_file, 'r') as f:
                    fixed_code = f.read()
        except Exception as e:
            print(f"Fix-Fehler: {e}")
        finally:
            if os.path.exists(temp_file):
                os.remove(temp_file)
        
        return fixed_code
    
    async def generate_code(
        self, 
        prompt: str, 
        framework: str,
        existing_code: Optional[str] = None
    ) -> Dict:
        """Generiert Code mit Swarm-Agent V6"""
        
        agent_dir = self.agents['swarm_v6']
        
        if not os.path.exists(agent_dir):
            return {
                'success': False,
                'error': 'Swarm Agent V6 nicht gefunden'
            }
        
        try:
            # Erstelle Agent-Config
            config = {
                'prompt': prompt,
                'framework': framework,
                'existing_code': existing_code
            }
            
            config_file = '/tmp/vibeai_swarm_config.json'
            with open(config_file, 'w') as f:
                json.dump(config, f)
            
            # Führe Swarm Agent aus
            result = subprocess.run(
                ['node', 'swarm-agent.js', '--config', config_file],
                cwd=agent_dir,
                capture_output=True,
                timeout=60
            )
            
            if result.stdout:
                output = result.stdout.decode('utf-8')
                try:
                    return json.loads(output)
                except:
                    return {
                        'success': True,
                        'code': output
                    }
            
            return {
                'success': False,
                'error': 'Keine Ausgabe vom Agent'
            }
            
        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'error': 'Swarm Agent Timeout'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
        finally:
            if os.path.exists(config_file):
                os.remove(config_file)
    
    def get_agent_status(self) -> Dict:
        """Gibt Status aller Agents zurück"""
        status = {}
        
        for name, path in self.agents.items():
            status[name] = {
                'available': os.path.exists(path),
                'path': path,
                'active': name in self.active_agents
            }
        
        return status


# Globale Instanz
agent_coordinator = AgentCoordinator()
